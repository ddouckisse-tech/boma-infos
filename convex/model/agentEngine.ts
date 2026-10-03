/**
 * What the eight agents actually compute — CDC §4.6.
 *
 * Runtime-agnostic on purpose: no Convex import, no Next import, no network
 * call. The Convex action in `convex/agentRuntime.ts` feeds it a context,
 * calls Claude, and hands the answer back here to be parsed. The same file
 * also holds the **offline stand-in** used when no API key is configured.
 *
 * ## Why an offline stand-in rather than an error
 *
 * `ANTHROPIC_API_KEY` is empty on this deployment: the client will fill it
 * in. Until then the chain has to keep working — CDC §4.6 requires a "repli
 * manuel toujours disponible", and a back office that throws because a model
 * is unreachable is the opposite of that. So each agent has a rule-based
 * fallback which produces real, usable proposals (the French typography
 * pass, for instance, is genuinely correct: it applies the rules rather than
 * guessing them) and every one of them is tagged `simulation` end to end —
 * in the run row, on the card, in the journal. Nothing is ever passed off
 * as a model answer.
 *
 * Switching to the real thing is setting the key. No code changes.
 *
 * The watch agent is the one exception to "produces real proposals offline":
 * searching the web without a model is not something a rule can imitate, and
 * a made-up news item is the last thing a newsroom needs. Offline, it reports
 * what it *can* compute — which sections have published nothing lately — and
 * hands over the searches to run by hand. It never invents a lead.
 */

import type { AgentKey } from "./agents";
import {
  formatLead,
  leadKey,
  readLeads,
  RELIABILITY_LABEL,
  verifyLeads,
  WATCH_DOMAINS,
} from "./watch";

/* -------------------------------------------------------------------------
   Contracts
   ------------------------------------------------------------------------- */

export type AgentContext = {
  readonly title: string;
  readonly dek: string;
  readonly bodyText: string;
  /** Text-bearing blocks, numbered: agent 1 proposes one fix per block. */
  readonly blocks?: readonly { index: number; type: string; text: string }[];
  readonly categoryName: string;
  readonly tags: readonly string[];
  readonly slug?: string;
  readonly metaDescription?: string;
  /** Headlines of the existing corpus — internal linking and duplicates. */
  readonly corpus?: readonly { slug: string; title: string }[];
  /** Media: key, caption, credit. */
  readonly mediaKey?: string;
  readonly mediaCaption?: string;
  readonly mediaCredit?: string;
  /** Company deposit: declared kind and depositor. */
  readonly submissionKind?: string;
  readonly organizationName?: string;
  /** Publication URL, for the social variants. */
  readonly url?: string;
  /** Interview: raw notes or transcript to structure. */
  readonly transcriptSource?: string;
  /** Newsletter: the week's published pieces. */
  readonly weekArticles?: readonly {
    slug: string;
    title: string;
    dek: string;
  }[];
  /** Watch: the domain to search and what the newsroom already covers. */
  readonly watch?: WatchContext;
};

export type WatchContext = {
  readonly domainKey: string;
  readonly domainLabel: string;
  readonly focus: string;
  readonly queries: readonly string[];
  /** `AAAA-MM-JJ`, as the newsroom reads the calendar. */
  readonly today: string;
  /** How many days back a lead may go. */
  readonly days: number;
  /** Sections a lead may be filed under. */
  readonly sections: readonly { slug: string; name: string }[];
  /** When each top-level section last published — the offline stand-in. */
  readonly coverage: readonly {
    slug: string;
    name: string;
    lastPublishedAt: number | null;
  }[];
  readonly now: number;
};

export type AgentProposal = {
  /** Machine-readable target: `title`, `dek`, `seo.slug`, `alt`, `social.linkedin`… */
  readonly field: string;
  readonly label: string;
  readonly rationale: string;
  readonly current?: string;
  readonly proposed: string;
  /**
   * What identifies "the same proposal again" when its wording changes from
   * one run to the next — a watch lead is recognised by its first source,
   * not by the sentence that summarises it. Defaults to `proposed`.
   */
  readonly key?: string;
};

export type AgentOutcome = {
  readonly summary: string;
  readonly proposals: readonly AgentProposal[];
  /** Free-form JSON for outputs that are not a list of edits. */
  readonly payload?: string;
};

/* -------------------------------------------------------------------------
   Cost
   ------------------------------------------------------------------------- */

/** US dollars per million tokens. One micro-dollar per token per $1/MTok. */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-fable-5-1": { input: 10, output: 50 },
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

/**
 * A web search is billed on top of the tokens it brings back: 10 US dollars
 * per thousand searches, that is 10 000 micro-dollars each. Only the watch
 * agent searches; its runs are charged to the same monthly cap as the rest.
 */
export const WEB_SEARCH_MICROS = 10_000;

