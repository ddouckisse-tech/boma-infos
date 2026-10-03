/**
 * Veille de l'actualité — what agent 8 looks for, and the shape it hands back.
 *
 * BOMA Infos covers the news of Gabon across the board: politics, the
 * economy, society, tourism, the environment, culture, sport. The watch
 * agent searches the web for what happened in one of those domains over the
 * last days and proposes **story leads** to the newsroom. A lead is not an
 * article: it is a working title, the facts in two or three sentences, why it
 * matters now, the section it belongs to — and the pages it was found on.
 *
 * Runtime-agnostic on purpose, like `agentEngine.ts`: no Convex import, no
 * network call. The back office imports the same functions to draw a lead.
 *
 * ## The one rule of this file
 *
 * **A lead without a page behind it does not exist.** A model can write a
 * convincing news item from nothing, and a newsroom that publishes it has
 * published a fabrication. So every source a lead cites is checked against
 * the addresses the search tool really returned during that run
 * (`verifyLeads`): a source that was never retrieved is dropped, and a lead
 * left with no source is dropped with it. Nothing here writes an article —
 * accepting a lead opens a draft that starts with the note and its sources,
 * for a journalist to verify and write.
 */

/* -------------------------------------------------------------------------
   Domains
   ------------------------------------------------------------------------- */

export type WatchDomain = {
  /** Also the slug of the section a lead of this domain falls into. */
  readonly key: string;
  readonly label: string;
  /** What the newsroom expects the watch to cover, in its own words. */
  readonly focus: string;
  /** Searches a journalist can run by hand when the agent is unavailable. */
  readonly queries: readonly string[];
};

/** Target identifier of every watch run: one board for the whole newsroom. */
export const WATCH_TARGET_ID = "gabon";

/** Domain key of the daily round-up, which covers every domain at once. */
export const WATCH_ALL = "gabon";

export const WATCH_DOMAINS: readonly WatchDomain[] = [
  {
    key: "politique",
    label: "Politique",
    focus:
      "institutions, gouvernement, Parlement, diplomatie, collectivités locales",
    queries: [
      "Gabon conseil des ministres",
      "Gabon Assemblée nationale Sénat",
      "Gabon diplomatie accord de coopération",
    ],
  },
  {
    key: "economie",
    label: "Économie",
    focus:
      "entreprises, pétrole, mines et manganèse, finances publiques, numérique, emploi",
    queries: [
      "Gabon économie entreprises",
      "Gabon pétrole manganèse",
      "Gabon budget dette finances publiques",
    ],
  },
  {
    key: "societe",
    label: "Société",
    focus: "éducation, santé, emploi, justice, vie quotidienne",
    queries: [
      "Gabon éducation rentrée scolaire",
      "Gabon santé hôpital",
      "Gabon emploi des jeunes",
    ],
  },
  {
    key: "tourisme",
    label: "Tourisme",
    focus:
      "parcs nationaux, écotourisme, hôtellerie, liaisons aériennes, destinations",
    queries: [
      "Gabon tourisme écotourisme",
      "Gabon parcs nationaux Loango Lopé",
      "Gabon hôtellerie liaisons aériennes",
    ],
  },
  {
    key: "environnement",
    label: "Environnement",
    focus: "forêt, biodiversité, climat, littoral, cohabitation avec la faune",
    queries: [
      "Gabon forêt biodiversité",
      "Gabon climat carbone",
      "Gabon éléphants cultures villages",
    ],
  },
  {
    key: "culture",
    label: "Culture",
    focus: "musique, patrimoine, livres, cinéma, festivals",
    queries: [
      "Gabon culture festival",
      "Gabon musique artistes",
      "Gabon patrimoine musée",
    ],
  },
  {
    key: "sport",
    label: "Sport",
    focus:
      "football, sélections nationales, championnat, athlétisme et autres disciplines",
    queries: [
      "Gabon football sélection nationale",
      "Gabon championnat national de football",
      "Gabon athlétisme sport",
    ],
  },
];

/** The round-up: every domain, one run. */
export const WATCH_ROUND_UP: WatchDomain = {
  key: WATCH_ALL,
  label: "Tour d'horizon",
  focus: WATCH_DOMAINS.map((domain) => domain.label.toLowerCase()).join(", "),
  queries: WATCH_DOMAINS.map((domain) => domain.queries[0]),
};

