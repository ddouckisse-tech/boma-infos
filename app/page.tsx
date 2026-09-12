import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SECTIONS, accentBorderClass, sectionHref } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Landing page of the foundations milestone.
 *
 * The real home page — lead story, "À la une", latest per section — is built
 * in milestone 2 (CAHIER-DES-CHARGES.md §4.2). Until then this page states
 * plainly where the project stands and opens the design system gallery.
 */
export default function HomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Refonte applicative · lot 1"
        title="Le Corporate — socle applicatif et design system"
        description="Le langage visuel du magazine est posé : deux couleurs de marque, deux familles typographiques, une échelle de lecture et des composants accessibles. Le journal public arrive au lot 2."
        actions={
          <Link
            href="/design-system"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
          >
            Ouvrir le design system
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
      />

      <Section
        title="Ce que ce socle contient"
        description="Rien de plus que les fondations : ni modèle de contenu, ni page d'article, ni authentification fonctionnelle."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Jetons de design",
              body: "Échelles navy et magenta dérivées des couleurs relevées en production, couleurs fonctionnelles, thème clair et thème sombre.",
            },
            {
              title: "Typographie",
              body: "Source Serif 4 et Inter, auto-hébergées. Six familles de polices supprimées, aucune requête vers Google Fonts.",
            },
            {
              title: "Composants de base",
              body: "En-tête, méga-menu, tiroir mobile, pied de page, bascules de thème et d'économie de données, mise en page.",
            },
            {
              title: "Sécurité",
              body: "HSTS, politique de sécurité du contenu stricte, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy.",
            },
            {
              title: "Accessibilité",
              body: "lang=fr-FR, lien d'évitement, focus visible de 2 px, cibles tactiles de 44 px, respect du mouvement réduit.",
            },
            {
              title: "Convex et better-auth",
              body: "Déploiement de développement branché, schéma vide, authentification câblée sans écran de connexion.",
            },
          ].map((card) => (
            <li
              key={card.title}
              className="rounded-md border border-border bg-card p-5"
            >
              <h3 className="font-serif type-h3">{card.title}</h3>
              <p className="mt-2 type-small text-muted-foreground">
                {card.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        tone="muted"
        title="Les huit rubriques"
        description="L'arborescence éditoriale relevée en production est conservée ; l'orthographe de « Réglementations » est corrigée."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((section) => (
            <li key={section.slug}>
              <Link
                href={sectionHref(section.slug)}
                className={cn(
                  "flex h-full flex-col rounded-md border-t-2 bg-card p-4 transition-colors hover:bg-surface-muted",
                  accentBorderClass[section.accent]
                )}
              >
                <span className="font-serif type-h3">{section.label}</span>
                <span className="mt-2 type-small text-muted-foreground">
                  {section.children.length > 0
                    ? section.children.map((child) => child.label).join(" · ")
                    : "Pas de sous-rubrique"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