export function costMicros(
  model: string,
  inputTokens: number,
  outputTokens: number,
  webSearches = 0
): number {
  const price = PRICING[model] ?? PRICING["claude-sonnet-5"];
  return Math.round(
    inputTokens * price.input +
      outputTokens * price.output +
      webSearches * WEB_SEARCH_MICROS
  );
}

/* -------------------------------------------------------------------------
   French typography — the rules agent 1 applies
   ------------------------------------------------------------------------- */

/** U+202F, narrow no-break space: the correct one before ; : ! ? and in « ». */
const NNBSP = "\u202F";
/** U+00A0, no-break space. */
const NBSP = "\u00A0";

const ACCENTED_CAPS: readonly [RegExp, string][] = [
  [/\bEtat\b/g, "État"],
  [/\bEtats\b/g, "États"],
  [/\bEconomie\b/g, "Économie"],
  [/\bEconomique\b/g, "Économique"],
  [/\bEquipe\b/g, "Équipe"],
  [/\bEtude\b/g, "Étude"],
  [/\bEmission\b/g, "Émission"],
  [/\bElection\b/g, "Élection"],
  [/\bEvolution\b/g, "Évolution"],
  [/\bEnergie\b/g, "Énergie"],
  [/\bAout\b/g, "Août"],
  [/\bIle\b/g, "Île"],
];

export function frenchTypography(input: string): string {
  let text = input;

  // Guillemets droits → guillemets français, avec leurs espaces fines.
  text = text.replace(/"([^"]+)"/g, (_match, inner: string) => {
    return `«${NNBSP}${inner.trim()}${NNBSP}»`;
  });

  // Espace fine insécable avant ; : ! ? — et une seule.
  text = text.replace(/\s*([;:!?])/g, (_match, mark: string) => {
    // Attention aux « http:// » et aux heures « 14:30 ».
    return `${NNBSP}${mark}`;
  });
  text = text.replace(new RegExp(`${NNBSP}:(//)`, "g"), ":$1");
  text = text.replace(new RegExp(`(\\d)${NNBSP}:(\\d)`, "g"), "$1:$2");

  // Espaces à l'intérieur des guillemets déjà français.
  text = text.replace(/«\s*/g, `«${NNBSP}`).replace(/\s*»/g, `${NNBSP}»`);

  // Points de suspension.
  text = text.replace(/\.{3}/g, "…");

  // Espace insécable devant les unités monétaires et les pourcentages.
  text = text.replace(
    /(\d)\s+(%|€|\$|FCFA|milliards?|millions?)/g,
    `$1${NBSP}$2`
  );

  for (const [pattern, replacement] of ACCENTED_CAPS) {
    text = text.replace(pattern, replacement);
  }

  // Apostrophe typographique.
  text = text.replace(/(\w)'(\w)/g, "$1’$2");

  return text;
}

/* -------------------------------------------------------------------------
   Prompts
   ------------------------------------------------------------------------- */

const HOUSE_STYLE = `Tu assistes la rédaction de BOMA Infos, média gabonais d'information générale : il couvre toute l'actualité du Gabon — politique, économie, société, tourisme, environnement, culture, sport.
Style maison : français soutenu mais direct, phrases courtes, pas de superlatif publicitaire, faits datés et chiffres sourcés, typographie française stricte (espace fine insécable avant ; : ! ?, guillemets « », capitales accentuées).
Ligne éditoriale : l'exactitude d'abord, et la neutralité — en politique plus qu'ailleurs : ni jugement, ni rumeur, ni propos prêté à quelqu'un sans source nommée.
Tu PROPOSES. Tu ne publies jamais, tu ne modifies jamais un contenu, tu ne refuses jamais un dépôt. Un humain valide chacune de tes propositions.
Réponds UNIQUEMENT par un objet JSON, sans texte autour et sans bloc de code.`;

const JSON_SHAPE = `{"summary":"une phrase en français","proposals":[{"field":"…","label":"…","rationale":"…","proposed":"…"}]}`;

/** The watch answers with leads, not with edits to a text. */
const WATCH_SHAPE = `{"summary":"une phrase en français","leads":[{"title":"titre de travail, 90 caractères au plus","summary":"les faits, en deux ou trois phrases","why":"pourquoi maintenant, pour un lecteur du Gabon","rubrique":"un slug de la liste fournie","sources":[{"title":"titre de la page","url":"https://…","date":"AAAA-MM-JJ"}]}]}`;

/** A lead older than this is history, not news. */
export const WATCH_DAYS = 7;

/** A section silent for longer than this is reported by the offline watch. */
const WATCH_STALE_DAYS = 7;