export const findWatchDomain = (key: string | undefined): WatchDomain =>
  WATCH_DOMAINS.find((domain) => domain.key === key) ?? WATCH_ROUND_UP;

/* -------------------------------------------------------------------------
   Leads
   ------------------------------------------------------------------------- */

export type WatchSource = {
  readonly title: string;
  readonly url: string;
  /** `AAAA-MM-JJ` when the page states its date. */
  readonly date?: string;
};

/**
 * How far the sources of a lead were checked.
 *
 *  - `recoupee` — two pages or more, on different sites, retrieved by the
 *    search tool during the run ;
 *  - `source-unique` — one retrieved page, or several from the same site ;
 *  - `non-verifiee` — the run returned no trace of its searches, so the
 *    addresses could not be checked. Shown as such; never hidden.
 */
export type WatchReliability = "recoupee" | "source-unique" | "non-verifiee";

export type WatchLead = {
  readonly title: string;
  readonly summary: string;
  readonly why: string;
  /** Slug of the suggested section. */
  readonly rubrique: string;
  readonly sources: readonly WatchSource[];
  readonly reliability: WatchReliability;
};

export const RELIABILITY_LABEL: Record<WatchReliability, string> = {
  recoupee: "Recoupée — plusieurs sites",
  "source-unique": "Source unique — à recouper",
  "non-verifiee": "Sources non vérifiées par l'agent",
};

const TRACKING_PARAMETER = /^(utm_[a-z]+|fbclid|gclid|mc_cid|mc_eid|ref)$/i;

/**
 * One spelling per page: two addresses that differ by a fragment, a tracking
 * parameter or a trailing slash are the same source, and must be recognised
 * as such — to check a citation, and to refuse a lead already proposed.
 */
export function normalizeUrl(value: string): string {
  const raw = value.trim();
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    url.hash = "";
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    for (const name of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMETER.test(name)) url.searchParams.delete(name);
    }
    const path = url.pathname.replace(/\/+$/, "");
    const query = url.searchParams.toString();
    return `${url.protocol}//${url.hostname}${path}${query ? `?${query}` : ""}`;
  } catch {
    return "";
  }
}

const hostOf = (value: string): string => {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};

/** What makes two runs recognise the same lead: its first source. */
export const leadKey = (lead: WatchLead): string =>
  normalizeUrl(lead.sources[0]?.url ?? "") || lead.title.toLowerCase();

const asText = (value: unknown): string =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

type RawLead = {
  title?: unknown;
  summary?: unknown;
  why?: unknown;
  rubrique?: unknown;
  sources?: unknown;
};

/** Reads the leads out of the model's answer, discarding what is unusable. */
export function readLeads(value: unknown): Omit<WatchLead, "reliability">[] {
  if (!Array.isArray(value)) return [];
  const leads: Omit<WatchLead, "reliability">[] = [];
  for (const item of value as RawLead[]) {
    if (!item || typeof item !== "object") continue;
    const title = asText(item.title).slice(0, 140);
    const summary = asText(item.summary);
    if (!title || !summary) continue;
    const sources: WatchSource[] = [];
    for (const source of Array.isArray(item.sources) ? item.sources : []) {
      if (!source || typeof source !== "object") continue;
      const entry = source as {
        title?: unknown;
        url?: unknown;
        date?: unknown;
      };
      const url = asText(entry.url);
      if (!normalizeUrl(url)) continue;
      const date = asText(entry.date);
      sources.push({
        title: asText(entry.title) || hostOf(url),
        url,
        ...(/^\d{4}-\d{2}-\d{2}$/.test(date) ? { date } : {}),
      });
    }
    leads.push({
      title,
      summary,
      why: asText(item.why),
      rubrique: asText(item.rubrique).toLowerCase(),
      sources,
    });
  }
  return leads;
}

/**
 * Keeps what the search really returned.
 *
 * `retrieved` holds every address the search tool handed back during the
 * run. A cited source that is not among them was not read by the agent — it
 * is removed, and a lead with nothing left is dropped. When the run carries
 * no trace of any search at all, the check is impossible rather than failed:
 * the leads are kept and labelled `non-verifiee`, so the newsroom knows.
 */
