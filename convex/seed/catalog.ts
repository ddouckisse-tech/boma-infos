import type { SeedAuthor, SeedDocument } from "./types";

/**
 * Demonstration dataset — CAHIER-DES-CHARGES.md §4.1 and §5.2.
 *
 * ⚠ Every article, company, quote and figure of this corpus is **fictional**.
 * It exists so the journal can be judged on real French copy, real
 * photographs and realistic orders of magnitude for Gabon before the newsroom
 * publishes its own reporting. Institutions that exist are only ever named in
 * neutral context; no statement is attributed to a real person, office holder
 * or company. The public footer states as much (`DEMO_CONTENT_NOTICE` in
 * `lib/site.ts`) — remove that notice, and this dataset, at go-live.
 */

/* -------------------------------------------------------------------------
   Sections (CDC §4.1)
   ------------------------------------------------------------------------- */

export type SeedCategory = {
  readonly name: string;
  readonly slug: string;
  readonly parentSlug?: string;
  readonly accent: string;
  readonly order: number;
  readonly description: string;
};

/**
 * The ten sections of BOMA Infos and their sub-sections: the news of Gabon,
 * section by section — politics, the economy, society, tourism, the
 * environment, culture, sport — then the opinion pages and the practical
 * information for professionals. Stored in the database, not hard-coded in
 * components: the newsroom renames, reorders and re-colours them from the
 * back office without a developer.
 *
 * Three slugs are relied upon by the code and must survive a rename of the
 * label: `espace-pro` (its own block on the home page, `convex/journal.ts`),
 * `editorial` (the « Éditorial » shortcut of the back office) and `interview`
 * (the output of the transcription agent).
 */