export function buildPrompt(
  agent: AgentKey,
  context: AgentContext
): { system: string; user: string } {
  const base = [
    `Titre actuel : ${context.title}`,
    `Chapô actuel : ${context.dek || "(vide)"}`,
    `Rubrique : ${context.categoryName}`,
    context.tags.length > 0 ? `Mots-clés : ${context.tags.join(", ")}` : "",
    "",
    "Corps :",
    context.bodyText.slice(0, 12_000),
  ]
    .filter(Boolean)
    .join("\n");

  switch (agent) {
    case "relecture": {
      const numbered = (context.blocks ?? [])
        .map((block) => `[${block.index}] (${block.type}) ${block.text}`)
        .join("\n");
      return {
        system: `${HOUSE_STYLE}\nSchéma : ${JSON_SHAPE}\nChamps autorisés : "title", "dek", et "body.N" où N est le numéro du bloc.\nUne entrée par élément fautif, et rien pour les éléments corrects. "proposed" contient le texte corrigé COMPLET de cet élément, pas un diff.`,
        user: `Relis ce texte : orthographe, grammaire, typographie française, style maison. Ne réécris pas le fond ; ne corrige que ce qui est fautif.\n\nTitre : ${context.title}\nChapô : ${context.dek || "(vide)"}\nRubrique : ${context.categoryName}\n\nBlocs du corps :\n${numbered || context.bodyText.slice(0, 12_000)}`,
      };
    }

    case "titraille":
      return {
        system: `${HOUSE_STYLE}\nSchéma : ${JSON_SHAPE}\nChamps autorisés : "title" (trois propositions, donc trois entrées), "dek", "social.accroche", "seo.description".\nUn titre fait au plus 80 caractères, une méta-description au plus 155.`,
        user: `Propose trois titres, un chapô, une accroche pour les réseaux et une méta-description.\n\n${base}`,
      };

    case "seo": {
      const corpus = (context.corpus ?? [])
        .slice(0, 60)
        .map((item) => `- ${item.title} (/article/${item.slug})`)
        .join("\n");
      return {
        system: `${HOUSE_STYLE}\nSchéma : ${JSON_SHAPE}\nChamps autorisés : "seo.slug", "seo.description", "seo.keywords" (liste séparée par des virgules), "seo.links" (une entrée par lien interne, au format "libellé|/article/slug").`,
        user: `Optimise le référencement de cet article et repère dans le fonds ci-dessous les articles à lier (maillage interne).\n\n${base}\n\nFonds disponible :\n${corpus}`,
      };
    }

    case "media":
      return {
        system: `${HOUSE_STYLE}\nSchéma : ${JSON_SHAPE}\nChamps autorisés : "alt", "caption".\nUn texte alternatif décrit ce que montre l'image, en une phrase, sans « photo de », et fait au plus 125 caractères.`,
        user: `Propose un texte alternatif et une légende pour cette photographie.\nIdentifiant : ${context.mediaKey}\nLégende actuelle : ${context.mediaCaption || "(vide)"}\nCrédit : ${context.mediaCredit || "(inconnu)"}\nContexte éditorial : ${context.title}`,
      };

    case "moderation": {
      const corpus = (context.corpus ?? [])
        .slice(0, 60)
        .map((item) => `- ${item.title}`)
        .join("\n");
      return {
        system: `${HOUSE_STYLE}\nSchéma : ${JSON_SHAPE}\nChamps autorisés : "moderation.score" (0 à 100), "moderation.publiredactionnel" (oui/non + justification), "moderation.allegations" (une entrée par allégation à vérifier), "moderation.doublon", "moderation.avis".\nTu ne décides pas : tu prépares la décision du rédacteur en chef.`,
        user: `Pré-qualifie ce dépôt d'entreprise.\nEntreprise : ${context.organizationName}\nType déclaré : ${context.submissionKind}\n\n${base}\n\nTitres déjà publiés (détection de doublon) :\n${corpus}`,
      };
    }

    case "diffusion": {
      // Deux missions pour le même agent (§4.6) : décliner un article, et
      // composer l'hebdomadaire. La présence de `weekArticles` tranche.
      if (context.weekArticles && context.weekArticles.length > 0) {
        const week = context.weekArticles
          .map(
            (item) => `- ${item.title} (/article/${item.slug}) — ${item.dek}`
          )
          .join("\n");
        return {
          system: `${HOUSE_STYLE}\nSchéma : ${JSON_SHAPE}\nChamps autorisés : "newsletter.subject", "newsletter.intro", et "newsletter.item.<slug>" pour chaque article retenu.\nL'objet fait au plus 70 caractères. Le chapeau fait trois lignes.`,
          user: `Compose la newsletter hebdomadaire à partir des articles publiés cette semaine. N'invente aucun sujet.\n\n${week}`,
        };
      }
      return {
        system: `${HOUSE_STYLE}\nSchéma : ${JSON_SHAPE}\nChamps autorisés : "social.linkedin", "social.whatsapp", "social.facebook".\nLinkedIn : trois à cinq lignes, ton professionnel, pas d'émoji. WhatsApp : deux lignes, une seule idée, le lien à la fin. Facebook : deux à trois lignes.`,
        user: `Décline cet article pour LinkedIn, WhatsApp et Facebook. Lien : ${context.url ?? ""}\n\n${base}`,
      };
    }

    case "transcription":
      return {
        system: `${HOUSE_STYLE}\nSchéma : ${JSON_SHAPE}\nChamps autorisés : "transcript" (texte horodaté) et "interview" (trame questions/réponses prête à éditer).`,
        user: `Structure cette prise de son d'interview en texte horodaté puis en trame questions/réponses pour la rubrique Interview.\n\nSujet : ${context.title}\n\nMatière :\n${(context.transcriptSource ?? context.bodyText).slice(0, 12_000)}`,
      };

    case "veille": {
      const watch = context.watch;
      const sections = (watch?.sections ?? [])
        .map((section) => `- ${section.slug} : ${section.name}`)
        .join("\n");
      const published = (context.corpus ?? [])
        .slice(0, 60)
        .map((item) => `- ${item.title}`)
        .join("\n");
      return {
        system: `${HOUSE_STYLE}
Tu fais la veille de l'actualité du Gabon pour la rédaction. Tu disposes d'un outil de recherche web : sers-t'en, ne réponds jamais de mémoire.
Règles de la veille :
- Ne retiens que des faits datés des ${watch?.days ?? WATCH_DAYS} derniers jours, qui concernent le Gabon et le domaine demandé.
- Chaque piste s'appuie sur au moins une page que tu as réellement trouvée pendant cette recherche : donne son adresse exacte, telle que la recherche te l'a rendue. N'invente ni source, ni citation, ni chiffre. Quand deux sites indépendants confirment le fait, cite les deux.
- Sépare les faits de leurs commentaires. Écarte les rumeurs, les contenus promotionnels et ce que la rédaction a déjà publié (liste fournie).
- Une piste est une proposition d'angle pour un journaliste, pas un article : tu ne rédiges pas l'article.
- Si la recherche ne donne rien de solide, renvoie une liste vide. Aucune piste vaut mieux qu'une piste fragile.
Schéma : ${WATCH_SHAPE}
Cinq pistes au plus, de la plus importante à la moins importante.`,
        user: `Date du jour : ${watch?.today ?? ""}.
Domaine : ${watch?.domainLabel ?? "Tour d'horizon"} — ${watch?.focus ?? ""}.

Rubriques disponibles (slug : nom) :
${sections || "(aucune)"}

Déjà publié par la rédaction, à ne pas reproposer :
${published || "(rien)"}

Cherche l'actualité des ${watch?.days ?? WATCH_DAYS} derniers jours et propose des pistes de sujets.`,
      };
    }
  }
}