export function verifyLeads(
  leads: readonly Omit<WatchLead, "reliability">[],
  retrieved: readonly string[]
): { leads: WatchLead[]; dropped: number } {
  const known = new Set(retrieved.map(normalizeUrl).filter(Boolean));
  if (known.size === 0) {
    const kept = leads.filter((lead) => lead.sources.length > 0);
    return {
      leads: kept.map((lead) => ({ ...lead, reliability: "non-verifiee" })),
      dropped: leads.length - kept.length,
    };
  }

  const verified: WatchLead[] = [];
  for (const lead of leads) {
    const sources = lead.sources.filter((source) =>
      known.has(normalizeUrl(source.url))
    );
    if (sources.length === 0) continue;
    const sites = new Set(sources.map((source) => hostOf(source.url)));
    verified.push({
      ...lead,
      sources,
      reliability: sites.size >= 2 ? "recoupee" : "source-unique",
    });
  }
  return { leads: verified, dropped: leads.length - verified.length };
}

/* -------------------------------------------------------------------------
   Lead ⇄ text

   A proposal is stored as text (`agentSuggestions.proposed`), so the journal,
   the audit trail and any export can read it without knowing what a lead is.
   The layout below is that text; `parseLead` reads it back for the card of
   the back office and for the draft a retained lead opens.
   ------------------------------------------------------------------------- */

const WHY = "Pourquoi maintenant : ";
const SECTION = "Rubrique suggérée : ";
const RELIABILITY = "Fiabilité : ";
const SOURCES = "Sources :";

/** A closing parenthesis in an address would end the line's date early. */
const safeUrl = (url: string): string => url.replace(/\)/g, "%29");

export function formatLead(lead: WatchLead): string {
  const lines = [lead.summary, ""];
  if (lead.why) lines.push(`${WHY}${lead.why}`);
  if (lead.rubrique) lines.push(`${SECTION}${lead.rubrique}`);
  lines.push(`${RELIABILITY}${RELIABILITY_LABEL[lead.reliability]}`);
  lines.push(SOURCES);
  for (const source of lead.sources) {
    const date = source.date ? ` (${source.date})` : "";
    lines.push(
      `- ${source.title.replace(/\s+—\s+/g, " - ")} — ${safeUrl(source.url)}${date}`
    );
  }
  return lines.join("\n");
}

const RELIABILITY_BY_LABEL = new Map(
  (Object.entries(RELIABILITY_LABEL) as [WatchReliability, string][]).map(
    ([key, label]) => [label, key]
  )
);

/** Reads a stored lead back. `title` is the label of the proposal. */
export function parseLead(title: string, text: string): WatchLead {
  const summary: string[] = [];
  const sources: WatchSource[] = [];
  let why = "";
  let rubrique = "";
  let reliability: WatchReliability = "non-verifiee";
  let inSources = false;

  for (const line of text.split("\n")) {
    if (inSources) {
      const match =
        /^- (.+) — (https?:\/\/\S+?)(?: \((\d{4}-\d{2}-\d{2})\))?$/.exec(
          line.trim()
        );
      if (match) {
        sources.push({
          title: match[1],
          url: match[2],
          ...(match[3] ? { date: match[3] } : {}),
        });
      }
    } else if (line.startsWith(WHY)) {
      why = line.slice(WHY.length).trim();
    } else if (line.startsWith(SECTION)) {
      rubrique = line.slice(SECTION.length).trim();
    } else if (line.startsWith(RELIABILITY)) {
      reliability =
        RELIABILITY_BY_LABEL.get(line.slice(RELIABILITY.length).trim()) ??
        "non-verifiee";
    } else if (line.trim() === SOURCES) {
      inSources = true;
    } else if (line.trim()) {
      summary.push(line.trim());
    }
  }

  return {
    title,
    summary: summary.join(" "),
    why,
    rubrique,
    sources,
    reliability,
  };
}

/** `[libellé](adresse)` for the body of a draft — see `rich-text.tsx`. */
export const sourceAsLink = (source: WatchSource): string => {
  const label = source.title.replace(/[[\]]/g, "").trim() || hostOf(source.url);
  const date = source.date ? ` — ${source.date}` : "";
  return `[${label}](${safeUrl(source.url)})${date}`;
};