export const CATEGORIES: readonly SeedCategory[] = [
  {
    name: "Politique",
    slug: "politique",
    accent: "navy-900",
    order: 1,
    description:
      "La vie des institutions, les décisions du gouvernement et le débat public, expliqués sans parti pris.",
  },
  {
    name: "Institutions",
    slug: "institutions",
    parentSlug: "politique",
    accent: "navy-900",
    order: 1,
    description:
      "Parlement, juridictions, autorités indépendantes : qui décide quoi, et selon quelles règles.",
  },
  {
    name: "Gouvernement",
    slug: "gouvernement",
    parentSlug: "politique",
    accent: "navy-900",
    order: 2,
    description:
      "Réformes et politiques publiques, suivies dans la durée plutôt qu'à l'annonce.",
  },
  {
    name: "Diplomatie",
    slug: "diplomatie",
    parentSlug: "politique",
    accent: "navy-900",
    order: 3,
    description:
      "Le Gabon dans sa région et dans le monde : accords, sommets, coopération.",
  },
  {
    name: "Territoires",
    slug: "territoires",
    parentSlug: "politique",
    accent: "navy-900",
    order: 4,
    description:
      "Provinces, départements et communes : la décision publique vue du terrain.",
  },

  {
    name: "Économie",
    slug: "economie",
    accent: "gold-800",
    order: 2,
    description:
      "Entreprises, filières et finances publiques : ce qui fait tourner l'économie gabonaise.",
  },
  {
    name: "Entreprises",
    slug: "entreprises",
    parentSlug: "economie",
    accent: "gold-800",
    order: 1,
    description:
      "Créer, financer et faire grandir une entreprise au Gabon : opérations, marchés, démarches.",
  },
  {
    name: "Mines & énergie",
    slug: "mines-energie",
    parentSlug: "economie",
    accent: "gold-800",
    order: 2,
    description:
      "Pétrole, manganèse, électricité : les filières qui pèsent dans les comptes du pays.",
  },
  {
    name: "Finances publiques",
    slug: "finances-publiques",
    parentSlug: "economie",
    accent: "gold-800",
    order: 3,
    description: "Budget, dette, fiscalité et monnaie, chiffres à l'appui.",
  },
  {
    name: "Numérique",
    slug: "numerique",
    parentSlug: "economie",
    accent: "gold-800",
    order: 4,
    description: "Réseaux, services en ligne et souveraineté des données.",
  },

  {
    name: "Société",
    slug: "societe",
    accent: "blue-600",
    order: 3,
    description:
      "École, santé, emploi, vie quotidienne : ce qui change concrètement pour les Gabonais.",
  },
  {
    name: "Éducation",
    slug: "education",
    parentSlug: "societe",
    accent: "blue-600",
    order: 1,
    description:
      "De l'école primaire à l'université : moyens, résultats, réformes.",
  },
  {
    name: "Santé",
    slug: "sante",
    parentSlug: "societe",
    accent: "blue-600",
    order: 2,
    description: "Offre de soins, prévention et politiques de santé publique.",
  },
  {
    name: "Emploi",
    slug: "emploi",
    parentSlug: "societe",
    accent: "blue-600",
    order: 3,
    description: "Formation, insertion des jeunes et marché du travail.",
  },

  {
    name: "Tourisme",
    slug: "tourisme",
    accent: "green-700",
    order: 4,
    description:
      "Destinations, parcs nationaux, hébergements : découvrir le Gabon et comprendre sa filière touristique.",
  },
  {
    name: "Destinations",
    slug: "destinations",
    parentSlug: "tourisme",
    accent: "green-700",
    order: 1,
    description:
      "Où aller, quand et comment : des itinéraires racontés sur le terrain.",
  },
  {
    name: "Parcs nationaux",
    slug: "parcs-nationaux",
    parentSlug: "tourisme",
    accent: "green-700",
    order: 2,
    description:
      "Treize parcs, de la côte aux plateaux : accès, saisons, règles de visite.",
  },
  {
    name: "Hôtellerie & transport",
    slug: "hotellerie-transport",
    parentSlug: "tourisme",
    accent: "green-700",
    order: 3,
    description:
      "Hébergements, liaisons aériennes et routières : l'envers du voyage.",
  },

  {
    name: "Environnement",
    slug: "environnement",
    accent: "green-700",
    order: 5,
    description:
      "Forêt, littoral, climat et faune : les ressources naturelles du pays et ceux qui les protègent.",
  },

  {
    name: "Culture",
    slug: "culture",
    accent: "gold-800",
    order: 6,
    description:
      "Musiques, patrimoine, livres et scènes : la création gabonaise et sa mémoire.",
  },
  {
    name: "Musique",
    slug: "musique",
    parentSlug: "culture",
    accent: "gold-800",
    order: 1,
    description:
      "Scènes, artistes et instruments, des épopées du mvet aux studios de Libreville.",
  },
  {
    name: "Patrimoine",
    slug: "patrimoine",
    parentSlug: "culture",
    accent: "gold-800",
    order: 2,
    description:
      "Musées, traditions et sites : ce que le pays conserve et transmet.",
  },

  {
    name: "Sport",
    slug: "sport",
    accent: "blue-600",
    order: 7,
    description:
      "Football, athlétisme, sports de combat : résultats, coulisses et pratique amateur.",
  },
  {
    name: "Football",
    slug: "football",
    parentSlug: "sport",
    accent: "blue-600",
    order: 1,
    description: "Des sélections nationales aux terrains de quartier.",
  },
  {
    name: "Autres disciplines",
    slug: "autres-disciplines",
    parentSlug: "sport",
    accent: "blue-600",
    order: 2,
    description: "Athlétisme, basket, arts martiaux, sports nautiques.",
  },

  {
    name: "Éditorial",
    slug: "editorial",
    accent: "navy-700",
    order: 8,
    description: "La position de la rédaction sur l'actualité du pays.",
  },

  {
    name: "Idées",
    slug: "idees",
    accent: "navy-700",
    order: 9,
    description:
      "Tribunes et grands entretiens : des points de vue signés, qui n'engagent que leurs auteurs.",
  },
  {
    name: "Tribune",
    slug: "tribune",
    parentSlug: "idees",
    accent: "navy-700",
    order: 1,
    description:
      "Des points de vue argumentés, signés, qui n'engagent que leurs auteurs.",
  },
  {
    name: "Interview",
    slug: "interview",
    parentSlug: "idees",
    accent: "navy-700",
    order: 2,
    description:
      "Entretiens avec celles et ceux qui décident, créent ou contestent.",
  },

  {
    name: "Espace pro",
    slug: "espace-pro",
    accent: "navy-900",
    order: 10,
    description:
      "L'information utile aux professionnels : réglementation, appels d'offres, formation, documentation.",
  },
  {
    name: "Opportunités",
    slug: "opportunites",
    parentSlug: "espace-pro",
    accent: "navy-900",
    order: 1,
    description: "Appels d'offres, marchés publics et appels à projets.",
  },
  {
    name: "Réglementations",
    slug: "reglementations",
    parentSlug: "espace-pro",
    accent: "navy-900",
    order: 2,
    description:
      "Ce que les textes changent concrètement pour les entreprises et les usagers.",
  },
  {
    name: "Formation",
    slug: "formation",
    parentSlug: "espace-pro",
    accent: "navy-900",
    order: 3,
    description: "Dispositifs, financements et offres de formation continue.",
  },
  {
    name: "Docuthèques",
    slug: "docutheques",
    parentSlug: "espace-pro",
    accent: "navy-900",
    order: 4,
    description: "Rapports, textes et études à télécharger.",
  },
];

/* -------------------------------------------------------------------------
   Signatures (CDC §4.2)
   ------------------------------------------------------------------------- */