/* -------------------------------------------------------------------------
   Parsing
   ------------------------------------------------------------------------- */

type RawProposal = {
  field?: unknown;
  label?: unknown;
  rationale?: unknown;
  proposed?: unknown;
};

const asString = (value: unknown): string =>
  typeof value === "string" ? value : value == null ? "" : String(value);

/**
 * Tolerant JSON extraction.
 *
 * The prompt asks for bare JSON, but a model occasionally wraps it in a
 * fenced block or prefixes a sentence. Failing the whole run over a
 * backtick would be silly; failing silently would be worse, so anything
 * genuinely unparseable throws and the run is recorded as `failed`.
 */
function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Réponse de l'agent illisible : aucun objet JSON.");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
}

export function parseOutcome(agent: AgentKey, text: string): AgentOutcome {
  const parsed = extractJson(text) as {
    summary?: unknown;
    proposals?: unknown;
  };

  const proposals: AgentProposal[] = Array.isArray(parsed.proposals)
    ? (parsed.proposals as RawProposal[])
        .map((item) => ({
          field: asString(item.field) || "note",
          label: asString(item.label) || "Proposition",
          rationale: asString(item.rationale),
          proposed: asString(item.proposed),
        }))
        .filter((item) => item.proposed.trim() !== "")
    : [];

  return {
    summary: asString(parsed.summary) || `Proposition de l'agent ${agent}.`,
    proposals,
  };
}

/**
 * Reads the answer of a watch run.
 *
 * `retrieved` is every address the search tool handed back during the run.
 * A source the answer cites but the search never returned is removed, and a
 * lead left without any source is dropped (`verifyLeads`): what reaches the
 * newsroom is what was found, not what was written.
 */
