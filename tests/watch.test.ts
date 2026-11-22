import assert from "node:assert/strict";
import { test } from "node:test";
import {
  completeRun,
  decide,
  reopen,
  startRun,
  watchBoard,
  watchContext,
} from "../convex/agents";
import {
  buildPrompt,
  costMicros,
  parseWatch,
  simulate,
  WATCH_DAYS,
  WEB_SEARCH_MICROS,
  type AgentContext,
} from "../convex/model/agentEngine";
import { AGENT_KEYS, AGENT_LIST, AGENT_MODELS } from "../convex/model/agents";
import {
  findWatchDomain,
  formatLead,
  leadKey,
  normalizeUrl,
  parseLead,
  verifyLeads,
  WATCH_ALL,
  WATCH_DOMAINS,
  WATCH_TARGET_ID,
  type WatchLead,
} from "../convex/model/watch";
import { createFakeDb, handlerOf, signedIn } from "./support/fake-convex";

/**
 * Agent 8 — the watch. What is tested here is what makes it safe to put in
 * front of a newsroom: a lead without a retrieved page is dropped, the
 * offline stand-in invents nothing, a lead already seen never comes back,
 * and retaining one opens a draft — never a published article.
 */

const NOW = Date.UTC(2026, 9, 3, 6, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

const context = (domainKey = "tourisme"): AgentContext => {
  const domain = findWatchDomain(domainKey);
  return {
    title: `Veille — ${domain.label}`,
    dek: "",
    bodyText: "",
    categoryName: domain.label,
    tags: [],
    corpus: [{ slug: "deja-publie", title: "Un sujet déjà publié" }],
    watch: {
      domainKey: domain.key,
      domainLabel: domain.label,
      focus: domain.focus,
      queries: domain.queries,
      today: "2026-10-03",
      days: WATCH_DAYS,
      sections: [
        { slug: "politique", name: "Politique" },
        { slug: "tourisme", name: "Tourisme" },
        { slug: "parcs-nationaux", name: "Parcs nationaux" },
      ],
      coverage: [
        { slug: "politique", name: "Politique", lastPublishedAt: NOW - DAY },
        {
          slug: "tourisme",
          name: "Tourisme",
          lastPublishedAt: NOW - 12 * DAY,
        },
        { slug: "culture", name: "Culture", lastPublishedAt: null },
      ],
      now: NOW,
    },
  };
};

const lead = (overrides: Partial<WatchLead> = {}): WatchLead => ({
  title: "Une liaison aérienne rouvre vers l'intérieur",
  summary: "La desserte reprend deux fois par semaine.",
  why: "Elle raccourcit l'accès à un parc national.",
  rubrique: "tourisme",
  sources: [
    {
      title: "Reprise de la liaison",
      url: "https://exemple-presse.test/liaison",
      date: "2026-10-02",
    },
  ],
  reliability: "source-unique",
  ...overrides,
});

/* -------------------------------------------------------------------------
   The eighth agent is declared like the others
   ------------------------------------------------------------------------- */

test("la veille est le huitième agent, différé, sur son propre modèle", () => {
  assert.equal(AGENT_KEYS.length, 8);
  const watch = AGENT_LIST.find((agent) => agent.key === "veille");
  assert.ok(watch);
  assert.equal(watch.number, 8);
  assert.equal(watch.deferred, true);
  assert.equal(AGENT_MODELS.veille, "claude-opus-5-5");
});

test("les domaines de la veille couvrent l'actualité du Gabon, pas la seule économie", () => {
  assert.deepEqual(
    WATCH_DOMAINS.map((domain) => domain.key),
    [
      "politique",
      "economie",
      "societe",
      "tourisme",
      "environnement",
      "culture",
      "sport",
    ]
  );
  // Un domaine inconnu ou absent retombe sur le tour d'horizon.
  assert.equal(findWatchDomain(undefined).key, WATCH_ALL);
  assert.equal(findWatchDomain("n-existe-pas").key, WATCH_ALL);
  assert.equal(findWatchDomain("sport").label, "Sport");
});

/* -------------------------------------------------------------------------
   Sources
   ------------------------------------------------------------------------- */

test("normalizeUrl ramène les variantes d'une même page à une seule adresse", () => {
  const page = "https://exemple-presse.test/article/liaison";
  for (const variant of [
    "https://www.exemple-presse.test/article/liaison/",
    "https://EXEMPLE-PRESSE.test/article/liaison#commentaires",
    "https://exemple-presse.test/article/liaison?utm_source=x&fbclid=y",
  ]) {
    assert.equal(normalizeUrl(variant), page);
  }
  // Un paramètre qui désigne la page est conservé.
  assert.equal(
    normalizeUrl("https://exemple-presse.test/lire?id=42&utm_medium=mail"),
    "https://exemple-presse.test/lire?id=42"
  );
  assert.equal(normalizeUrl("javascript:alert(1)"), "");
  assert.equal(normalizeUrl("pas une adresse"), "");
});

test("une source que la recherche n'a pas rapportée est écartée, et la piste avec elle", () => {
  const { leads, dropped } = verifyLeads(
    [
      // Deux sites retrouvés : recoupée.
      {
        ...lead(),
        sources: [
          { title: "A", url: "https://a.test/un" },
          { title: "B", url: "https://www.b.test/deux/" },
        ],
      },
      // Une source retrouvée, une inventée : la piste reste, la source non.
      {
        ...lead({ title: "Deuxième" }),
        sources: [
          { title: "A", url: "https://a.test/trois" },
          { title: "Inventée", url: "https://invente.test/rien" },
        ],
      },
      // Rien de retrouvé : la piste disparaît.
      {
        ...lead({ title: "Troisième" }),
        sources: [{ title: "Inventée", url: "https://invente.test/autre" }],
      },
    ],
    ["https://a.test/un", "https://b.test/deux", "https://a.test/trois"]
  );

  assert.equal(dropped, 1);
  assert.deepEqual(
    leads.map((item) => [item.title, item.reliability, item.sources.length]),
    [
      ["Une liaison aérienne rouvre vers l'intérieur", "recoupee", 2],
      ["Deuxième", "source-unique", 1],
    ]
  );
});

test("deux pages du même site ne valent pas un recoupement", () => {
  const { leads } = verifyLeads(
    [
      {
        ...lead(),
        sources: [
          { title: "A", url: "https://a.test/un" },
          { title: "A bis", url: "https://www.a.test/deux" },
        ],
      },
    ],
    ["https://a.test/un", "https://a.test/deux"]
  );
  assert.equal(leads[0].reliability, "source-unique");
});

test("sans trace des recherches, les pistes sont gardées mais dites non vérifiées", () => {
  const { leads, dropped } = verifyLeads(
    [lead(), { ...lead({ title: "Sans source" }), sources: [] }],
    []
  );
  assert.equal(dropped, 1);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].reliability, "non-verifiee");
});