export const AUTHORS: readonly SeedAuthor[] = [
  {
    slug: "nadia-ondo",
    name: "Nadia Ondo Mba",
    role: "Rédactrice en chef",
    bio: "Elle dirige la rédaction de BOMA Infos. Ancienne correspondante en Afrique centrale, elle suit la vie des institutions, les finances publiques et les politiques publiques.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
  {
    slug: "patrick-mbadinga",
    name: "Patrick Mbadinga",
    role: "Chef du service Économie",
    bio: "Il couvre les infrastructures, la logistique, l'emploi et les marchés publics. Il a travaillé six ans dans le conseil en transport avant de rejoindre la presse.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
  {
    slug: "serge-boussougou",
    name: "Serge Boussougou",
    role: "Grand reporter — énergie, mines et environnement",
    bio: "Spécialiste des industries extractives, il suit depuis Port-Gentil les contrats pétroliers, la filière manganèse, le littoral et la transition électrique du pays.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
  {
    slug: "clarisse-ivanga",
    name: "Clarisse Ivanga",
    role: "Journaliste — société et culture",
    bio: "Elle enquête sur l'école, la santé et la vie quotidienne, et raconte la scène culturelle gabonaise, des musées aux studios de Libreville.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
  {
    slug: "yannick-moussavou",
    name: "Yannick Moussavou",
    role: "Journaliste — tourisme et sport",
    bio: "Il parcourt les parcs nationaux et le littoral pour la rubrique Tourisme, et suit le sport gabonais, du football de quartier aux compétitions nationales.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
  {
    slug: "jean-rene-obame",
    name: "Jean-René Obame",
    role: "Chroniqueur — idées et débats",
    bio: "Économiste de formation, il anime les pages Idées et signe régulièrement des tribunes. Ses analyses n'engagent que lui.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
];

/* -------------------------------------------------------------------------
   Docuthèque (CDC §4.2)
   ------------------------------------------------------------------------- */

/**
 * Downloadable reference documents. The PDF files are produced by
 * `bun run scripts/make-documents.ts` and served from `public/documents/`:
 * every link here resolves to a real file, and `fileBytes` is rewritten by
 * that script so the size announced to the reader is the size downloaded.
 */
export const DOCUMENTS: readonly SeedDocument[] = [
  {
    slug: "code-investissements-synthese",
    title: "Code des investissements — synthèse commentée",
    description:
      "Les seuils d'agrément, la durée des avantages fiscaux et les obligations de contenu local, article par article, avec les points encore en attente de décret d'application.",
    kind: "Réglementation",
    fileUrl: "/documents/code-investissements-synthese.pdf",
    fileFormat: "PDF",
    fileBytes: 1655,
    pages: 24,
    publisher: "BOMA Infos",
    daysAgo: 5,
  },
  {
    slug: "guide-visiteur-parcs-nationaux",
    title: "Guide du visiteur des parcs nationaux",
    description:
      "Les treize parcs nationaux, fiche par fiche : accès depuis Libreville, meilleures saisons, hébergements, règles de visite et précautions à prendre.",
    kind: "Guide",
    fileUrl: "/documents/guide-visiteur-parcs-nationaux.pdf",
    fileFormat: "PDF",
    fileBytes: 1576,
    pages: 36,
    publisher: "BOMA Infos",
    daysAgo: 12,
  },
  {
    slug: "guide-creation-entreprise-gabon",
    title: "Guide pratique de la création d'entreprise",
    description:
      "Les pièces à réunir, les guichets à saisir, les délais constatés et le coût réel d'une immatriculation, de la SARL unipersonnelle à la SA.",
    kind: "Guide",
    fileUrl: "/documents/guide-creation-entreprise-gabon.pdf",
    fileFormat: "PDF",
    fileBytes: 1577,
    pages: 32,
    publisher: "BOMA Infos",
    daysAgo: 20,
  },
  {
    slug: "panorama-filiere-bois",
    title: "Panorama de la filière bois et de la seconde transformation",
    description:
      "Volumes, essences, capacités de sciage installées, emplois directs et part de la transformation locale dans les exportations.",
    kind: "Étude",
    fileUrl: "/documents/panorama-filiere-bois.pdf",
    fileFormat: "PDF",
    fileBytes: 1629,
    pages: 28,
    publisher: "BOMA Infos",
    daysAgo: 34,
  },
  {
    slug: "reperes-institutions-gabonaises",
    title: "Repères : les institutions gabonaises",
    description:
      "Qui fait quoi : le rôle du Parlement, du gouvernement, des juridictions et des collectivités locales, avec le parcours d'un texte de loi étape par étape.",
    kind: "Mémento",
    fileUrl: "/documents/reperes-institutions-gabonaises.pdf",
    fileFormat: "PDF",
    fileBytes: 1615,
    pages: 16,
    publisher: "BOMA Infos",
    daysAgo: 48,
  },
  {
    slug: "charte-editoriale-contenus-partenaires",
    title: "Charte éditoriale et règles des contenus partenaires",
    description:
      "Ce que la rédaction accepte, ce qu'elle refuse, et la manière dont tout contenu commercial est signalé au lecteur de façon visible et non contournable.",
    kind: "Document de référence",
    fileUrl: "/documents/charte-editoriale-contenus-partenaires.pdf",
    fileFormat: "PDF",
    fileBytes: 1687,
    pages: 8,
    publisher: "BOMA Infos",
    daysAgo: 60,
  },
];
