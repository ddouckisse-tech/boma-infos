import type { SeedAuthor, SeedDocument } from "./types";

/**
 * Demonstration dataset — CAHIER-DES-CHARGES.md §4.1 and §5.2.
 *
 * ⚠ Every article, company, quote and figure of this corpus is **fictional**.
 * It exists so the journal can be judged on real French copy, real
 * photographs and realistic orders of magnitude for Gabon and the CEMAC zone,
 * before the WordPress archive is migrated (§5.6). Institutions that exist
 * are only ever named in neutral context; no statement is attributed to a
 * real person or company. The public footer states as much
 * (`DEMO_CONTENT_NOTICE` in `lib/site.ts`) — remove that notice, and this
 * dataset, at go-live.
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
 * The eight sections and their sub-sections, as surveyed in production. The
 * legacy misspelling "Réglementions" is corrected. Stored in the database, not
 * hard-coded in components: the newsroom renames, reorders and re-colours them
 * from milestone 3 without a developer.
 */
export const CATEGORIES: readonly SeedCategory[] = [
  {
    name: "Business & Lifestyle",
    slug: "business-lifestyle",
    accent: "navy-900",
    order: 1,
    description:
      "Les opérations, les marchés et les entreprises qui font l'économie gabonaise au quotidien.",
  },
  {
    name: "Big deal",
    slug: "big-deal",
    parentSlug: "business-lifestyle",
    accent: "navy-900",
    order: 1,
    description:
      "Fusions, acquisitions, concessions : les opérations qui déplacent les lignes.",
  },
  {
    name: "Entreprendre",
    slug: "entreprendre",
    parentSlug: "business-lifestyle",
    accent: "navy-900",
    order: 2,
    description:
      "Créer, financer et faire grandir une entreprise au Gabon : démarches, coûts, obstacles.",
  },
  {
    name: "Innovation",
    slug: "innovation",
    parentSlug: "business-lifestyle",
    accent: "navy-900",
    order: 3,
    description:
      "Procédés, produits et modèles économiques nouveaux, testés sur le terrain gabonais.",
  },
  {
    name: "Technologie",
    slug: "technologie",
    parentSlug: "business-lifestyle",
    accent: "navy-900",
    order: 4,
    description:
      "Réseaux, infrastructures numériques et souveraineté des données.",
  },

  {
    name: "Éditorial",
    slug: "editorial",
    accent: "navy-700",
    order: 2,
    description: "La position de la rédaction sur l'actualité économique.",
  },

  {
    name: "Succès story",
    slug: "succes-story",
    accent: "magenta-600",
    order: 3,
    description:
      "Des trajectoires d'entrepreneurs et de dirigeants, racontées avec leurs zones d'ombre.",
  },
  {
    name: "Femme dirigeante",
    slug: "femme-dirigeante",
    parentSlug: "succes-story",
    accent: "magenta-600",
    order: 1,
    description: "Celles qui dirigent, et ce que cela leur a coûté.",
  },
  {
    name: "Graine de manager",
    slug: "graine-de-manager",
    parentSlug: "succes-story",
    accent: "magenta-600",
    order: 2,
    description: "La relève managériale gabonaise, avant quarante ans.",
  },
  {
    name: "Leader",
    slug: "leader",
    parentSlug: "succes-story",
    accent: "magenta-600",
    order: 3,
    description: "Les dirigeants installés, et la manière dont ils décident.",
  },
  {
    name: "Startup",
    slug: "startup",
    parentSlug: "succes-story",
    accent: "magenta-600",
    order: 4,
    description: "Jeunes pousses : modèle, financement, passage à l'échelle.",
  },

  {
    name: "Espace pro",
    slug: "espace-pro",
    accent: "navy-600",
    order: 4,
    description:
      "L'information utile aux professionnels : réglementation, appels d'offres, formation, documentation.",
  },
  {
    name: "Docuthèques",
    slug: "docutheques",
    parentSlug: "espace-pro",
    accent: "navy-600",
    order: 1,
    description: "Rapports, textes et études à télécharger.",
  },
  {
    name: "Formation",
    slug: "formation",
    parentSlug: "espace-pro",
    accent: "navy-600",
    order: 2,
    description: "Dispositifs, financements et offres de formation continue.",
  },
  {
    name: "Opportunités",
    slug: "opportunites",
    parentSlug: "espace-pro",
    accent: "navy-600",
    order: 3,
    description: "Appels d'offres, marchés publics et appels à projets.",
  },
  {
    name: "Réglementations",
    slug: "reglementations",
    parentSlug: "espace-pro",
    accent: "navy-600",
    order: 4,
    description:
      "Ce que les textes changent concrètement pour les entreprises.",
  },
  {
    name: "Séminaires",
    slug: "seminaires",
    parentSlug: "espace-pro",
    accent: "navy-600",
    order: 5,
    description: "Rencontres professionnelles, programmes et inscriptions.",
  },

  {
    name: "Tribune",
    slug: "tribune",
    accent: "magenta-700",
    order: 5,
    description:
      "Des points de vue argumentés, signés, qui n'engagent que leurs auteurs.",
  },
  {
    name: "Dossier spécial",
    slug: "dossier-special",
    accent: "magenta-800",
    order: 6,
    description:
      "Enquêtes longues sur un secteur, une filière ou une politique publique.",
  },
  {
    name: "Intelligence économique & Fortune d'Afrique",
    slug: "intelligence-economique",
    accent: "navy-900",
    order: 7,
    description:
      "Cartographies d'actionnariat, agrégats monétaires, rapports de force économiques régionaux.",
  },
  {
    name: "Interview",
    slug: "interview",
    accent: "navy-700",
    order: 8,
    description: "Entretiens avec ceux qui décident.",
  },
];

