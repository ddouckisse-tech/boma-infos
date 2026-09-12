import type { Block } from "../model/content";

/**
 * Shape of one demonstration article.
 *
 * The demo corpus lives in the repository (not in a database dump) so that
 * anybody cloning the project can reseed a fresh Convex deployment with one
 * command and get a journal that is actually judgeable: real French copy, real
 * photographs, realistic figures for Gabon and the CEMAC zone.
 *
 * `daysAgo` is turned into a timestamp at seeding time, so the archive always
 * looks freshly published however long the dataset has been in the repo.
 */
export type SeedArticle = {
  readonly slug: string;
  readonly title: string;
  /** Chapô — one or two sentences, 140 to 260 characters. */
  readonly dek: string;
  readonly categorySlug: string;
  readonly subCategorySlug?: string;
  readonly authorSlug: string;
  /** Key of `convex/mediaManifest.ts`. */
  readonly heroMediaKey: string;
  readonly galleryMediaKeys?: readonly string[];
  /** « L'essentiel en 3 points » — exactly three. */
  readonly keyPoints: readonly [string, string, string];
  readonly seo: {
    readonly title?: string;
    readonly description: string;
    readonly keywords: readonly string[];
  };
  readonly origin: "redaction" | "partenaire";
  readonly feature: "lead" | "top" | "dossier" | "none";
  readonly tags: readonly string[];
  readonly daysAgo: number;
  readonly views: number;
  readonly body: readonly Block[];
};

export type SeedAuthor = {
  readonly slug: string;
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly links: readonly { readonly label: string; readonly url: string }[];
};

export type SeedDocument = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly kind: string;
  readonly fileUrl: string;
  readonly fileFormat: string;
  readonly fileBytes: number;
  readonly pages?: number;
  readonly publisher: string;
  readonly daysAgo: number;
};
