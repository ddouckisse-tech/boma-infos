# Le Corporate — refonte applicative

Magazine économique gabonais édité par **Up Concept**. Ce dépôt remplace le
WordPress historique (WP 6.3.10 / Elementor / thème Newzin).

Document de référence : [`CAHIER-DES-CHARGES.md`](./CAHIER-DES-CHARGES.md).
Prompts d'implémentation par lot : [`prompts/`](./prompts).
Audit de l'existant : [`audit-le-corporate/`](./audit-le-corporate).

**État : lot 2 livré — le journal public.** Modèle de contenu Convex, jeu de
démonstration, accueil, rubriques, article, recherche, auteurs, docuthèque,
newsletter à double consentement, PWA hors-ligne, référencement et budget de
performance contrôlé à la compilation. L'authentification, le back-office, le
portail entreprise et les agents relèvent du lot 3.

---

## Démarrage

Prérequis : Node ≥ 20, [bun](https://bun.sh) (gestionnaire de paquets imposé).

```bash
bun install

# 1. Pousser le schéma et les fonctions sur le déploiement Convex.
bunx convex dev --once

# 2. Variable attendue par Better Auth, posée SUR le déploiement Convex
#    (pas dans .env.local) :
bunx convex env set SITE_URL http://localhost:3000

# 3. Charger le jeu de démonstration (26 articles, 5 signatures,
#    27 photographies, 6 documents). Sans lui, le site est vide.
bun run seed

# 4. Serveur de développement Next.js
bun run dev            # http://localhost:3000
```

> Les fichiers dérivés (`public/medias/`, `public/documents/`, `public/icons/`,
> `convex/media-manifest.ts`) sont **versionnés** : ni la compilation ni
> l'intégration continue ne touchent au réseau. Ils se régénèrent avec
> `bun run media`, `bun run documents` et `bun run icons`.

> **Le backend Convex local ne survit pas à `--once`.** Pour que la requête
> de santé du pied de page et les routes `/api/auth/*` répondent, il faut un
> `convex dev` qui tourne en parallèle du serveur Next :
>
> ```bash
> # soit deux terminaux :
> CONVEX_AGENT_MODE=anonymous bun run convex:dev   # terminal 1
> bun run dev                                      # terminal 2
>
> # soit un seul, Convex démarrant Next lui-même :
> CONVEX_AGENT_MODE=anonymous bun run dev:full
> ```
>
> Sans lui, l'application s'affiche normalement : le pied de page indique
> « Connexion à Convex… » au lieu de « Convex connecté ».

Pour rattacher le projet à un compte Convex cloud plutôt qu'au déploiement
local anonyme : `bunx convex dev --configure=new --project le-corporate`
(interactif, demande l'équipe). **Ne jamais lancer `convex deploy`** sans
demande explicite.

### Scripts

| Script               | Effet                                        |
| -------------------- | -------------------------------------------- |
| `bun run dev`        | Serveur de développement Next.js (port 3000) |
| `bun run build`      | Compilation de production                    |
| `bun run start`      | Serveur de production                        |
| `bun run typecheck`  | `next typegen` puis `tsc --noEmit`           |
| `bun run lint`       | ESLint                                       |
| `bun run format`     | Prettier (écriture)                          |
| `bun run verify`     | typecheck + lint + build                     |
| `bun run budget`     | Contrôle du budget de performance (§5.4)     |
| `bun run seed`       | Charge le jeu de démonstration dans Convex   |
| `bun run media`      | Retélécharge et ré-encode les photographies  |
| `bun run documents`  | Régénère les PDF de la docuthèque            |
| `bun run icons`      | Régénère les icônes de la PWA                |
| `bun run convex:dev` | Backend Convex, en veille                    |
| `bun run dev:full`   | Convex + Next dans un seul processus         |

`bun run build` enchaîne `next build` **puis** `bun run budget` : une
compilation qui dépasse un plafond du §5.4 échoue, elle n'avertit pas.

`.claude/launch.json` déclare la configuration `dev` pour démarrer le serveur
en un appel depuis l'outillage.

---

## Variables d'environnement

`.env.local` est généré par `convex dev` et **n'est pas versionné**. Le
gabarit versionné est [`.env.example`](./.env.example).

| Variable                      | Où                            | Rôle                                           |
| ----------------------------- | ----------------------------- | ---------------------------------------------- |
| `CONVEX_DEPLOYMENT`           | `.env.local`                  | Déploiement visé par la CLI Convex             |
| `NEXT_PUBLIC_CONVEX_URL`      | `.env.local`                  | URL client du déploiement (WebSocket + HTTP)   |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `.env.local`                  | URL des actions HTTP (routes Better Auth)      |
| `SITE_URL`                    | **sur le déploiement Convex** | URL publique du site, utilisée par Better Auth |

Les deux URL Convex sont automatiquement autorisées dans la directive
`connect-src` de la politique de sécurité du contenu (voir
`lib/security-headers.ts`).

---

## Structure

```
app/
  layout.tsx                   racine : lang="fr-FR", polices, en-tête, pied
  page.tsx                     accueil : une, à la une, dossier, rubriques
  [slug]/                      301 des permaliens WordPress vers /article/<slug>
  article/[slug]/              page d'article + opengraph-image.tsx (1200×630)
  rubrique/[...segments]/      liste paginée, filtres, tri (tout dans le chemin)
  auteur/[slug]/               page de signature
  recherche/                   recherche plein texte (seule page dynamique)
  docutheque/                  documents téléchargeables
  a-propos/ contacts/          pages éditoriales
  newsletter/                  inscription, confirmation, désinscription
  hors-ligne/                  page servie par le service worker sans réseau
  mentions-legales/ confidentialite/
  api/recherche/route.ts       point d'entrée du dialogue Cmd+K
  sitemap.ts robots.ts manifest.ts
  rss.xml/ news-sitemap.xml/   flux et plan de site « actualités »
  error.tsx not-found.tsx      états d'erreur soignés
  design-system/               galerie /design-system (référence de l'équipe)
  globals.css                  TOUS les jetons de design
components/
  ui/                          primitives shadcn/ui — JAMAIS modifiées
  custom/                      compositions maison (éditoriales et interface)
  providers/                   PreferencesProvider (+ ConvexClientProvider, lot 3)
convex/
  schema.ts                    modèle de données complet (§5.2)
  model/content.ts             validateurs et types partagés des blocs
  journal.ts                   requêtes publiques (lecture seule)
  newsletter.ts contact.ts     mutations publiques, validées et limitées
  seeding.ts                   internalMutation `seeding:run` (jeu de démo)
  seed/                        le corpus de démonstration, en clair
  media-manifest.ts            GÉNÉRÉ — dimensions et poids exacts des photos
  auth.ts http.ts              Better Auth (câblé, inexploité avant le lot 3)
lib/
  content/server.ts            accès Convex côté serveur (+ ISR)
  media.ts                     srcset, sizes, variantes basse définition
  navigation.ts                arbre éditorial (données) → classes d'accent
  legacy-redirects.ts          plan de redirection 301 du §5.6
  site.ts format.ts schemas.ts actions.ts headings.ts
  security-headers.ts          TOUS les en-têtes de sécurité, CSP comprise
public/
  medias/                      27 photos × 4 largeurs × 2 formats (AVIF, WebP)
  documents/ icons/ sw.js      docuthèque, icônes PWA, service worker
scripts/
  fetch-media.ts               télécharge et ré-encode les photographies
  make-documents.ts            produit les PDF de la docuthèque
  make-icons.ts                produit les icônes de la PWA
  check-budget.ts              contrôle du §5.4 — fait échouer la compilation
next.config.ts                 en-têtes, cache des médias, redirections 301
```


### Conventions

- **Code en anglais, interface en français.** Toute chaîne visible est en
  français, sans exception.
- TypeScript strict, jamais de `any` non justifié par un commentaire.
- `components/ui/` (shadcn) n'est jamais modifié : toute personnalisation
  passe par composition dans `components/custom/`.
- Formulaires : React Hook Form + Zod. Notifications : sonner. Icônes :
  lucide-react.
- Aucune librairie d'animation. Rayons plafonnés à 16 px. Pas d'ombre
  diffuse en dehors des éléments réellement flottants.

---

## Le journal public (lot 2)

### Budget de performance — contraignant

`bun run build` termine par `scripts/check-budget.ts`, qui lit le HTML
prérendu de l'accueil et d'un article, additionne le transfert réel
(document, CSS, JS et polices **gzippés**, images résolues depuis le
`srcset` pour une fenêtre de 412 px) et **sort en erreur** au premier
plafond dépassé :

| Indicateur        | Plafond §5.4 | Constaté |
| ----------------- | ------------ | -------- |
| Poids accueil     | 600 Ko       | 489 Ko   |
| Poids article     | 400 Ko       | 380 Ko   |
| Requêtes accueil  | 50           | 31       |
| Requêtes article  | 50           | 20       |
| JavaScript        | 180 Ko       | 159 Ko   |

Deux partis pris de mesure, tous deux du côté sévère :

- **DPR 2**, pas 1. Le parc visé est en haute densité et c'est le lecteur
  qui paie les pixels : la même page d'accueil coûte 424 Ko à DPR 1 et
  818 Ko à DPR 2 avant correction. C'est la seconde valeur qui compte.
- **Pire cas par image** : on compte la plus grande variante que chaque
  `<picture>` peut réclamer, parce qu'un navigateur choisit parfois un cran
  au-dessus de ce que `sizes × DPR` laisse prévoir. Chaque appel à
  `ResponsiveImage` porte donc un `maxWidth` taillé pour sa mise en page.

Sont exclues du total, et signalées à part, les prothèses `nomodule`
(core-js, 39 Ko) : aucun navigateur du §5.5 ne les télécharge.

Font aussi échouer le contrôle : une ressource référencée mais introuvable
sur le disque, et un lien interne malformé (espace ou accolade dans un
`href`). Mieux vaut refuser que servir un 404.

### Images

Aucune optimisation à la volée. `scripts/fetch-media.ts` télécharge des
photographies libres depuis Wikimedia Commons, les recadre en 16:9 et les
encode en **AVIF + WebP à 320, 640, 960 et 1280 px**, puis écrit
`convex/media-manifest.ts` avec les dimensions, la couleur dominante et le
**poids exact** de chaque variante. Trois conséquences : le budget est
calculable à la compilation, la boîte de l'image est réservée avant le
premier octet (CLS nul), et le service worker peut précacher.

`<ResponsiveImage>` rend **un seul** `<picture>`, identique pour tout le
monde. L'image de une est en outre préchargée depuis le `<head>`
(`ReactDOM.preload`) et décodée en `async` — `decoding="sync"` imposait un
décodage AVIF avant présentation, soit deux secondes de retard au rendu sur
un processeur bridé.

### Économie de données

Le choix du lecteur vit dans `localStorage` **et** dans un cookie.
`proxy.ts` lit le cookie et réécrit chaque requête d'image vers la variante
480 px : les pages restent entièrement statiques, et l'image prioritaire est
couverte elle aussi. Mesuré : 18 713 octets sans le cookie, 11 317 avec.

> La version précédente rendait deux `<picture>` et en masquait un par CSS.
> **Elle ne fonctionnait pas** : Chrome télécharge une image
> `loading="lazy"` même dans un élément `display: none`, la page payait donc
> les deux variantes. Constaté au relevé réseau, pas à la lecture du code.

Les vidéos, elles, ne sont jamais préchargées : leur vignette disparaît au
profit d'un bouton qui annonce le téléchargement (`HeavyMedia`).

Un cache HTTP `immutable` signifie qu'une photographie déjà téléchargée
n'est pas re-téléchargée en plus petit quand on active le mode — ce qui est
le bon comportement : une image en cache coûte zéro octet.

### Hors-ligne

`public/sw.js`, écrit à la main (pas de Workbox) : réseau d'abord avec
garde-temps de 3,5 s pour les documents, cache d'abord pour les ressources
versionnées, quarante pages conservées, et `/hors-ligne` en dernier recours.
Une bascule du mode économie purge le cache des photographies, sinon le
service worker resservirait celles de l'ancien mode.

> **Non vérifié en navigateur.** L'environnement de test refuse
> l'enregistrement des service workers — y compris pour un fichier de deux
> lignes servi par un serveur statique nu, sans politique de sécurité : le
> refus ne vient donc pas du projet. Ce qui a pu être vérifié : `/sw.js`
> répond 200 avec le bon type MIME, `Service-Worker-Allowed: /` et
> `Cache-Control: must-revalidate`, sa syntaxe passe `node --check`, et
> `/hors-ligne` s'affiche. **La lecture hors-ligne reste à recetter sur un
> vrai appareil.**

### Référencement

Un seul `<h1>` par page, métadonnées et canoniques par page, `NewsArticle` +
`NewsMediaOrganization` + `BreadcrumbList` (avec le niveau « Accueil » que
l'audit signalait manquant), `sitemap.xml`, `news-sitemap.xml`, `rss.xml`,
`robots.txt`, et une image Open Graph 1200×630 générée pour chaque article.

Le plan de redirection 301 du §5.6 vit dans `lib/legacy-redirects.ts`
(rubriques `/category/<slug>`, pages, flux, plans de site, archives
d'auteur, étiquettes, points d'entrée WordPress). Les permaliens d'articles,
servis à la racine par WordPress, sont traités par la route attrape-tout
`app/[slug]/page.tsx`, qui interroge la base plutôt que d'embarquer une
liste de 1 019 entrées.

### Contenu de démonstration

Le corpus de `convex/seed/` est **fictif** : entreprises, personnes,
citations et chiffres sont inventés, à l'échelle réelle du Gabon. Les
institutions existantes ne sont citées qu'en contexte neutre. Le pied de
page l'indique (`DEMO_CONTENT_NOTICE` dans `lib/site.ts`) ; retirer cette
mention et le jeu de données à la mise en ligne.

---

## Design system

La page [`/design-system`](http://localhost:3000/design-system) présente la
palette complète en clair et en sombre, l'échelle typographique, les
espacements, les formes et tous les composants dans chacun de leurs états.
Elle n'est pas indexée (`robots: noindex`).

Source de vérité des jetons : `app/globals.css`. `lib/design-tokens.ts` en est
un miroir destiné à l'affichage ; garder les deux synchronisés.

### Palette (cahier des charges v1.1)

Les deux couleurs de marque sont inchangées — navy `#002060`, magenta
`#C74794` — mais **les fonds et l'encre sont neutres**, plus bleutés :

|                | Clair               | Sombre              |
| -------------- | ------------------- | ------------------- |
| Fond de page   | `#FFFFFF`           | `#121212`           |
| Surface douce  | `#F5F5F5`           | `#1F1F1F`           |
| Carte          | `#FFFFFF`           | `#171717`           |
| Texte          | `#1A1A1A` (17,40:1) | `#EDEDED` (16,00:1) |
| Texte atténué  | `#525252` (7,81:1)  | `#A3A3A3` (7,43:1)  |
| Accent textuel | `#B83D85` (5,19:1)  | `#E06BAD` (6,13:1)  |

Deux règles à ne pas enfreindre :

- **`#C74794` ne porte jamais de texte courant** — 4,41:1 sur blanc, 4,05:1
  sur `#F5F5F5`, sous le seuil AA. Il sert aux aplats, filets, fonds de badge
  et titres larges. Le magenta textuel est `--brand-magenta-600` `#B83D85`.
- **Le navy `#002060` est proscrit en thème sombre** — 1,23:1 sur `#121212`.
  Les titres y passent à `--foreground`, l'action primaire à navy-300
  `#A2BFF1` (10,04:1).

Les ratios mesurés sont affichés dans la section « Accessibilité » de
`/design-system`.

---

## Sécurité

En-têtes posés par `next.config.ts` : HSTS (`max-age=31536000;
includeSubDomains; preload`), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` restrictive, `Cross-Origin-Opener-Policy`,
`Cross-Origin-Resource-Policy`, `X-DNS-Prefetch-Control: off`.

La `Content-Security-Policy` vit dans `lib/security-headers.ts` :

```
default-src 'self'; base-uri 'none'; object-src 'none';
frame-ancestors 'none'; frame-src 'none'; form-action 'self';
script-src 'self' 'unsafe-inline'; script-src-attr 'none';
style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
font-src 'self'; media-src 'self'; worker-src 'self' blob:;
manifest-src 'self'; connect-src 'self' <URL Convex>;
upgrade-insecure-requests
```

`'unsafe-eval'` est ajouté **en développement seulement** (rechargement à
chaud de Turbopack) ; `upgrade-insecure-requests` n'apparaît qu'en
production.

**Pourquoi `'unsafe-inline'` sur `script-src`.** Next.js sérialise la charge
utile React Server Components dans des `<script>` en ligne dont le contenu
change à chaque rendu. Les autoriser autrement impose un nonce par requête,
ce qui **désactive le rendu statique de toutes les pages** — inacceptable au
regard du budget de performance du §5.4. La variante à nonce +
`strict-dynamic` a été implémentée puis retirée : elle bloquait
effectivement l'hydratation sur les pages prérendues. Tout le reste reste
verrouillé : aucune origine tierce, aucun gestionnaire d'événement en ligne
(`script-src-attr 'none'`), pas d'`eval` en production, `base-uri` et
`form-action` fermés.

**À revoir au lot 3** : les espaces privés sont rendus dynamiquement par
nature ; ces routes-là pourront passer à un nonce sans coûter le cache.

Le lot 2 n'a **rien relâché** dans la politique : aucun domaine média n'a
été ajouté, `img-src` reste `'self' data: blob:` et `font-src 'self'` —
les 27 photographies et les deux polices sont servies depuis ce domaine.
S'y ajoutent des en-têtes de cache : un an d'`immutable` sur `/medias`,
`/icons` et les fichiers versionnés (l'audit relevait l'absence totale de
`Cache-Control` sur les images du site actuel, soit une cinquantaine
d'allers-retours vers l'Europe à chaque visite), `Vary: Cookie` sur
`/medias` puisque `proxy.ts` y sert une variante selon le mode économie, et
`must-revalidate` sur `/sw.js`.
