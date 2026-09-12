/**
 * Derived text fields of an article.
 *
 * The seeding script computed these once for the demonstration corpus; the
 * editor of milestone 3 recomputes them on every save, so a piece written in
 * the back office is indistinguishable from a seeded one — same reading
 * time, same search index, same slug rules.
 */

import type { Block } from "./content";

const WORDS_PER_MINUTE = 230;

const wordsIn = (value: string): number =>
  value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

export function readingMinutes(
  title: string,
  dek: string,
  body: readonly Block[]
): number {
  let words = wordsIn(title) + wordsIn(dek);
  for (const block of body) {
    switch (block.type) {
      case "paragraph":
      case "heading":
      case "quote":
        words += wordsIn(block.text);
        break;
      case "list":
        words += wordsIn(block.items.join(" "));
        break;
      case "stat":
        words += wordsIn(`${block.value} ${block.label}`);
        break;
      case "image":
        words += 8; // temps d'arrêt sur une photo légendée
        break;
      case "video":
        break;
    }
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Flattens the piece into the single field the Convex search index reads. */
export function searchText(
  title: string,
  dek: string,
  tags: readonly string[],
  body: readonly Block[]
): string {
  const parts: string[] = [title, dek, ...tags];
  for (const block of body) {
    if (block.type === "paragraph" || block.type === "heading") {
      parts.push(block.text);
    } else if (block.type === "quote") {
      parts.push(block.text, block.attribution ?? "");
    } else if (block.type === "list") {
      parts.push(...block.items);
    } else if (block.type === "stat") {
      parts.push(block.value, block.label);
    } else if (block.type === "video") {
      parts.push(block.title);
    }
  }
  return parts
    .join(" ")
    .replace(/\*\*|\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain text of the body, for the agents and the excerpt. */
export function plainText(body: readonly Block[]): string {
  const parts: string[] = [];
  for (const block of body) {
    switch (block.type) {
      case "paragraph":
        parts.push(block.text);
        break;
      case "heading":
        parts.push(`## ${block.text}`);
        break;
      case "quote":
        parts.push(
          `« ${block.text} »${block.attribution ? ` — ${block.attribution}` : ""}`
        );
        break;
      case "list":
        parts.push(block.items.map((item) => `- ${item}`).join("\n"));
        break;
      case "stat":
        parts.push(`${block.value} — ${block.label}`);
        break;
      case "image":
        parts.push(block.caption ? `[image : ${block.caption}]` : "[image]");
        break;
      case "video":
        parts.push(`[vidéo : ${block.title}]`);
        break;
    }
  }
  return parts.join("\n\n");
}

export function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug === "" ? "article" : slug;
}

/** `YYYY-MM`, UTC — the bucket the monthly agent cap is counted in. */
export const periodOf = (at: number): string =>
  new Date(at).toISOString().slice(0, 7);

/** `YYYY-MM-DD`, UTC. */
export const dayOf = (at: number): string =>
  new Date(at).toISOString().slice(0, 10);

/** ISO week label, `2026-W37`. */
export function isoWeek(at: number): string {
  const date = new Date(at);
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  // Jeudi de la semaine courante : c'est lui qui porte l'année ISO.
  const day = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
  const week =
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000)
    );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