export function parseWatch(
  text: string,
  retrieved: readonly string[],
  context: AgentContext
): AgentOutcome {
  const parsed = extractJson(text) as { summary?: unknown; leads?: unknown };
  const { leads, dropped } = verifyLeads(readLeads(parsed.leads), retrieved);

  const sections = new Set(
    (context.watch?.sections ?? []).map((section) => section.slug)
  );
  const fallbackSection =
    context.watch && sections.has(context.watch.domainKey)
      ? context.watch.domainKey
      : "";

  const proposals: AgentProposal[] = leads.slice(0, 5).map((found) => {
    const lead = {
      ...found,
      rubrique: sections.has(found.rubrique) ? found.rubrique : fallbackSection,
    };
    const count = lead.sources.length;
    return {
      field: "veille.piste",
      label: lead.title,
      rationale: `${RELIABILITY_LABEL[lead.reliability]} · ${count} source${count > 1 ? "s" : ""} retrouvée${count > 1 ? "s" : ""} par la recherche.`,
      proposed: formatLead(lead),
      key: leadKey(lead),
    };
  });

  const found =
    proposals.length === 0
      ? "Aucune piste solide sur la période."
      : `${proposals.length} piste${proposals.length > 1 ? "s" : ""} sourcée${proposals.length > 1 ? "s" : ""}.`;
  const summary = asString(parsed.summary) || found;
  return {
    summary:
      dropped > 0
        ? `${summary} — ${dropped} piste${dropped > 1 ? "s" : ""} écartée${dropped > 1 ? "s" : ""} : source introuvable dans les résultats de la recherche.`
        : summary,
    proposals,
  };
}

/* -------------------------------------------------------------------------
   Offline stand-in
   ------------------------------------------------------------------------- */

