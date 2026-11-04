import { createPersonNameNormalizer } from "../../lib/person-names";
import type { Block } from "../model/content";
import type { SeedArticle, SeedAuthor } from "./types";

/** Fictional people explicitly identified in the demonstration corpus. */
export const DEMO_PEOPLE = [
  ["Nadia", "Ondo Mba"],
  ["Nadia", "Ondo"],
  ["Patrick", "Mbadinga"],
  ["Serge", "Boussougou"],
  ["Clarisse", "Ivanga"],
  ["Yannick", "Moussavou"],
  ["Jean-René", "Obame"],
  ["Ludovic", "Mpaga"],
  ["Aurélie", "Ndembi"],
  ["Ghislaine", "Ndjoungui"],
  ["Brice", "Tsamba"],
  ["Arsène", "Moukala"],
  ["Noëlle", "Mayombo"],
  ["Pascaline", "Itoungou"],
  ["Clément", "Pambou"],
  ["Honorine", "Mapangou"],
  ["Évariste", "Ibinga"],
  ["Joël", "Ntoutoume"],
  ["Prosper", "Mavoungou"],
  ["Arlette", "Nzigou"],
  ["Lydie", "Nkoghe"],
  ["Gaspard", "Nziengui"],
  ["Hilaire", "Mouity"],
  ["Rodrigue", "Mintsa"],
  ["Estelle", "Ndombi"],
  ["Mireille", "Moussounda"],
  ["Prisca", "Engonga"],
  ["Hortense", "Mboumba"],
  ["Landry", "Mabika"],
  ["Sidonie", "Ayingone"],
  ["Félicien", "Mapangou"],
  ["Mireille", "Ngomo"],
  ["Judicaël", "Ovono"],
  ["Cédric", "Ekogha"],
  ["Armelle", "Koumba"],
  ["Nadège", "Mintsa"],
  ["Aymeric", "Edzang"],
  ["Élodie", "Mouanga"],
  ["Constant", "Mombo"],
  ["Thierry", "Bouka"],
  ["Léa", "Nzoghe"],
  ["Hervé", "Mabicka"],
  ["Sandrine", "Okomo"],
  ["Fabrice", "Ogandaga"],
  ["Étienne", "Mavoungou"],
  ["Carine", "Obame"],
  ["Rodrigue", "Essono"],
  ["Sylvie", "Moussavou"],
  ["Chantal", "Ivinza"],
  ["Estelle", "Bivigou"],
  ["Sylvie", "Ntsame"],
] as const;

export const normalizeDemoPeople = createPersonNameNormalizer(
  DEMO_PEOPLE.map(([givenNames, familyNames]) => ({ givenNames, familyNames }))
);

const optional = (value: string | undefined) =>
  value === undefined ? undefined : normalizeDemoPeople(value);

function normalizeBlock(block: Block): Block {
  switch (block.type) {
    case "paragraph":
    case "heading":
      return { ...block, text: normalizeDemoPeople(block.text) };
    case "quote":
      return { ...block, text: normalizeDemoPeople(block.text), attribution: optional(block.attribution) };
    case "list":
      return { ...block, items: block.items.map(normalizeDemoPeople) };
    case "image":
      return { ...block, caption: optional(block.caption) };
    case "stat":
      return { ...block, label: normalizeDemoPeople(block.label), source: optional(block.source) };
    case "video":
      return { ...block, title: normalizeDemoPeople(block.title) };
  }
}

export function normalizeDemoAuthor(author: SeedAuthor): SeedAuthor {
  return {
    ...author,
    name: normalizeDemoPeople(author.name),
    bio: normalizeDemoPeople(author.bio),
  };
}

export function normalizeDemoArticle(article: SeedArticle): SeedArticle {
  return {
    ...article,
    title: normalizeDemoPeople(article.title),
    dek: normalizeDemoPeople(article.dek),
    body: article.body.map(normalizeBlock),
    keyPoints: article.keyPoints.map(normalizeDemoPeople) as [string, string, string],
    seo: {
      ...article.seo,
      title: optional(article.seo.title),
      description: normalizeDemoPeople(article.seo.description),
      keywords: article.seo.keywords.map(normalizeDemoPeople),
    },
    tags: article.tags.map(normalizeDemoPeople),
  };
}
