/**
 * The eight agents — CAHIER-DES-CHARGES.md §4.6.
 *
 * Seven assist the newsroom on a text it already holds — proof-reading,
 * headlines, SEO, pictures, moderation, distribution, transcription. The
 * eighth, **Veille**, goes and looks: it searches the web for the news of
 * Gabon — politics, the economy, society, tourism, the environment, culture,
 * sport — and brings back sourced story leads (`model/watch.ts`).
 *
 * One declaration, shared by the Convex functions, the back office and the
 * runtime that calls the Claude API. Adding an agent means adding a row here
 * and a prompt in `model/agentEngine.ts`; nothing else in the chain has to
 * know how many there are.
 *
 * The governing rule of the whole file: **an agent proposes, a human
 * disposes.** Nothing below can publish, refuse or alter a piece of content.
 * Every agent produces `agentSuggestions` rows, and a suggestion only takes
 * effect when someone accepts it.
 */

import { v } from "convex/values";

export const agentKey = v.union(
  v.literal("relecture"),
  v.literal("titraille"),
  v.literal("seo"),
  v.literal("media"),
  v.literal("moderation"),
  v.literal("diffusion"),
  v.literal("transcription"),
  v.literal("veille")
);

export type AgentKey =
  | "relecture"
  | "titraille"
  | "seo"
  | "media"
  | "moderation"
  | "diffusion"
  | "transcription"
  | "veille";

export const AGENT_KEYS: readonly AgentKey[] = [
  "relecture",
  "titraille",
  "seo",
  "media",
  "moderation",
  "diffusion",
  "transcription",
  "veille",
];

/**
 * Model per agent.
 *
 * `claude-sonnet-5` carries the volume work — proof-reading, alternative
 * text, social variants, transcription clean-up. `claude-opus-5` is kept for
 * the two jobs where a wrong answer costs the newsroom something: deciding
 * whether a company deposit is disguised advertising, and writing the
 * headline that will carry the piece.
 *
 * The watch runs on `claude-opus-5-5`: it reads pages it has never seen and
 * reports facts the newsroom may act on, so a mistaken lead costs more than
 * a clumsy sentence. It is also the only agent that pays for web searches —
 * see `WEB_SEARCH_MICROS` in `agentEngine.ts`.
 */
export const AGENT_MODELS: Record<AgentKey, string> = {
  relecture: "claude-sonnet-5",
  titraille: "claude-opus-5",
  seo: "claude-sonnet-5",
  media: "claude-sonnet-5",
  moderation: "claude-opus-5",
  diffusion: "claude-sonnet-5",
  transcription: "claude-sonnet-5",
  veille: "claude-opus-5-5",
};

export type AgentDescriptor = {
  readonly key: AgentKey;
  readonly number: number;
  readonly name: string;
  readonly what: string;
  readonly trigger: string;
  /** What a human still does by hand if the agent is off or unreachable. */
  readonly fallback: string;
  /** Long jobs go through the Convex scheduler instead of blocking a form. */
  readonly deferred: boolean;
};

export const AGENTS: Record<AgentKey, AgentDescriptor> = {
  relecture: {
    key: "relecture",
    number: 1,
    name: "Relecture",
    what: "Orthographe, grammaire, typographie française (espaces insécables avant ; : ! ?, guillemets « », capitales accentuées) et style maison.",
    trigger: "À l'enregistrement d'un article",
    fallback:
      "La relecture reste manuelle : le texte s'enregistre et se publie sans que l'agent ait tourné.",
    deferred: false,
  },
  titraille: {
    key: "titraille",
    number: 2,
    name: "Titraille",
    what: "Trois propositions de titre, un chapô, une accroche réseaux, une méta-description.",
    trigger: "À la demande, depuis l'éditeur",
    fallback:
      "Les champs titre, chapô et méta-description restent saisissables à la main.",
    deferred: false,
  },
  seo: {
    key: "seo",
    number: 3,
    name: "SEO",
    what: "Slug, méta-données, mots-clés et maillage interne — l'agent repère les articles du fonds à lier.",
    trigger: "À l'enregistrement d'un article",
    fallback:
      "Le slug est dérivé du titre et les métadonnées se saisissent dans l'onglet Référencement.",
    deferred: false,
  },
  media: {
    key: "media",
    number: 4,
    name: "Média",
    what: "Texte alternatif et légende de chaque image. Les recadrages et l'encodage AVIF/WebP sont faits hors ligne par `scripts/fetch-media.ts`.",
    trigger: "À l'import d'une image",
    fallback:
      "Le texte alternatif reste un champ obligatoire de la médiathèque, saisi à la main.",
    deferred: false,
  },
  moderation: {
    key: "moderation",
    number: 5,
    name: "Modération des dépôts",
    what: "Fiche de pré-qualification d'un dépôt entreprise : conformité à la charte, publi-rédactionnel non déclaré, allégations à vérifier, doublons du fonds.",
    trigger: "À la soumission d'un dépôt",
    fallback:
      "Le dépôt arrive en revue sans fiche ; la rédaction l'examine comme avant.",
    deferred: false,
  },
  diffusion: {
    key: "diffusion",
    number: 6,
    name: "Diffusion",
    what: "Déclinaisons LinkedIn, WhatsApp et Facebook d'un article publié, et composition de la newsletter hebdomadaire.",
    trigger: "À la publication, et chaque semaine pour la newsletter",
    fallback:
      "Les publications sociales et la newsletter se rédigent à la main comme aujourd'hui.",
    deferred: true,
  },
  transcription: {
    key: "transcription",
    number: 7,
    name: "Transcription d'interviews",
    what: "Audio ou vidéo d'interview → texte horodaté → trame questions/réponses pour la rubrique Interview.",
    trigger: "À l'import d'un média audio ou vidéo",
    fallback:
      "La transcription se fait à la main ; l'article s'écrit dans l'éditeur comme n'importe quel autre.",
    deferred: true,
  },
  veille: {
    key: "veille",
    number: 8,
    name: "Veille de l'actualité",
    what: "Recherche sur le web l'actualité du Gabon — politique, économie, société, tourisme, environnement, culture, sport — et propose des pistes de sujets, chacune avec ses sources. Une source que la recherche n'a pas réellement rapportée est écartée.",
    trigger: "Chaque matin (tour d'horizon), et à la demande par domaine",
    fallback:
      "La veille se fait à la main : la rédaction consulte ses sources habituelles et crée ses sujets depuis « Nouveau contenu ».",
    deferred: true,
  },
};

export const AGENT_LIST: readonly AgentDescriptor[] = AGENT_KEYS.map(
  (key) => AGENTS[key]
);
