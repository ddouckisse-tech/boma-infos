import { notFound, permanentRedirect } from "next/navigation";
import { getArticle } from "@/lib/content/server";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;

/**
 * Catch-all for the legacy article permalinks — CAHIER-DES-CHARGES.md §5.6.
 *
 * WordPress served its 1 019 articles at the root (`/<slug>/`); the new site
 * serves them at `/article/<slug>`. Rather than list a thousand static
 * redirects in `next.config.ts` — a list that would have to be regenerated
 * at every migration — this route resolves the slug against the database:
 * if an article answers to it, the reader is sent on with a **301**, so the
 * inbound links and the ranking follow. Otherwise the 404 stands.
 *
 * Static routes always win over a dynamic segment in the App Router, so
 * `/a-propos`, `/contacts`, `/recherche` and the rest are unaffected.
 *
 * Nothing is prerendered here: these are redirects, resolved on first hit
 * and then cached like any other ISR page.
 */
export default async function LegacyArticleRedirect({
  params,
}: PageProps<"/[slug]">) {
  const { slug } = await params;

  // Un slug WordPress est en minuscules, sans accent ni caractère exotique ;
  // tout le reste part directement en 404, sans interroger la base.
  if (!/^[a-z0-9][a-z0-9-]{2,120}$/.test(slug)) notFound();

  const article = await getArticle(slug);
  if (!article) notFound();

  permanentRedirect(`/article/${article.slug}`);
}