/* -------------------------------------------------------------------------
   Signatures (CDC §4.2 — the legacy site publishes everything under "admin")
   ------------------------------------------------------------------------- */

export const AUTHORS: readonly SeedAuthor[] = [
  {
    slug: "nadia-ondo",
    name: "Nadia Ondo Mba",
    role: "Rédactrice en chef",
    bio: "Elle dirige la rédaction depuis la création du magazine. Ancienne correspondante économique en zone CEMAC, elle suit les finances publiques, la politique monétaire et la gouvernance des entreprises publiques.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
  {
    slug: "patrick-mbadinga",
    name: "Patrick Mbadinga",
    role: "Chef du service Économie",
    bio: "Il couvre les infrastructures, la logistique portuaire et les marchés publics. Il a travaillé six ans dans le conseil en transport avant de rejoindre la presse économique.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
  {
    slug: "serge-boussougou",
    name: "Serge Boussougou",
    role: "Grand reporter — énergie et mines",
    bio: "Spécialiste des industries extractives, il suit les contrats pétroliers, la filière manganèse et la transition électrique du pays depuis Port-Gentil.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
  {
    slug: "clarisse-ivanga",
    name: "Clarisse Ivanga",
    role: "Journaliste — entreprises et innovation",
    bio: "Elle enquête sur les jeunes pousses, l'agro-industrie et l'entrepreneuriat féminin. Elle anime la rubrique « Succès story ».",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
  {
    slug: "jean-rene-obame",
    name: "Jean-René Obame",
    role: "Chroniqueur — intelligence économique",
    bio: "Économiste de formation, il tient la rubrique d'intelligence économique et signe régulièrement des tribunes. Ses analyses n'engagent que lui.",
    links: [{ label: "Écrire à la rédaction", url: "/contacts" }],
  },
];

/* -------------------------------------------------------------------------
   Docuthèque (CDC §4.2)
   ------------------------------------------------------------------------- */

/**
 * Downloadable reference documents. The PDF files are produced by
 * `bun run scripts/make-documents.ts` and served from `public/documents/`:
 * the legacy footer published nine links of which one worked, so every link
 * here resolves to a real file.
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
    fileBytes: 1663,
    pages: 24,
    publisher: "Le Corporate",
    daysAgo: 5,
  },
  {
    slug: "barometre-cout-logistique",
    title: "Baromètre du coût logistique — corridor Owendo-Franceville",
    description:
      "Coût moyen à la tonne-kilomètre par mode, délais de passage portuaire et temps d'immobilisation, relevés trimestre par trimestre.",
    kind: "Étude",
    fileUrl: "/documents/barometre-cout-logistique.pdf",
    fileFormat: "PDF",
    fileBytes: 1639,
    pages: 18,
    publisher: "Le Corporate",
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
    fileBytes: 1585,
    pages: 32,
    publisher: "Le Corporate",
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
    fileBytes: 1637,
    pages: 28,
    publisher: "Le Corporate",
    daysAgo: 34,
  },
  {
    slug: "memento-fiscal-entreprises",
    title: "Mémento fiscal des entreprises",
    description:
      "Taux, assiettes et échéances déclaratives de l'impôt sur les sociétés, de la TVA et des contributions sociales, présentés sous forme de calendrier annuel.",
    kind: "Mémento",
    fileUrl: "/documents/memento-fiscal-entreprises.pdf",
    fileFormat: "PDF",
    fileBytes: 1579,
    pages: 16,
    publisher: "Le Corporate",
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
    fileBytes: 1695,
    pages: 8,
    publisher: "Le Corporate",
    daysAgo: 60,
  },
];