const stripMarkup = (value: string): string =>
  value
    .replace(/\*\*|\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^##\s+/gm, "");

const firstSentence = (value: string): string => {
  const clean = stripMarkup(value).replace(/\s+/g, " ").trim();
  const stop = clean.search(/[.!?]\s/);
  return stop === -1 ? clean.slice(0, 180) : clean.slice(0, stop + 1);
};

const STOPWORDS = new Set([
  "le",
  "la",
  "les",
  "de",
  "des",
  "du",
  "un",
  "une",
  "et",
  "en",
  "à",
  "au",
  "aux",
  "pour",
  "par",
  "sur",
  "dans",
  "que",
  "qui",
  "est",
  "sont",
  "ce",
  "cette",
  "ces",
  "son",
  "sa",
  "ses",
  "avec",
  "plus",
  "dont",
  "ne",
  "pas",
  "se",
  "il",
  "elle",
  "nous",
  "vous",
  "ils",
  "leur",
  "leurs",
  "mais",
  "ou",
  "où",
  "comme",
  "tout",
  "tous",
  "toute",
  "toutes",
  "entre",
  "sans",
  "été",
  "être",
  "avoir",
  "fait",
  "faire",
  "dit",
  "selon",
  "depuis",
]);

function keywords(text: string, count: number): string[] {
  const tally = new Map<string, number>();
  for (const word of stripMarkup(text)
    .toLowerCase()
    .replace(/[^a-zàâäçéèêëîïôöùûüÿœ\s-]/g, " ")
    .split(/\s+/)) {
    if (word.length < 5 || STOPWORDS.has(word)) continue;
    tally.set(word, (tally.get(word) ?? 0) + 1);
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

const PROMOTIONAL = [
  "leader incontesté",
  "numéro un",
  "meilleur",
  "révolutionnaire",
  "incontournable",
  "exceptionnel",
  "unique en son genre",
  "inégalé",
  "le plus grand",
  "excellence",
  "partenaire de choix",
  "solution idéale",
  "à la pointe",
  "fleuron",
];

const slugifyLocal = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "article";

/**
 * The label every simulated run carries, so nothing is ambiguous. The watch
 * does not take it: its own summary already says that nothing was searched,
 * and it applies no typographic rule.
 */
export const SIMULATION_NOTE =
  "Proposition produite hors ligne (aucune clé d'API Claude configurée) : règles typographiques et heuristiques maison, pas un modèle.";

export function simulate(agent: AgentKey, context: AgentContext): AgentOutcome {
  switch (agent) {
    case "relecture": {
      const proposals: AgentProposal[] = [];
      const fixedTitle = frenchTypography(context.title);
      if (fixedTitle !== context.title) {
        proposals.push({
          field: "title",
          label: "Typographie du titre",
          rationale:
            "Espaces fines insécables, guillemets français et capitales accentuées (§3.2).",
          current: context.title,
          proposed: fixedTitle,
        });
      }
      const fixedDek = frenchTypography(context.dek);
      if (context.dek && fixedDek !== context.dek) {
        proposals.push({
          field: "dek",
          label: "Typographie du chapô",
          rationale: "Mêmes règles que le titre.",
          current: context.dek,
          proposed: fixedDek,
        });
      }
      for (const block of (context.blocks ?? []).slice(0, 40)) {
        const fixed = frenchTypography(block.text);
        if (fixed === block.text) continue;
        if (proposals.length >= 14) break;
        proposals.push({
          field: `body.${block.index}`,
          label: `Typographie — bloc ${block.index + 1}`,
          rationale:
            "Espaces fines insécables avant la ponctuation double, guillemets « », apostrophe typographique, points de suspension.",
          current: block.text,
          proposed: fixed,
        });
      }
      return {
        summary:
          proposals.length === 0
            ? "Aucune correction typographique à proposer."
            : `${proposals.length} correction(s) typographique(s) proposée(s).`,
        proposals,
      };
    }

    case "titraille": {
      const lead = firstSentence(context.bodyText);
      const key = keywords(`${context.title} ${context.bodyText}`, 3);
      const titles = [
        context.title.replace(/\s*[:–—-]\s*.*$/, "").trim() || context.title,
        `${context.categoryName} : ${key.slice(0, 2).join(" et ") || context.title.toLowerCase()}`,
        lead.length > 20 && lead.length < 90
          ? lead.replace(/\.$/, "")
          : `${context.title} — ce qu'il faut retenir`,
      ];
      return {
        summary:
          "Trois titres, un chapô, une accroche et une méta-description.",
        proposals: [
          ...titles.map((proposed, index) => ({
            field: "title",
            label: `Titre — proposition ${index + 1}`,
            rationale:
              index === 0
                ? "Version courte, sans sous-titre."
                : index === 1
                  ? "Entrée par la rubrique et les mots-clés dominants."
                  : "Reprise de l'attaque du papier.",
            current: context.title,
            proposed: frenchTypography(proposed.slice(0, 80)),
          })),
          {
            field: "dek",
            label: "Chapô",
            rationale: "Première phrase du papier, resserrée.",
            current: context.dek,
            proposed: frenchTypography(lead.slice(0, 220)),
          },
          {
            field: "social.accroche",
            label: "Accroche réseaux",
            rationale: "Une idée, une question, le lien.",
            proposed: `${context.title} — ${key.join(", ")}. À lire sur BOMA Infos.`,
          },
          {
            field: "seo.description",
            label: "Méta-description",
            rationale: "155 caractères, la promesse de lecture.",
            current: context.metaDescription,
            proposed: stripMarkup(context.dek || lead).slice(0, 155),
          },
        ],
      };
    }

    case "seo": {
      const key = keywords(`${context.title} ${context.bodyText}`, 8);
      const haystack = `${context.title} ${context.bodyText}`.toLowerCase();
      const links = (context.corpus ?? [])
        .filter((item) => item.slug !== context.slug)
        .map((item) => ({
          item,
          score: keywords(item.title, 4).filter((word) =>
            haystack.includes(word)
          ).length,
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      const proposals: AgentProposal[] = [
        {
          field: "seo.slug",
          label: "Slug",
          rationale: "Dérivé du titre, sans mot vide, 80 caractères au plus.",
          current: context.slug,
          proposed: slugifyLocal(context.title),
        },
        {
          field: "seo.description",
          label: "Méta-description",
          rationale: "Le chapô, ramené à 155 caractères.",
          current: context.metaDescription,
          proposed: stripMarkup(
            context.dek || firstSentence(context.bodyText)
          ).slice(0, 155),
        },
        {
          field: "seo.keywords",
          label: "Mots-clés",
          rationale: "Termes les plus fréquents, hors mots vides.",
          current: context.tags.join(", "),
          proposed: key.join(", "),
        },
      ];
      if (links.length > 0) {
        proposals.push({
          field: "seo.links",
          label: `Maillage interne (${links.length} article(s))`,
          rationale:
            "Articles du fonds partageant plusieurs termes avec celui-ci.",
          proposed: links
            .map((entry) => `${entry.item.title}|/article/${entry.item.slug}`)
            .join("\n"),
        });
      }
      return {
        summary: `Slug, métadonnées, ${key.length} mots-clés et ${links.length} lien(s) interne(s).`,
        proposals,
      };
    }

    case "media": {
      const words = (context.mediaKey ?? "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\d+\b/g, "")
        .trim();
      const alt =
        context.mediaCaption?.trim() ||
        (words ? `${words.charAt(0).toUpperCase()}${words.slice(1)}.` : "") ||
        `Illustration de l'article « ${context.title} ».`;
      return {
        summary: "Texte alternatif et légende proposés pour cette image.",
        proposals: [
          {
            field: "alt",
            label: "Texte alternatif",
            rationale:
              "Décrit ce que montre l'image, sans « photo de » (CDC §3.5).",
            proposed: frenchTypography(alt).slice(0, 125),
          },
          {
            field: "caption",
            label: "Légende",
            rationale: "Légende éditoriale, crédit à part.",
            proposed: frenchTypography(
              context.mediaCaption?.trim() ||
                `${alt.replace(/\.$/, "")} — ${context.categoryName}.`
            ),
          },
        ],
      };
    }

    case "moderation": {
      const text = `${context.title} ${context.dek} ${context.bodyText}`;
      const lower = text.toLowerCase();
      const found = PROMOTIONAL.filter((term) => lower.includes(term));
      const figures = [
        ...text.matchAll(
          /(\d[\d\s.,]{2,})\s*(%|milliards?|millions?|FCFA|€|\$)/g
        ),
      ]
        .map((match) => match[0].trim())
        .slice(0, 6);
      const sourced = /(selon|d'après|source\s*:|communiqué de|rapport)/i.test(
        text
      );
      const duplicates = (context.corpus ?? [])
        .filter((item) => {
          const a = new Set(keywords(item.title, 6));
          const b = keywords(context.title, 6);
          return b.filter((word) => a.has(word)).length >= 2;
        })
        .slice(0, 3);

      const undeclared =
        found.length >= 2 && context.submissionKind !== "publi_redactionnel";

      let score = 100;
      score -= found.length * 8;
      score -= figures.length > 0 && !sourced ? 15 : 0;
      score -= duplicates.length * 5;
      score -= context.bodyText.length < 800 ? 10 : 0;
      score = Math.max(10, Math.min(100, score));

      return {
        summary: `Score de conformité ${score}/100 — ${found.length} tournure(s) promotionnelle(s), ${figures.length} chiffre(s) à vérifier, ${duplicates.length} doublon(s) possible(s).`,
        proposals: [
          {
            field: "moderation.score",
            label: "Score de conformité à la charte",
            rationale:
              "Barème maison : tournures promotionnelles, chiffres non sourcés, doublons, longueur.",
            proposed: String(score),
          },
          {
            field: "moderation.publiredactionnel",
            label: "Publi-rédactionnel non déclaré",
            rationale: found.length
              ? `Tournures relevées : ${found.join(", ")}.`
              : "Aucune tournure promotionnelle caractéristique relevée.",
            proposed: undeclared
              ? `Oui, probablement. Type déclaré « ${context.submissionKind} » alors que le texte emploie ${found.length} tournures promotionnelles.`
              : "Non détecté.",
          },
          {
            field: "moderation.allegations",
            label: "Allégations à vérifier",
            rationale: sourced
              ? "Le texte cite au moins une source."
              : "Aucune source citée dans le texte.",
            proposed:
              figures.length > 0
                ? `${figures.join(" · ")}${sourced ? "" : " — aucune source citée."}`
                : "Aucun chiffre avancé.",
          },
          {
            field: "moderation.doublon",
            label: "Doublons du fonds",
            rationale: "Rapprochement par mots-clés des titres publiés.",
            proposed:
              duplicates.length > 0
                ? duplicates.map((item) => `« ${item.title} »`).join(" · ")
                : "Aucun rapprochement.",
          },
          {
            field: "moderation.avis",
            label: "Avis — la décision reste humaine",
            rationale:
              "L'agent conseille ; accepter, demander des modifications ou refuser reste un acte de la rédaction.",
            proposed:
              score >= 75
                ? "Recevable en l'état, sous réserve de la vérification des chiffres."
                : score >= 50
                  ? "À retravailler : demander des modifications avant publication."
                  : "Très promotionnel : refus motivé ou requalification en publi-rédactionnel.",
          },
        ],
      };
    }

    case "diffusion": {
      if (context.weekArticles && context.weekArticles.length > 0) {
        return composeNewsletter(context.weekArticles, context.title);
      }
      const url = context.url ?? "";
      const lead = firstSentence(context.dek || context.bodyText);
      const key = keywords(`${context.title} ${context.bodyText}`, 3);
      return {
        summary: "Déclinaisons LinkedIn, WhatsApp et Facebook.",
        proposals: [
          {
            field: "social.linkedin",
            label: "LinkedIn",
            rationale: "Ton professionnel, contexte puis lien.",
            proposed: `${context.title}\n\n${lead}\n\n${key.map((word) => `#${word}`).join(" ")}\n${url}`,
          },
          {
            field: "social.whatsapp",
            label: "WhatsApp",
            rationale:
              "Canal de partage principal de l'audience (CDC §2.2) : deux lignes, le lien à la fin.",
            proposed: `*${context.title}*\n${lead}\n${url}`,
          },
          {
            field: "social.facebook",
            label: "Facebook",
            rationale: "Deux à trois lignes, question d'accroche.",
            proposed: `${context.title}\n\n${lead}\n\nÀ lire sur BOMA Infos : ${url}`,
          },
        ],
      };
    }

    case "transcription": {
      const source = (context.transcriptSource ?? context.bodyText).trim();
      const chunks = source
        .split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÀ-Ü])/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .slice(0, 24);
      const stamped = chunks
        .map((part, index) => {
          const seconds = index * 42;
          const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
          const ss = String(seconds % 60).padStart(2, "0");
          return `[00:${mm}:${ss}] ${part}`;
        })
        .join("\n");
      const qa = chunks
        .map((part, index) =>
          index % 2 === 0
            ? `**BOMA Infos —** ${part.replace(/\.$/, "")} ?`
            : `**Réponse —** ${part}`
        )
        .join("\n\n");
      return {
        summary: `Transcription horodatée (${chunks.length} segments) et trame questions/réponses.`,
        proposals: [
          {
            field: "transcript",
            label: "Texte horodaté",
            rationale: "Découpage par unité de sens, horodatage indicatif.",
            proposed: stamped,
          },
          {
            field: "interview",
            label: "Trame questions/réponses",
            rationale: "Prête à éditer dans la rubrique Interview.",
            proposed: qa,
          },
        ],
      };
    }

    case "veille":
      return watchOffline(context);
  }
}

/**
 * The watch without a model.
 *
 * No web search, therefore **no lead**: nothing below describes an event.
 * What a rule can honestly compute is the newsroom's own blind spots — the
 * sections that have published nothing for a week — and the searches the
 * agent would have run, handed over for a journalist to run by hand.
 */
function watchOffline(context: AgentContext): AgentOutcome {
  const watch = context.watch;
  if (!watch) {
    return { summary: "Veille indisponible : domaine inconnu.", proposals: [] };
  }

  const DAY = 24 * 60 * 60 * 1000;
  const inScope = watch.coverage.filter(
    (section) =>
      !WATCH_DOMAINS.some((domain) => domain.key === watch.domainKey) ||
      section.slug === watch.domainKey
  );
  const silent = inScope.filter(
    (section) =>
      section.lastPublishedAt === null ||
      watch.now - section.lastPublishedAt > WATCH_STALE_DAYS * DAY
  );

  const proposals: AgentProposal[] = silent.slice(0, 8).map((section) => {
    const days =
      section.lastPublishedAt === null
        ? null
        : Math.floor((watch.now - section.lastPublishedAt) / DAY);
    const focus = WATCH_DOMAINS.find(
      (domain) => domain.key === section.slug
    )?.focus;
    return {
      field: `veille.couverture.${section.slug}`,
      label:
        days === null
          ? `Rubrique « ${section.name} » : aucun article publié`
          : `Rubrique « ${section.name} » : rien depuis ${days} jours`,
      rationale:
        "Calculé sur les articles publiés par la rédaction, sans recherche web.",
      proposed: frenchTypography(
        `${days === null ? "Cette rubrique n'a encore rien publié." : `Dernière parution il y a ${days} jours.`}${focus ? ` À surveiller : ${focus}.` : ""}`
      ),
      // Une note par période de silence : la clé est le jour de la dernière
      // parution, pas son heure. Elle ne revient donc ni chaque matin, ni
      // quand la date d'un article est retouchée dans la journée.
      key: `couverture:${section.slug}:${
        section.lastPublishedAt === null
          ? "jamais"
          : new Date(section.lastPublishedAt).toISOString().slice(0, 10)
      }`,
    };
  });

  proposals.push({
    field: "veille.requetes",
    label: `Recherches à lancer à la main — ${watch.domainLabel}`,
    rationale:
      "Ce sont les recherches que l'agent lance lui-même quand la clé d'API est posée.",
    proposed: watch.queries.map((query) => `- ${query}`).join("\n"),
    key: `requetes:${watch.domainKey}`,
  });

  return {
    summary:
      silent.length === 0
        ? "Veille hors ligne : aucune recherche web sans clé d'API. Toutes les rubriques suivies ont publié dans la semaine."
        : `Veille hors ligne : aucune recherche web sans clé d'API. ${silent.length} rubrique${silent.length > 1 ? "s" : ""} sans parution depuis plus de ${WATCH_STALE_DAYS} jours.`,
    proposals,
  };
}

/**
 * Weekly newsletter — agent 6's second job.
 *
 * Kept out of `simulate` because its input is a list of articles, not one
 * piece; the shape of the proposal is the same.
 */
export function composeNewsletter(
  articles: readonly { slug: string; title: string; dek: string }[],
  week: string
): AgentOutcome {
  const items = articles.slice(0, 6);
  return {
    summary: `Newsletter ${week} : ${items.length} article(s) de la semaine.`,
    proposals: [
      {
        field: "newsletter.subject",
        label: "Objet",
        rationale:
          "Le titre le plus lu de la semaine, puis le nombre de sujets.",
        proposed:
          items.length > 0
            ? `${items[0].title} — et ${Math.max(items.length - 1, 0)} autres sujets`
            : `BOMA Infos — semaine ${week}`,
      },
      {
        field: "newsletter.intro",
        label: "Chapeau",
        rationale: "Trois lignes, le fil conducteur de la semaine.",
        proposed:
          items.length > 0
            ? `Cette semaine sur BOMA Infos : ${items
                .slice(0, 3)
                .map((item) => item.title.toLowerCase())
                .join(", ")}.`
            : "Aucune parution cette semaine.",
      },
      ...items.map((item) => ({
        field: `newsletter.item.${item.slug}`,
        label: item.title,
        rationale: "Accroche reprise du chapô.",
        proposed: stripMarkup(item.dek).slice(0, 180),
      })),
    ],
  };
}