test("une piste écrite en texte se relit à l'identique", () => {
  const original = lead({
    reliability: "recoupee",
    sources: [
      {
        title: "Un titre — avec un tiret",
        url: "https://exemple-presse.test/a_(b)",
        date: "2026-10-02",
      },
      { title: "Sans date", url: "https://autre.test/page" },
    ],
  });
  const read = parseLead(original.title, formatLead(original));

  assert.equal(read.summary, original.summary);
  assert.equal(read.why, original.why);
  assert.equal(read.rubrique, "tourisme");
  assert.equal(read.reliability, "recoupee");
  assert.equal(read.sources.length, 2);
  // La parenthèse de l'adresse est encodée : elle ne ferme pas la date.
  assert.equal(read.sources[0].url, "https://exemple-presse.test/a_(b%29");
  assert.equal(read.sources[0].date, "2026-10-02");
  assert.equal(read.sources[0].title, "Un titre - avec un tiret");
  assert.equal(read.sources[1].date, undefined);
});

/* -------------------------------------------------------------------------
   Prompt, answer, cost
   ------------------------------------------------------------------------- */

test("la consigne de la veille porte le contexte BOMA Infos, le domaine et ce qui est déjà publié", () => {
  const prompt = buildPrompt("veille", context("tourisme"));

  assert.match(prompt.system, /BOMA Infos/);
  assert.match(prompt.system, /actualité du Gabon/);
  assert.match(prompt.system, /outil de recherche web/);
  assert.match(prompt.system, /N'invente ni source, ni citation, ni chiffre/);
  assert.match(prompt.system, /Un humain valide/);
  assert.match(prompt.user, /Date du jour : 2026-10-03/);
  assert.match(prompt.user, /Domaine : Tourisme — parcs nationaux/);
  assert.match(prompt.user, /- parcs-nationaux : Parcs nationaux/);
  assert.match(prompt.user, /- Un sujet déjà publié/);
});

test("les sept autres agents travaillent eux aussi pour BOMA Infos", () => {
  for (const agent of AGENT_KEYS) {
    const { system } = buildPrompt(agent, context());
    assert.match(system, /BOMA Infos/, agent);
    assert.match(system, /politique, économie, société, tourisme/, agent);
    assert.doesNotMatch(system, /Corporate|Up Concept|magazine économique/);
  }
});

test("la réponse de la veille devient des pistes, sources vérifiées", () => {
  const answer = `Voici le résultat.
\`\`\`json
{"summary":"Deux sujets sur la période.","leads":[
 {"title":"Une liaison rouvre","summary":"La desserte reprend.","why":"Accès au parc.","rubrique":"parcs-nationaux",
  "sources":[{"title":"Reprise","url":"https://a.test/liaison?utm_source=x","date":"2026-10-02"},{"title":"Confirmation","url":"https://b.test/liaison"}]},
 {"title":"Un festival annoncé","summary":"Dates communiquées.","why":"Saison touristique.","rubrique":"rubrique-inconnue",
  "sources":[{"title":"Annonce","url":"https://a.test/festival"}]},
 {"title":"Une rumeur","summary":"Sans page derrière.","why":"","rubrique":"tourisme",
  "sources":[{"title":"Nulle part","url":"https://invente.test/rumeur"}]}
]}
\`\`\``;
  const outcome = parseWatch(
    answer,
    [
      "https://a.test/liaison",
      "https://www.b.test/liaison/",
      "https://a.test/festival",
    ],
    context("tourisme")
  );

  assert.equal(outcome.proposals.length, 2);
  assert.match(outcome.summary, /1 piste écartée/);
  const [first, second] = outcome.proposals;
  assert.equal(first.field, "veille.piste");
  assert.equal(first.label, "Une liaison rouvre");
  assert.equal(first.key, "https://a.test/liaison");
  assert.match(first.rationale, /Recoupée/);
  assert.equal(
    parseLead(first.label, first.proposed).rubrique,
    "parcs-nationaux"
  );
  // Une rubrique que le site ne connaît pas retombe sur celle du domaine.
  assert.equal(parseLead(second.label, second.proposed).rubrique, "tourisme");
  assert.match(second.rationale, /Source unique/);
});

test("une réponse sans objet JSON est une erreur, pas une veille vide", () => {
  assert.throws(() => parseWatch("Je n'ai rien trouvé.", [], context()));
});

test("hors ligne, la veille n'invente aucune piste", () => {
  const all = simulate("veille", context(WATCH_ALL));
  assert.ok(all.proposals.every((item) => item.field !== "veille.piste"));
  assert.match(all.summary, /aucune recherche web sans clé d'API/);
  // Tour d'horizon : les deux rubriques silencieuses, puis les recherches.
  assert.deepEqual(
    all.proposals.map((item) => item.field),
    [
      "veille.couverture.tourisme",
      "veille.couverture.culture",
      "veille.requetes",
    ]
  );
  assert.match(all.proposals[0].label, /rien depuis 12 jours/);
  assert.match(all.proposals[1].label, /aucun article publié/);
  // Une note par période de silence : la clé suit le jour de la dernière
  // parution, elle ne change donc pas d'une veille à la suivante.
  assert.deepEqual(
    all.proposals.map((item) => item.key),
    [
      "couverture:tourisme:2026-09-21",
      "couverture:culture:jamais",
      "requetes:gabon",
    ]
  );

  // Sur un domaine : seule sa rubrique est regardée.
  const politics = simulate("veille", context("politique"));
  assert.deepEqual(
    politics.proposals.map((item) => item.field),
    ["veille.requetes"]
  );
  assert.match(politics.proposals[0].proposed, /Gabon conseil des ministres/);
});

test("une recherche web est comptée dans le coût de l'exécution", () => {
  const tokens = costMicros("claude-opus-5-5", 50_000, 4_000);
  assert.equal(tokens, 50_000 * 4 + 4_000 * 20);
  assert.equal(
    costMicros("claude-opus-5-5", 50_000, 4_000, 6),
    tokens + 6 * WEB_SEARCH_MICROS
  );
});

/* -------------------------------------------------------------------------
   The board — real handlers on the simulated database
   ------------------------------------------------------------------------- */

const SECTIONS = [
  { name: "Politique", slug: "politique", order: 1 },
  { name: "Tourisme", slug: "tourisme", order: 4 },
  {
    name: "Parcs nationaux",
    slug: "parcs-nationaux",
    parentSlug: "tourisme",
    order: 2,
  },
  { name: "Espace pro", slug: "espace-pro", order: 10 },
].map((row) => ({
  ...row,
  accent: "navy-900",
  description: "",
  isActive: true,
}));

async function board() {
  const fake = createFakeDb({ start: NOW });
  fake.seed("categories", SECTIONS);
  fake.seed("authors", [
    { slug: "redaction", name: "La rédaction", role: "", bio: "", links: [] },
  ]);
  const ctx = signedIn(fake);

  const run = (label: string) =>
    handlerOf<Record<string, unknown>, string>(startRun)(ctx, {
      agentKey: "veille",
      mode: "live",
      model: "claude-opus-5-5",
      targetType: "veille",
      targetId: WATCH_TARGET_ID,
      targetLabel: label,
      inputDigest: "",
      triggeredBy: "Test",
    });
  const complete = (id: string, items: WatchLead[]) =>
    handlerOf<Record<string, unknown>, number>(completeRun)(ctx, {
      id,
      summary: "",
      inputTokens: 0,
      outputTokens: 0,
      costMicros: 0,
      proposals: items.map((item) => ({
        field: "veille.piste",
        label: item.title,
        rationale: "",
        proposed: formatLead(item),
        key: leadKey(item),
      })),
    });
  const settle = (id: string, accept: boolean) =>
    handlerOf<
      Record<string, unknown>,
      { applied: boolean; message: string; draftId?: string }
    >(decide)(ctx, { id, accept });
  const undo = (id: string) =>
    handlerOf<Record<string, unknown>, { reopened: boolean; message: string }>(
      reopen
    )(ctx, { id });

  return { fake, ctx, run, complete, settle, undo };
}

test("une piste déjà proposée ne revient pas, même reformulée", async () => {
  const { fake, run, complete, settle } = await board();

  assert.equal(await complete(await run("Veille — Tourisme"), [lead()]), 1);
  // Le lendemain : même page, autre formulation — et une vraie nouveauté.
  const reworded = lead({
    title: "Reprise d'une desserte aérienne",
    summary: "Autre formulation du même fait.",
    sources: [
      { title: "Reprise", url: "https://www.exemple-presse.test/liaison/" },
    ],
  });
  const fresh = lead({
    title: "Un nouveau sujet",
    sources: [{ title: "Autre", url: "https://exemple-presse.test/autre" }],
  });
  assert.equal(
    await complete(await run("Veille — Tour d'horizon"), [reworded, fresh]),
    1
  );
  assert.equal(fake.all("agentSuggestions").length, 2);

  // Écartée, elle ne revient pas davantage.
  const first = fake
    .all("agentSuggestions")
    .find((row) => row.label === lead().title);
  assert.ok(first);
  await settle(first._id, false);
  assert.equal(
    await complete(await run("Veille — Tourisme"), [lead(), reworded]),
    0
  );
});

test("retenir une piste ouvre un brouillon sourcé, jamais un article publié", async () => {
  const { fake, ctx, run, complete, settle } = await board();
  await complete(await run("Veille — Tourisme"), [
    lead({
      rubrique: "parcs-nationaux",
      reliability: "recoupee",
      sources: [
        {
          title: "Reprise [officiel]",
          url: "https://exemple-presse.test/liaison",
          date: "2026-10-02",
        },
        { title: "Confirmation", url: "https://autre.test/liaison" },
      ],
    }),
  ]);
  const [suggestion] = fake.all("agentSuggestions");

  const result = await settle(suggestion._id, true);
  assert.equal(result.applied, true);
  assert.match(result.message, /brouillon ouvert dans « Parcs nationaux »/);

  const [article] = fake.all("articles");
  assert.equal(article._id, result.draftId);
  assert.equal(article.status, "draft");
  assert.equal(article.title, "Une liaison aérienne rouvre vers l'intérieur");
  // La sous-rubrique suggérée est rangée sous sa rubrique.
  assert.equal(article.categorySlug, "tourisme");
  assert.equal(article.subCategorySlug, "parcs-nationaux");
  assert.equal(article.authorSlug, "redaction");
  assert.equal(article.origin, "redaction");

  const body = article.body as {
    type: string;
    text?: string;
    items?: string[];
  }[];
  assert.match(
    body[0].text ?? "",
    /Note de veille — à vérifier avant toute publication/
  );
  assert.deepEqual(body.at(-1)?.items, [
    "[Reprise officiel](https://exemple-presse.test/liaison) — 2026-10-02",
    "[Confirmation](https://autre.test/liaison)",
  ]);

  // La piste garde le lien vers son brouillon, et le tableau la range.
  const view = await handlerOf<
    Record<string, never>,
    { pending: unknown[]; retained: { draftId?: string; status: string }[] }
  >(watchBoard)(ctx, {});
  assert.equal(view.pending.length, 0);
  assert.equal(view.retained[0].draftId, article._id);
  assert.equal(view.retained[0].status, "accepted");
  // Les compteurs d'articles suivent l'écriture, comme pour toute création.
  assert.ok(fake.all("articleCounts").length > 0);

  // Le brouillon publié, la piste a fait son office : elle quitte le tableau.
  await fake.db.patch(article._id, { status: "published" });
  const after = await handlerOf<Record<string, never>, { retained: unknown[] }>(
    watchBoard
  )(ctx, {});
  assert.equal(after.retained.length, 0);
});

test("une piste écartée par erreur se remet à trancher, sans jamais se dédoubler", async () => {
  const { fake, ctx, run, complete, settle, undo } = await board();
  await complete(await run("Veille — Tourisme"), [lead()]);
  const [suggestion] = fake.all("agentSuggestions");

  const discarded = await settle(suggestion._id, false);
  assert.equal(discarded.applied, false);
  assert.match(discarded.message, /Piste écartée/);
  assert.equal(fake.all("agentSuggestions")[0].status, "rejected");

  const result = await undo(suggestion._id);
  assert.equal(result.reopened, true);
  const [reopened] = fake.all("agentSuggestions");
  assert.equal(reopened.status, "pending");
  assert.equal(reopened.decidedBy, undefined);
  assert.equal(reopened.decidedAt, undefined);

  // Elle revient sur le tableau, et les deux gestes sont au journal.
  const view = await handlerOf<Record<string, never>, { pending: unknown[] }>(
    watchBoard
  )(ctx, {});
  assert.equal(view.pending.length, 1);
  assert.deepEqual(
    fake.all("auditLog").map((row) => row.action),
    ["agent.suggestion_rejected", "agent.suggestion_reopened"]
  );

  // Rouverte, elle garde son empreinte : la veille suivante ne la double pas.
  assert.equal(await complete(await run("Veille — Tourisme"), [lead()]), 0);
  assert.equal(fake.all("agentSuggestions").length, 1);
});

test("l'annulation ne rouvre ni une piste retenue ni la proposition d'un autre agent", async () => {
  const { fake, run, complete, settle, undo } = await board();
  await complete(await run("Veille — Tourisme"), [
    lead({ rubrique: "parcs-nationaux" }),
  ]);
  const [suggestion] = fake.all("agentSuggestions");

  // Encore à trancher : rien à annuler.
  assert.equal((await undo(suggestion._id)).reopened, false);

  // Retenue : son brouillon existe, on ne la rouvre pas.
  assert.equal((await settle(suggestion._id, true)).applied, true);
  assert.equal((await undo(suggestion._id)).reopened, false);
  assert.equal(fake.all("agentSuggestions")[0].status, "accepted");
  assert.equal(fake.all("articles").length, 1);

  // Une proposition de relecture rejetée le reste : c'est la règle des
  // sept autres agents, et l'annulation de la veille ne la contourne pas.
  const [otherId] = fake.seed("agentSuggestions", [
    {
      runId: suggestion.runId,
      agentKey: "relecture",
      targetType: "article",
      targetId: "article-1",
      field: "title",
      label: "Titre",
      rationale: "",
      proposed: "Un autre titre",
      fingerprint: "empreinte",
      status: "rejected",
      createdAt: NOW,
    },
  ]);
  assert.equal((await undo(otherId)).reopened, false);
  assert.equal(
    fake.all("agentSuggestions").find((row) => row._id === otherId)?.status,
    "rejected"
  );
});

test("une note de veille se classe ou s'écarte, sans vocabulaire de relecture", async () => {
  const { fake, ctx, run, settle } = await board();
  const id = await run("Veille — hors ligne");
  await handlerOf<Record<string, unknown>, number>(completeRun)(ctx, {
    id,
    summary: "",
    inputTokens: 0,
    outputTokens: 0,
    costMicros: 0,
    proposals: [
      {
        field: "veille.couverture.tourisme",
        label: "Tourisme : aucune parution récente",
        rationale: "",
        proposed: "Aucun article publié dans cette rubrique depuis 7 jours.",
      },
      {
        field: "veille.requetes",
        label: "Recherches à lancer à la main",
        rationale: "",
        proposed: "Gabon tourisme actualité",
      },
    ],
  });
  const [coverage, queries] = fake.all("agentSuggestions");

  const filed = await settle(coverage._id, true);
  assert.deepEqual(filed, { applied: false, message: "Note classée." });
  const dropped = await settle(queries._id, false);
  assert.deepEqual(dropped, { applied: false, message: "Note écartée." });
  // Classer une note n'ouvre aucun brouillon.
  assert.equal(fake.all("articles").length, 0);
});

test("une rubrique disparue ne produit ni brouillon ni piste « retenue »", async () => {
  const { fake, run, complete, settle } = await board();
  await complete(await run("Veille — Culture"), [
    lead({ rubrique: "culture" }),
  ]);
  const [suggestion] = fake.all("agentSuggestions");

  const result = await settle(suggestion._id, true);
  assert.equal(result.applied, false);
  assert.match(result.message, /rubrique suggérée n'existe pas/);
  assert.equal(fake.all("articles").length, 0);
  assert.equal(fake.all("agentSuggestions")[0].status, "pending");
});

test("le contexte de veille ne suit que les rubriques thématiques", async () => {
  const fake = createFakeDb({ start: NOW });
  fake.seed("categories", SECTIONS);
  const data = await handlerOf<
    Record<string, never>,
    {
      now: number;
      today: string;
      sections: { slug: string }[];
      coverage: { slug: string; lastPublishedAt: number | null }[];
    }
  >(watchContext)({ db: fake.db }, {});

  const date = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Africa/Libreville",
  });
  assert.equal(data.today, date.format(data.now));
  // L'espace pro n'est pas un domaine de veille ; la sous-rubrique suit sa rubrique.
  assert.deepEqual(
    data.sections.map((row) => row.slug),
    ["politique", "parcs-nationaux", "tourisme"]
  );
  assert.deepEqual(
    data.coverage.map((row) => [row.slug, row.lastPublishedAt]),
    [
      ["politique", null],
      ["tourisme", null],
    ]
  );
});
