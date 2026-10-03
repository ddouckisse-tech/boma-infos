# BOMA Infos

Média gabonais d'information générale, en ligne : toute l'actualité du Gabon —
politique, économie, société, tourisme, environnement, culture, sport.
Adresse : `www.bomainfos.com`. Dépôt :
[`okatech-org/boma-infos`](https://github.com/okatech-org/boma-infos).

Pile : Next.js 16 (App Router), React 19, Convex, Better Auth, Tailwind CSS 4,
TypeScript strict. [bun](https://bun.sh) est le gestionnaire de paquets.

**Origine.** Le code a été repris le 03/10/2026 du socle applicatif d'un autre
titre, « Le Corporate » (magazine économique gabonais). Il a été adapté à
BOMA Infos : charte graphique, rubriques, contenu de démonstration, agents. Ce
qui vient du socle et ne sert pas ici est listé dans « Ce qui vient du socle
d'origine ».

**BOMA Infos n'a aucun site antérieur** : il n'y a ni archive à reprendre ni
adresse à préserver. Rien n'est en ligne à ce jour. Aucun déploiement Convex
cloud ni projet Vercel n'est configuré pour ce projet.

**Coordonnées non communiquées.** La société éditrice, le téléphone et
l'adresse postale ne sont pas connus : `lib/site.ts` les déclare `null`, rien
n'est affiché, et la page `/mentions-legales` les liste comme éléments à
fournir. Le courriel `redaction@bomainfos.com` est déduit du domaine et reste à
confirmer. Voir « À fournir avant la mise en ligne ».

Document de référence : [`CAHIER-DES-CHARGES.md`](./CAHIER-DES-CHARGES.md). Il
garde la numérotation du cahier des charges du socle d'origine, que citent les
commentaires du code (« CDC §5.4 »).
Consignes de construction du socle : [`prompts/`](./prompts).
Audit du site de l'autre titre : [`audit-le-corporate/`](./audit-le-corporate).

**État.** Le socle repris comprend le journal public, l'authentification à
quatre rôles avec vérification par application facultative, le back-office de
rédaction, le portail des entreprises partenaires et son workflow de modération
jusqu'à la publication, et une mesure d'audience sans traqueur tiers. Le lot 4
du cahier des charges (§6.1) l'adapte à BOMA Infos : charte graphique, dix
rubriques, huit agents éditoriaux sous garde-fous — dont la veille de
l'actualité — et un jeu de démonstration fictif.

---

## Démarrage

Prérequis : [bun](https://bun.sh) (gestionnaire de paquets imposé) et Node 20,
22 ou 24. Le backend Convex local exige l'une de ces trois versions pour ses
actions `"use node"`. Sur une machine dont le Node par défaut est plus récent,
préfixer la commande Convex, par exemple :

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" bunx convex dev
```

```bash
bun install

# 1. Pousser le schéma et les fonctions sur le déploiement Convex.
bunx convex dev --once

# 2. Variable attendue par Better Auth, posée SUR le déploiement Convex
#    (pas dans .env.local) :
bunx convex env set SITE_URL http://localhost:3040

# 3. Charger le jeu de démonstration (28 articles, 6 signatures,
#    40 photographies, 6 documents). Sans lui, le site est vide.
bun run seed

# 4. Créer le premier compte. Le dépôt n'en contient AUCUN : ni `admin`,
#    ni mot de passe par défaut — l'audit du site de l'autre titre avait
#    relevé le contraire (CDC §5.3). Le mot de passe est un code à six
#    chiffres, ou douze caractères et plus (comptes entreprise) ; sous douze
#    caractères, il est PROVISOIRE.
bun run compte -- --email=vous@bomainfos.com --nom="Votre nom" \
  --motdepasse=123456 --role=administrateur

# 5. Serveur de développement Next.js
bun run dev            # http://localhost:3040
```

> **`bun run seed` remplace le jeu, il ne le complète pas.** Il efface les
> rubriques, signatures, médias, articles et documents du déploiement visé
> avant de recharger le jeu de démonstration (`seeding:run` avec `reset`). Ne
> pas le lancer sur un déploiement qui contient de vrais articles.

> Un code remis par un administrateur ou par `bun run compte` est
> **provisoire** dès qu'il fait moins de douze caractères, donc pour un code
> à six chiffres : une carte flottante le rappelle, fermable une semaine (le
> choix est mémorisé sur le profil), et rien n'est bloqué entre-temps. Le
> changement se fait depuis « Réglages » (administrateur) ou « Mon compte »
> (tout rôle de rédaction, `/redaction/compte`). La vérification par
> application reste facultative pour tous les rôles : le serveur Convex ne
> refuse jamais un appel pour ce motif.

> Les fichiers dérivés (`public/medias/`, `public/documents/`, `public/icons/`,
> `public/brand/`, `convex/mediaManifest.ts`) sont **versionnés** : la
> compilation ne retélécharge aucune photographie. Ils se régénèrent avec
> `bun run media`, `bun run documents`, `bun run brand` et `bun run icons`.

> **Le backend Convex local ne survit pas à `--once`.** Les pages du journal
> lisent leurs données dans Convex à chaque rendu, et les routes `/api/auth/*`
> s'y adossent : il faut un `convex dev` qui tourne en parallèle du serveur
> Next.
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
> Sans lui, une page du journal ne peut pas être rendue : le serveur Next
> signale « Le journal n'a pas pu être lu depuis Convex ».

Pour rattacher le projet à un compte Convex cloud plutôt qu'au déploiement
local anonyme, le moment venu — aucun projet n'existe à ce jour :
`bunx convex dev --configure=new --project boma-infos` (interactif, demande
l'équipe). **Ne jamais lancer `convex deploy`** sans demande explicite.

### Scripts

| Script               | Effet                                                    |
| -------------------- | -------------------------------------------------------- |
| `bun run dev`        | Serveur de développement Next.js (port 3040)             |
| `bun run build`      | Compilation de production                                |
| `bun run start`      | Serveur de production                                    |
| `bun run typecheck`  | `next typegen` puis `tsc --noEmit`                       |
| `bun run lint`       | ESLint                                                   |
| `bun run format`     | Prettier (écriture)                                      |
| `bun run verify`     | typecheck + lint + build                                 |
| `bun run budget`     | Contrôle du budget de performance (§5.4)                 |
| `bun run seed`       | Remplace le contenu par le jeu de démonstration (Convex) |
| `bun run media`      | Retélécharge et ré-encode les photographies              |
| `bun run documents`  | Régénère les PDF de la docuthèque                        |
| `bun run icons`      | Régénère les icônes de la PWA                            |
| `bun run brand`      | Exporte le logo (SVG, PNG), puis régénère les icônes     |
| `bun run convex:dev` | Backend Convex, en veille                                |
| `bun run dev:full`   | Convex + Next dans un seul processus                     |
| `bun run compte`     | Crée un compte nominatif ; `--revoquer` le ferme         |
| `bun run agents:cle` | Copie `ANTHROPIC_API_KEY` sur le déploiement             |
| `bun run test:i18n`  | Test de la langue de l'interface                         |

`bun run build` enchaîne `next build` **puis** `bun run budget` : une
compilation qui dépasse un plafond du §5.4 échoue, elle n'avertit pas.

`.claude/launch.json` déclare la configuration `dev` pour démarrer le serveur
en un appel depuis l'outillage.

### Tests

```bash
bun test tests/     # dont tests/watch.test.ts, la veille de l'actualité
bun test scripts/   # outillage : langue de l'interface, import WordPress du socle
```

Les gestionnaires Convex y tournent sur une base simulée
(`tests/support/fake-convex.ts`) qui compte aussi les lectures contre les
limites d'une exécution. Aucun test ne contacte un déploiement Convex ni l'API
Claude.

---

## Variables d'environnement

`.env.local` est généré par `convex dev` et **n'est pas versionné**. Le
gabarit versionné est [`.env.example`](./.env.example).

| Variable                      | Où                                                                   | Rôle                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `CONVEX_DEPLOYMENT`           | `.env.local`                                                         | Déploiement visé par la CLI Convex                                                                                        |
| `NEXT_PUBLIC_CONVEX_URL`      | `.env.local`                                                         | URL client du déploiement (WebSocket + HTTP)                                                                              |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `.env.local`                                                         | URL des actions HTTP (routes Better Auth)                                                                                 |
| `NEXT_PUBLIC_SITE_URL`        | `.env.local`, puis l'hébergeur                                       | URL publique du site : canoniques, Open Graph, plan de site, flux RSS. Défaut : `http://localhost:3040`                   |
| `SITE_URL`                    | **sur le déploiement Convex**                                        | URL publique du site, utilisée par Better Auth                                                                            |
| `BETTER_AUTH_SECRET`          | **sur le déploiement Convex**                                        | Chiffre les secrets TOTP. Sans lui, Better Auth en dérive un, et les seconds facteurs ne survivent pas à un redéploiement |
| `ANTHROPIC_API_KEY`           | `.env.local` **et** sur le déploiement Convex (`bun run agents:cle`) | Clé de l'API Claude. Absente, les huit agents passent en mode simulé — voir « Les agents »                                |

Les deux URL Convex sont automatiquement autorisées dans la directive
`connect-src` de la politique de sécurité du contenu (voir
`lib/security-headers.ts`). Les variables de publicité (`ADS_MODE`,
`ADS_FEED_*`, `ADSENSE_*`) et `AUDIENCE_DISABLED` sont décrites dans
`.env.example` ; le raccordement AdSense est détaillé dans
[`docs/adsense.md`](docs/adsense.md).

---

## Structure

```
app/
  layout.tsx                   racine : document seul (langue, polices, thème)
  error.tsx not-found.tsx      états d'erreur soignés, hors groupe de routes
  (journal)/                   LE JOURNAL PUBLIC — en-tête, pied, budget §5.4
    layout.tsx                 masthead + pied ; aucun client Convex monté
    page.tsx                   accueil : une, à la une, dossier, rubriques
    [slug]/                    301 de /<slug> vers /article/<slug>
    article/[slug]/            page d'article + opengraph-image.tsx (1200×630)
    rubrique/[...segments]/    liste paginée, filtres, tri (tout dans le chemin)
    auteur/[slug]/ recherche/ docutheque/ newsletter/
    a-propos/ contacts/ hors-ligne/ mentions-legales/ confidentialite/
    design-system/             galerie /design-system (référence de l'équipe)
  (prive)/                     LES ESPACES PRIVÉS — ConvexClientProvider ici
    connexion/ connexion/verification/   mot de passe, puis second facteur
                                         si activé
    mot-de-passe-oublie/ reinitialisation/
    inscription-entreprise/    demande d'ouverture, validée à la main
    compte/                    profil, vérification par application,
                               sessions révocables
    redaction/                 back-office : tableau de bord, articles,
                               dépôts, médias, agents (dont la veille),
                               statistiques, rubriques, comptes, publicités,
                               réglages, journal d'audit, compte
    entreprise/                portail : dépôts, suivi, statistiques
  api/auth/[...all]/           proxy Better Auth ; `sign-up` fermé
  api/recherche/route.ts       point d'entrée du dialogue Cmd+K
  sitemap.ts robots.ts manifest.ts
  rss.xml/ news-sitemap.xml/   flux et plan de site « actualités »
  globals.css                  TOUS les jetons de design
components/
  ui/                          primitives shadcn/ui — JAMAIS modifiées
  custom/                      compositions maison (éditoriales et interface)
  providers/                   PreferencesProvider, ConvexClientProvider
convex/
  schema.ts                    modèle de données complet (§5.2)
  model/content.ts             validateurs et types partagés des blocs
  model/access.ts              RÔLES ET PERMISSIONS — le seul garde-barrière
  model/audit.ts               journal d'audit + corbeille de notifications
  model/agents.ts              déclaration des huit agents (§4.6)
  model/agentEngine.ts         prompts, analyse, repli hors ligne, coûts
  model/watch.ts               veille : domaines, pistes, vérification des sources
  model/text.ts                temps de lecture, index, slug, périodes
  journal.ts                   requêtes publiques (lecture seule)
  newsletter.ts contact.ts     mutations publiques, validées et limitées
  accounts.ts guard.ts         comptes, rôles, inscription d'entreprise
  newsroom.ts taxonomy.ts      articles + versions, rubriques
  library.ts settings.ts       médiathèque, réglages, agents, redirections
  portal.ts                    dépôts entreprises et workflow de revue
  agents.ts agentRuntime.ts    journal des agents / exécution (action Node)
  newsletterDraft.ts           éditions hebdomadaires composées par l'agent 6
  stats.ts audit.ts            audience, journal d'audit (lecture seule)
  advertising.ts               campagnes d'encarts internes
  crons.ts schedule.ts         ordonnanceur : newsletter, veille, publications datées
  seeding.ts seed/             le jeu de démonstration, en clair
  mediaManifest.ts             GÉNÉRÉ — dimensions et poids exacts des photos
  auth.ts http.ts              Better Auth : mots de passe, TOTP, débit
  wordpressImport.ts           socle d'origine, non utilisé
lib/
  content/server.ts            accès Convex côté serveur (+ ISR)
  media.ts                     srcset, sizes, variantes basse définition
  navigation.ts                arbre éditorial (données) → classes d'accent
  legacy-redirects.ts          redirections 301 d'adresses conventionnelles
  site.ts                      identité du titre, coordonnées (`null` tant que
                               non communiquées), mention de démonstration
  brand.ts i18n.ts             cadre du logo, libellés français et anglais
  ads/                         encarts : politique, flux, AdSense
  format.ts schemas.ts actions.ts headings.ts
  security-headers.ts          TOUS les en-têtes de sécurité, CSP comprise
public/
  medias/                      40 photos × 6 largeurs × 2 formats (AVIF, WebP)
  brand/                       logo exporté (SVG, PNG)
  documents/ icons/ sw.js      docuthèque, icônes PWA, service worker
assets/
  brand/                       maître vectoriel du logo et exports (voir son README)
  fonts/ og/                   polices et fonds JPEG des cartes Open Graph
docs/                          raccordement AdSense, encarts, migration WordPress
scripts/
  fetch-media.ts               télécharge et ré-encode les photographies
  media-sources.ts             les 40 sources des photographies
  make-documents.ts            produit les PDF de la docuthèque
  make-icons.ts                produit les icônes de la PWA
  make-brand.ts                exporte le logo (SVG, PNG)
  create-account.ts            crée ou ferme un compte nominatif (bun run compte)
  push-agent-key.ts            copie ANTHROPIC_API_KEY sur le déploiement
  check-budget.ts              contrôle du §5.4 — fait échouer la compilation
  check-live-budget.ts         même contrôle sur le site servi (workflow quotidien)
  media-thumbnails.ts          rattrapage des vignettes de 240 px (stockage Convex)
tests/                         bun test tests/ — gestionnaires Convex, base simulée
next.config.ts                 en-têtes, cache des médias, redirections 301
```

### Conventions

- **Code en anglais, interface en français.** Toute chaîne visible existe en
  français. Une bascule FR/EN (`components/custom/locale-toggle.tsx`,
  `lib/i18n.ts`) propose une version anglaise de l'interface du journal public
  et de l'espace entreprise ; le contenu des articles n'est pas traduit.
- TypeScript strict, jamais de `any` non justifié par un commentaire.
- `components/ui/` (shadcn) n'est jamais modifié : toute personnalisation
  passe par composition dans `components/custom/`.
- Formulaires : React Hook Form + Zod. Notifications : sonner. Icônes :
  lucide-react.
- Aucune librairie d'animation. Rayons plafonnés à 16 px. Pas d'ombre
  diffuse en dehors des éléments réellement flottants.

---

## Le journal public

### Budget de performance — contraignant

`bun run build` termine par `scripts/check-budget.ts`, qui lit le HTML
prérendu de l'accueil et d'un article, additionne le transfert réel
(document, CSS, JS et polices **gzippés**, images résolues depuis le
`srcset` pour une fenêtre de 412 px) et **sort en erreur** au premier
plafond dépassé :

| Indicateur         | Plafond §5.4 | Constaté le 03/10/2026 |
| ------------------ | ------------ | ---------------------- |
| Poids accueil      | 600 Ko       | 446,7 Ko               |
| Poids article      | 400 Ko       | 376,2 Ko               |
| Requêtes accueil   | 50           | 38                     |
| Requêtes article   | 50           | 27                     |
| JavaScript accueil | 180 Ko       | 163,8 Ko               |
| JavaScript article | 180 Ko       | 167,3 Ko               |

Ces valeurs sont celles de `bun run build` sur le jeu de démonstration. L'article
mesuré, « Après le pétrole : enquête sur les trois piliers de la
diversification », contient une citation avec emphase : sa fonte italique
(21 Ko) est comptée. La marge de l'article est donc de 24 Ko : une photographie
de plus dans un article long peut la consommer.

**Surveillance en production.** La compilation ne voit pas ce que l'ISR
change ensuite. `scripts/check-live-budget.ts` mesure l'accueil et les trois
derniers articles réellement servis, avec les mêmes règles, et sort en erreur
dès **95 %** d'un plafond. `.github/workflows/budget-production.yml` le lance
chaque matin et sur demande ; GitHub prévient par courriel en cas d'échec. Ce
contrôle n'a de sens qu'une fois le site en ligne : tant que
`www.bomainfos.com` ne répond pas, il échoue chaque matin. Le désactiver
(onglet Actions) jusqu'à la mise en ligne, ou le lancer à la main sur une autre
adresse.

```bash
bun run scripts/check-live-budget.ts https://www.bomainfos.com
```

Deux partis pris de mesure, tous deux du côté sévère :

- **DPR 2**, pas 1. Le parc visé est en haute densité et c'est le lecteur
  qui paie les pixels : sur le socle d'origine, la même page d'accueil coûtait
  424 Ko à DPR 1 et 818 Ko à DPR 2 avant correction. C'est la seconde valeur
  qui compte.
- **Pire cas par image** : on compte la plus grande variante que chaque
  `<picture>` peut réclamer, parce qu'un navigateur choisit parfois un cran
  au-dessus de ce que `sizes × DPR` laisse prévoir. Chaque appel à
  `ResponsiveImage` porte donc un `maxWidth` taillé pour sa mise en page.

Sont exclues du total, et signalées à part, les prothèses `nomodule`
(core-js) : aucun navigateur du §5.5 ne les télécharge. Le script en affiche le
poids à chaque compilation. Est en revanche comptée la fonte de l'emphase,
pour une page qui s'en sert (voir « Typographie »).

Font aussi échouer le contrôle : une ressource référencée mais introuvable
sur le disque, et un lien interne malformé (espace ou accolade dans un
`href`). Mieux vaut refuser que servir un 404.

### Images

Aucune optimisation à la volée. `scripts/fetch-media.ts` télécharge des
photographies libres depuis Wikimedia Commons — les 40 sources sont déclarées
dans `scripts/media-sources.ts` —, les recadre en 16:9 et les encode en
**AVIF + WebP à 320, 480, 640, 768, 960 et 1280 px**, puis écrit
`convex/mediaManifest.ts` avec les dimensions, la couleur dominante, l'auteur,
la licence et le **poids exact** de chaque variante. Le script produit aussi un
fond JPEG par photographie pour les cartes Open Graph (`assets/og/`). Trois
conséquences : le budget est calculable à la compilation, la boîte de l'image
est réservée avant le premier octet (CLS nul), et le service worker peut
précacher.

Pour ajouter des photographies sans retélécharger ni ré-encoder les autres,
déclarer leur source dans `scripts/media-sources.ts`, puis :

```bash
bun run scripts/fetch-media.ts --only=identifiant1,identifiant2
```

Les entrées déjà au manifeste sont conservées à l'octet près. Sans `--only`, le
script relance la recherche pour les 40 sources, et une recherche Commons ne
renvoie pas toujours la même photographie.

`<ResponsiveImage>` rend **un seul** `<picture>`, identique pour tout le
monde. L'image de une est en outre préchargée depuis le `<head>`
(`ReactDOM.preload`) et décodée en `async` — `decoding="sync"` imposait un
décodage AVIF avant présentation, soit deux secondes de retard au rendu sur
un processeur bridé.

### Économie de données

Le choix du lecteur vit dans `localStorage` **et** dans un cookie.
`proxy.ts` lit le cookie et réécrit chaque requête d'image vers la variante
480 px : les pages restent entièrement statiques, et l'image prioritaire est
couverte elle aussi. Mesuré sur le socle d'origine, avec sa photographie de
une : 18 713 octets sans le cookie, 11 317 avec.

> Le socle d'origine avait d'abord rendu deux `<picture>` et en masquait un par
> CSS. **Cela ne fonctionnait pas** : Chrome télécharge une image
> `loading="lazy"` même dans un élément `display: none`, la page payait donc
> les deux variantes. Constaté au relevé réseau, pas à la lecture du code.

Les vidéos ne sont jamais préchargées ; en mode économie, leur vignette
disparaît aussi au profit d'un bouton qui annonce le coût du téléchargement
(`HeavyMedia`).

Un cache HTTP `immutable` signifie qu'une photographie déjà téléchargée
n'est pas re-téléchargée en plus petit quand on active le mode — ce qui est
le bon comportement : une image en cache coûte zéro octet.

### Hors-ligne

`public/sw.js`, écrit à la main (pas de Workbox) : réseau d'abord avec
garde-temps de 3,5 s pour les documents, cache d'abord pour les ressources
versionnées, quarante pages conservées, et `/hors-ligne` en dernier recours.
Une bascule du mode économie purge le cache des photographies, sinon le
service worker resservirait celles de l'ancien mode.

> **Non vérifié en navigateur.** Sur le socle d'origine, l'environnement de
> test refusait l'enregistrement des service workers — y compris pour un
> fichier de deux lignes servi par un serveur statique nu, sans politique de
> sécurité : le refus ne venait donc pas du projet. Ce qui se vérifie sans
> navigateur : `next.config.ts` déclare `Service-Worker-Allowed: /` et
> `Cache-Control: public, max-age=0, must-revalidate` pour `/sw.js`, la
> syntaxe de `public/sw.js` passe `node --check`, et la page `/hors-ligne`
> existe. **La lecture hors-ligne reste à recetter sur un vrai appareil.**

### Référencement

Un seul `<h1>` par page, métadonnées et canoniques par page, `NewsArticle` +
`NewsMediaOrganization` + `BreadcrumbList` (avec le niveau « Accueil »),
`sitemap.xml`, `news-sitemap.xml`, `rss.xml`, `robots.txt`, et une image Open
Graph 1200×630 générée pour chaque article, composée comme la charte (fond
marine, logo, titre en serif blanche, filet tricolore, adresse du site) sur la
photographie de l'article.

**Redirections.** `lib/legacy-redirects.ts` ne contient plus le plan d'un
ancien site : BOMA Infos n'en a pas. Il garde des adresses conventionnelles,
celles que lecteurs, lecteurs de flux et moteurs de recherche essaient sur tout
site d'actualité (`/feed`, `/about`, `/category/<slug>`, `/author/<slug>`,
`/tag/<slug>`), et les points d'entrée d'un CMS que les robots sondent
(`/wp-json`, `/wp-login.php`…), renvoyés à l'accueil sans laisser de trace de
ce qui est installé. Toutes répondent en 301. La route
`app/(journal)/[slug]/page.tsx` renvoie un chemin à un segment vers
`/article/<slug>` quand un article porte ce slug ; sinon la 404 reste.

### Volume du fonds — aucune lecture de toute la table

Un article pèse environ 6 Ko et une fonction Convex ne lit pas plus de
16 Mio. Constaté sur le socle d'origine : jusqu'au 19/09/2026, l'accueil, les
articles liés, les rubriques et tout le back-office relisaient la table
`articles` entière, et seraient tombés vers 2 500 articles (panne reproduite
sur un backend local à 3 057). Le code repris est celui d'après correction :

- les listes lisent ce qu'elles montrent par leur index (`take`,
  `paginate`) ; le plan du site parcourt les slugs par pages de 200
  (`journal.publishedSlugPage`) ;
- les comptes (badges, tableau de bord, filtres de rubrique, pagination,
  auteurs) viennent de la table `articleCounts`, tenue dans la transaction
  de chaque écriture. **Toute écriture sur `articles` passe par
  `convex/model/articleWrites.ts`** (`insertArticle`, `patchArticle`,
  `deleteArticle`) ; sinon les comptes dérivent ;
- après un déploiement qui introduit `articleCounts`, ou pour réparer une
  dérive : `bunx convex run articleCounts:rebuild` (avec `--prod` sur la
  production ; par pages, rapide ; la vérification horaire `ensureBuilt` le
  lance si personne ne l'a fait).

Mesuré sur le socle d'origine, avec le fonds de l'autre titre (octets lus par
exécution) : accueil 6,4 Mio → 377 Kio, articles liés 6,4 Mio → 34 Kio,
`navCounts` 6,3 Mio → 0,6 Kio. Tests d'équivalence avec les anciens parcours
complets : `tests/journal-reads.test.ts`, `tests/newsroom-reads.test.ts`.

### Contenu de démonstration

Le jeu de `convex/seed/` est **fictif** : personnes, entreprises, citations et
chiffres sont inventés, à l'échelle réelle du Gabon. Il compte 28 articles,
6 signatures, 40 photographies libres de Wikimedia Commons (auteur et licence
au manifeste) et 6 documents, des PDF d'une page marqués comme démonstration.
Les institutions existantes ne sont citées qu'en contexte neutre ; aucun propos
n'est attribué à une personne réelle ni au titulaire d'une fonction ; les
articles politiques décrivent des procédures, sans parti ni personnalité.

Une mention le dit en pied de chaque page, en tête de chaque article et là où
les signatures sont présentées comme des personnes (équipe de « À propos »,
page d'un auteur) : `DEMO_CONTENT_NOTICE` dans `lib/site.ts`. La passer à
`null` et retirer le jeu de données quand la rédaction publie ses propres
articles. `bun run seed` remplace tout le contenu du déploiement visé : voir
« Démarrage ».

---

## La chaîne éditoriale

### Comptes et rôles

Quatre rôles, déclarés une seule fois dans `convex/model/access.ts` :

| Rôle                      | Périmètre                                                                               | Vérification par application |
| ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| **Administrateur**        | Tout : publication, rubriques, comptes, réglages, agents, statistiques, journal d'audit | facultative                  |
| **Éditeur / Journaliste** | Rédige, publie dans ses rubriques autorisées, revoit les dépôts. Ni comptes ni réglages | facultative                  |
| **Client / Entreprise**   | Son espace seul : dépôts, statuts, statistiques de ses publications                     | facultative                  |
| **Lecteur**               | Son compte                                                                              | facultative                  |

**Le contrôle est dans Convex, pas dans l'interface.** Chaque fonction commence
par `requireViewer`, `requirePermission` ou `requireOrganizationScope` ; la
navigation du back-office masque ce qu'un rôle ne peut pas faire, mais c'est une
politesse. Un Éditeur qui appelle `accounts:setRole` ou `settings:save` en HTTP
direct reçoit `FORBIDDEN`, exactement comme dans l'écran.

Trois points répondent à des défauts relevés par l'audit du site de l'autre
titre (`audit-le-corporate/`) :

- **Aucun identifiant par défaut.** Le dépôt ne contient aucun compte.
  `bun run compte` en crée un, nominatif, avec un mot de passe choisi à cet
  instant ; `bun run compte -- --email=… --revoquer` le ferme (profil
  désactivé, sessions supprimées, geste inscrit au journal d'audit au nom de
  la ligne de commande). `POST /api/auth/sign-up/*` est **fermé au navigateur** : cet appel
  répond différemment selon que l'adresse existe déjà, c'est un oracle. Les deux
  créations légitimes — un administrateur qui ouvre un compte, une entreprise
  qui demande un espace — passent par des fonctions serveur.
- **Aucune énumération.** La connexion répond `INVALID_EMAIL_OR_PASSWORD` avec
  le même corps et le même temps qu'une adresse soit connue ou non ; le
  formulaire d'inscription d'entreprise répond « demande enregistrée » dans tous
  les cas ; aucune API ne liste les comptes à qui n'est pas administrateur.
- **Limitation de débit** en base : dix connexions par minute et par IP, cinq
  vérifications de second facteur, trois demandes de réinitialisation par
  cinq minutes.

La vérification par application est du TOTP, **facultative pour les quatre
rôles** (décision du client du socle d'origine, le 12/09/2026, reprise telle
quelle) : « Mon compte » (`/compte`, ou `/redaction/compte` sans quitter le
back-office) et « Réglages » (administrateur) affichent un code QR, l'adresse
`otpauth://` en clair et dix codes de secours à usage unique. Le compte n'est
marqué comme protégé qu'après avoir saisi un code produit par l'application ;
ne pas l'activer ne retire aucune permission — `convex/model/access.ts` ne
refuse plus rien pour ce motif.

> **`better-auth` est épinglé à 1.6.21.** À partir de 1.6.22 le greffon
> `twoFactor` écrit deux colonnes de verrouillage de compte que le schéma du
> composant `@convex-dev/better-auth@0.12.5` — le dernier publié — ne connaît
> pas ; l'activation échouait sur une erreur de validation du composant. Ce qui
> est perdu est remplacé : la force brute sur le second facteur reste couverte
> par la limitation de débit. À lever dès que le composant rattrape l'amont.

### Portail entreprise

`brouillon → soumis → en revue → modifications demandées → (re-soumis) →
programmé → publié`, ou `refusé` **avec motif obligatoire** — refusé côté
serveur, pas seulement marqué `required` dans le HTML.

Deux invariants, tous deux dans Convex :

- **Cloisonnement.** `requireOrganizationScope` lit l'entreprise dans la
  session. L'identifiant n'est jamais pris dans les arguments : une entreprise
  qui passe celui d'une autre reçoit `FORBIDDEN`, le même code qu'un identifiant
  inexistant, pour que l'API ne réponde pas non plus à la question « ce dépôt
  existe-t-il ».
- **Mention « Contenu partenaire ».** L'article créé à la publication porte
  `origin: "partenaire"`, écrit par la mutation de la rédaction. Aucun champ du
  formulaire de dépôt n'y touche : l'entreprise ne peut pas l'enlever.

Chaque transition compose sa notification, par courriel et par WhatsApp quand le
numéro est renseigné. Aucun prestataire n'est branché sur ce déploiement : les
messages sont conservés dans une corbeille de sortie visible sous
`/redaction/depots`, plutôt que d'afficher « un courriel vous a été envoyé » et
n'envoyer rien.

### Médiathèque — envoi d'images

Les images s'ajoutent depuis l'écran (`/redaction/medias`, `convex/library.ts`),
sans script à lancer. Chaque photo est décodée et encodée en **WebP à 240,
320, 640, 960 et 1280 px** (sans dépasser sa largeur d'origine) par le
navigateur lui-même — aucun traitement serveur — puis chaque taille est envoyée
au stockage de fichiers Convex. La largeur de 240 px sert les vignettes de
liste (96 px sur un téléphone) ; pour les images stockées sans elle,
`bun run scripts/media-thumbnails.ts` la rajoute, de façon idempotente
(`--simulation` pour compter d'abord, `--prod` pour la production). Le texte
alternatif reste **obligatoire avant de placer l'image** dans un article : le
champ est requis à l'écran, et le validateur Convex ne l'accepte pas vide.

**Aucun écran ne charge toute la photothèque.** La règle vient d'une panne
« Too many reads » constatée sur le socle d'origine le 19/09/2026, avec les
images de l'archive de l'autre titre. La médiathèque et le sélecteur d'images
lisent des pages de 48 et 24 images (`library.list`, `library.pick`), cherchées
et filtrées sur le serveur (index `search_media`, `by_uploaded`,
`by_alt_missing`) ; une image déjà choisie est retrouvée par sa clé
(`library.byKeys`). Le nombre d'articles qui affichent une image vient de la
table `mediaUsages`, tenue par `syncArticleMedia` à chaque écriture d'article :
toute nouvelle mutation qui modifie la une, la galerie ou le corps d'un article
doit l'appeler. Les compteurs sont bornés (« 999+ »). Après un déploiement qui
ajoute ces index, ou pour réparer une dérive, lancer
`bunx convex run library:reindex` (avec `--prod` sur la production ; par lots
cadencés, idempotent ; il tourne aussi chaque nuit) : tant qu'il n'a pas
terminé une première fois, l'écran le signale, l'usage n'est pas affiché et la
suppression d'une image relit les articles.

### Les agents

Les huit agents du §4.6 tournent dans une **action Convex**
(`convex/agentRuntime.ts`) — l'ordonnanceur porte donc réellement les
traitements longs (transcription, newsletter hebdomadaire, veille) et aucun
formulaire n'attend un modèle. Les sept premiers travaillent sur un contenu que
la rédaction détient déjà ; le huitième, la veille, va chercher l'actualité sur
le web. La consigne des sept premiers porte le contexte de BOMA Infos :
actualité générale du Gabon, exactitude d'abord et neutralité — en politique
plus qu'ailleurs : ni jugement, ni rumeur, ni propos prêté à quelqu'un sans
source nommée.

| #   | Agent                 | Déclencheur                                               | Repli manuel                                           |
| --- | --------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| 1   | Relecture             | à l'enregistrement / à la demande                         | la relecture reste manuelle                            |
| 2   | Titraille             | à la demande                                              | les champs se saisissent à la main                     |
| 3   | SEO                   | à la demande                                              | slug dérivé du titre, métadonnées à la main            |
| 4   | Média                 | depuis la médiathèque                                     | le texte alternatif reste obligatoire, saisi à la main |
| 5   | Modération des dépôts | à la soumission (ordonnanceur)                            | la revue se fait sans fiche                            |
| 6   | Diffusion             | à la publication, et chaque jeudi pour la newsletter      | rédaction à la main                                    |
| 7   | Transcription         | à la demande (différé)                                    | transcription à la main                                |
| 8   | Veille de l'actualité | chaque matin (tour d'horizon) et à la demande par domaine | la veille se fait à la main                            |

**Un agent propose, un humain dispose.** Aucune fonction n'écrit un champ d'elle-même :
`agents:decide` est le seul chemin d'une proposition vers le contenu, et il exige
une session. Une proposition **rejetée** laisse l'empreinte de sa valeur et n'est
plus jamais re-proposée pour la même cible.

Trois barrières avant chaque appel : l'interrupteur de l'agent, le plafond de
dépense mensuel et, pour les agents lancés depuis l'écran, la permission de
l'appelant. Une exécution bloquée est quand même journalisée, avec son motif et
le repli correspondant.

#### Clé d'API : réel ou simulé, sans changement de code

Une seule variable, `ANTHROPIC_API_KEY`, lue avec `process.env` :

- **présente** → l'API Claude est appelée (`@anthropic-ai/sdk`), modèle
  `claude-sonnet-5` pour le volume, `claude-opus-5` pour les deux tâches où une
  erreur coûte quelque chose à la rédaction : la titraille et la
  pré-qualification d'un dépôt, et `claude-opus-5-5` pour la veille, qui lit des
  pages qu'elle n'a jamais vues. Le coût réel de chaque exécution est calculé
  depuis `usage` et imputé au plafond mensuel ;
- **absente ou vide** → un **repli hors ligne** prend la main. Ce n'est pas un
  jeu de réponses factices : la passe typographique applique réellement les
  règles françaises (espace fine insécable avant `; : ! ?`, guillemets « »,
  capitales accentuées, apostrophe typographique), le maillage interne compare
  réellement les mots-clés au fonds publié, la pré-qualification d'un dépôt
  cherche réellement les tournures promotionnelles et les chiffres non sourcés.
  Chaque proposition est étiquetée **« simulation »** de la ligne de journal
  jusqu'à la carte, et la ligne dit pourquoi. Rien n'est jamais présenté comme
  une réponse de modèle.

Le passage de l'un à l'autre est la seule présence de la clé. Comme les agents
s'exécutent dans Convex, la clé doit être posée sur le déploiement :

```bash
# renseigner ANTHROPIC_API_KEY dans .env.local, puis :
bun run agents:cle
```

Un appel qui échoue (clé invalide, panne, quota) retombe sur le même repli : la
chaîne éditoriale ne s'arrête pas, la ligne du journal porte l'erreur exacte, et
la proposition affichée est étiquetée « simulation ». Aucune clé n'est posée sur
ce déploiement à ce jour : les huit agents tournent en mode simulé.

#### La veille de l'actualité

Le huitième agent cherche sur le web l'actualité du Gabon dans sept domaines —
politique, économie, société, tourisme, environnement, culture, sport — sur les
sept derniers jours. Il utilise l'outil de recherche web de l'API Claude
(`web_search_20260209`, six recherches au plus par exécution) ; modèle par
défaut : `claude-opus-5-5`.

Il rend des **pistes de sujets**, cinq au plus par exécution. Une piste n'est
pas un article : titre de travail, faits en deux ou trois phrases, « pourquoi
maintenant », rubrique suggérée, sources.

- **Une piste sans page derrière elle n'existe pas.** Chaque source citée est
  confrontée aux adresses que la recherche a réellement rapportées pendant
  l'exécution (`verifyLeads`, `convex/model/watch.ts`). Une source introuvable
  est retirée ; une piste sans source est écartée. La fiabilité affichée est
  « recoupée » (au moins deux sites), « source unique » (une page, ou plusieurs
  du même site) ou « non vérifiée » : ce dernier cas se présente quand
  l'exécution ne laisse aucune trace de ses recherches, la vérification est
  alors impossible, et les pistes sont gardées en le disant.
- **Pas de doublon.** Une piste déjà vue — en attente, retenue ou écartée — ne
  revient pas, même reformulée : elle est reconnue à sa première source, dont
  l'adresse est ramenée à une seule graphie (sans fragment, sans paramètre de
  suivi, sans barre finale). Écarter une piste est donc définitif pour la
  veille : le tableau propose « Annuler » pendant dix secondes après le geste
  (`agents:reopen`). Une piste retenue ne se rouvre pas, son brouillon existe.
- **Un brouillon, jamais un article.** Retenir une piste ouvre un brouillon qui
  commence par la note de veille et ses sources ; rien n'est publié ni rédigé à
  la place du journaliste. Le tableau des pistes est dans `/redaction/agents`,
  où la veille se lance aussi à la demande, par domaine.
- **Sans clé d'API, aucune piste inventée.** Aucune recherche n'est lancée.
  L'agent signale les rubriques sans parution depuis plus de sept jours et donne
  les recherches à lancer à la main.
- **Planification.** `convex/crons.ts` la lance chaque jour à 05:30 UTC (06:30 à
  Libreville), pour un tour d'horizon des sept domaines. Coût : les jetons du
  modèle plus 10 $ les mille recherches, imputés au même plafond mensuel (25 $
  par défaut) que les autres agents. L'interrupteur de l'agent, dans les
  réglages, coupe aussi la tâche planifiée : l'exécution est alors journalisée
  comme bloquée.

> **Limite.** La branche « API réelle » de la veille est écrite et typée. La
> logique qui l'entoure — consigne, lecture de la réponse, vérification des
> sources, coût, dédoublonnage, ouverture du brouillon, repli hors ligne — est
> couverte par `tests/watch.test.ts`. Mais l'appel à l'API lui-même
> (`searchTheWeb`, `convex/agentRuntime.ts`) **n'a jamais été exécuté contre
> l'API** : aucune clé n'est posée sur ce déploiement. Le premier appel réel est
> à surveiller : pistes rendues, sources retenues ou retirées, coût inscrit au
> journal des agents.

### Statistiques, sans traqueur tiers

Aucun traqueur tiers n'est chargé. Une vue est comptée par `proxy.ts` **au
passage de la requête** : côté serveur, sans cookie, sans identifiant, sans
JavaScript, sans requête supplémentaire — donc sans un octet au budget du §5.4.
Ce qu'un serveur ne peut pas savoir, la durée de lecture et le canal de
partage, vient d'un composant client minuscule (`AudienceBeacon`) qui envoie
deux nombres et rien d'autre. `AUDIENCE_DISABLED=1` désactive les compteurs
(recette locale).

Aucune ligne enregistrée ne décrit un lecteur : trois compteurs par article et
un seau par jour. La rédaction voit l'audience par article, par rubrique et par
jour ; l'entreprise voit **ses** publications, le périmètre étant résolu dans
Convex à partir de la session.

**Une vue n'écrit jamais l'article** : elle ne touche que `articleStats` et
`articleStatDays`, et l'article n'est lu qu'à la première vue, pour créer sa
ligne. Réécrire l'article à chaque visite invalidait toutes les requêtes qui
l'avaient lu, pour chaque onglet ouvert (constaté sur le socle d'origine,
corrigé le 19/09/2026). Le compte affiché au lecteur est `articles.views`
(figé : la valeur de départ de l'article — celle, fictive, du jeu de
démonstration, ou 0 pour un article créé depuis) plus les vues comptées depuis
(`displayedViews`, `convex/model/audience.ts`). Le tableau de bord lit un
instantané, `audienceSnapshots`, recalculé toutes les 15 minutes à partir des
seaux du jour (`stats.refreshAudience`).

---

## Charte graphique

La page [`/design-system`](http://localhost:3040/design-system) présente la
palette en clair et en sombre, l'échelle typographique, les espacements, les
formes et tous les composants dans chacun de leurs états. Elle n'est pas
indexée (`robots: noindex`).

Source de vérité des jetons : `app/globals.css`. `lib/design-tokens.ts` en est
un miroir destiné à l'affichage ; garder les deux synchronisés. Les valeurs ont
été relevées sur la carte « citation » fournie par le propriétaire.

### Trois partis pris

- Le **marine** porte l'identité : bandeau, une, en-tête d'article, carte
  « citation », pied de page, et tout le thème sombre.
- L'**or** souligne : emphase sur le marine, ornement sur le blanc, où il ne
  porte jamais de texte.
- Le **filet tricolore** vert-jaune-bleu, couleurs du drapeau gabonais
  (proportions 24 / 37 / 39 %), signe la page. Il reste décoratif : aucune
  information ne passe par lui seul.

### Logo

« BOMA » en Source Serif 4 Semibold, « infos » en Inter ExtraBold, trois
pastilles verte, jaune et bleue au-dessus de « infos ». Le logo est partagé par
le bandeau, le pied de page, la connexion, le compte et les espaces privés via
`BrandWordmark`. Les lettres suivent le thème de l'endroit où elles se trouvent
(marine sur une page blanche, blanches sur le marine) ; les pastilles gardent
leurs trois couleurs. Le dessin est vectoriel, sans police supplémentaire.

Le maître vectoriel est `assets/brand/boma-infos.svg`. **Il a été redessiné
d'après l'image de la charte** : aucun fichier source du logo n'a été fourni. Un
logo officiel en vectoriel, s'il existe, le remplace. `bun run brand` exporte
les SVG et PNG et régénère les icônes (B capital blanc sur marine, souligné des
trois pastilles). Voir le [maître et ses exports](assets/brand/README.md).

### Palette

|                 | Clair               | Sombre              |
| --------------- | ------------------- | ------------------- |
| Fond de page    | `#FFFFFF`           | `#050D2B`           |
| Surface douce   | `#F3F6FB`           | `#101C41`           |
| Carte           | `#FFFFFF`           | `#091436`           |
| Texte           | `#0D152A` (18,14:1) | `#ECF0F9` (16,74:1) |
| Texte atténué   | `#4B556C` (7,46:1)  | `#ACB7D2` (9,52:1)  |
| Action primaire | `#0B1848`           | `#F7C755`           |
| Accent textuel  | `#0D54C6` (6,77:1)  | `#F7C755` (12,06:1) |

Couleurs de marque : marine `navy-900` `#0B1848`, fond de la charte `navy-950`
`#030921`, or `gold-400` `#F7C755`, vert `#38AA75`, jaune `#FCC546`, bleu
`#1765E6`.

Deux règles à ne pas enfreindre :

- **L'or `#F7C755` ne porte jamais de texte sur blanc** — 1,58:1. Il sert aux
  aplats, filets et ornements. Dès qu'il faut du texte or sur blanc, c'est
  `gold-800` `#735606` (6,86:1).
- **Le marine `#0B1848` ne porte jamais de texte sur le fond nuit** — 1,13:1.
  Les titres y passent à `--foreground`, l'action primaire à l'or.

**Îles marine.** La classe `dark` posée sur un sous-arbre lui applique les
jetons du thème sombre quel que soit le thème de la page : le bandeau, la une,
la carte « citation » et le pied de page gardent ainsi les couleurs de la
charte.

Utilitaires de la charte, dans `app/globals.css` : `boma-rule` (filet
tricolore), `boma-field` (fond marine à trame de points et halo) et
`.boma-quote em` (emphase).

Les ratios mesurés sont affichés dans la section « Accessibilité » de
`/design-system`.

### Typographie

- **Titres** : Source Serif 4, une seule graisse statique chargée, 600. Demander
  deux graisses fait répondre Google Fonts par le fichier variable de 51 Ko au
  lieu d'un fichier de 22 Ko. Un titre qui réclame 700 ou 800 reçoit donc le
  600 tel quel, sans faux gras.
- **Corps et interface** : Inter variable, un seul fichier pour toutes les
  graisses.
- **Emphase** : Source Serif 4 grasse italique, en or sur le marine. C'est une
  troisième face, jamais préchargée : seule une page qui s'en sert (la carte
  « citation », où `*les mots*` d'une citation deviennent l'emphase) la
  télécharge, et `scripts/check-budget.ts` la compte alors (repère
  `data-face="emphase"`).

Les polices sont téléchargées à la compilation (`next/font/google`, sous-ensemble
`latin`) puis servies par le site lui-même : le lecteur ne contacte aucun service
de polices.

---

## Sécurité

En-têtes posés par `next.config.ts` : HSTS (`max-age=31536000;
includeSubDomains; preload`), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` restrictive, `Cross-Origin-Opener-Policy`,
`Cross-Origin-Resource-Policy`, `X-DNS-Prefetch-Control: off`.

La `Content-Security-Policy` vit dans `lib/security-headers.ts`. La politique
suivante s'applique aux modes `campaigns`, `off` et `preview`, ainsi qu'à une
configuration AdSense incomplète :

```
default-src 'self'; base-uri 'none'; object-src 'none';
frame-ancestors 'none'; frame-src 'none'; form-action 'self';
script-src 'self' 'unsafe-inline'; script-src-attr 'none';
style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: <origines HTTP Convex>;
font-src 'self'; media-src 'self'; worker-src 'self' blob:;
manifest-src 'self'; connect-src 'self' <URL Convex>;
upgrade-insecure-requests
```

Dans ces modes, `'unsafe-eval'` est ajouté **en développement seulement**
pour Turbopack. `'unsafe-inline'` autorise les scripts React Server Components
produits par Next dans le HTML prérendu. Aucun script publicitaire tiers
n'est chargé ; les images envoyées à la médiathèque utilisent les origines
HTTP du déploiement Convex. `upgrade-insecure-requests` n'apparaît qu'en
production.

**Avec une configuration AdSense complète**, `proxy.ts` produit un nonce
aléatoire par requête et remplace la CSP de la réponse. Le root layout rend
alors le HTML dynamiquement ; Next, les préférences, JSON-LD, la CMP et
AdSense reçoivent ce nonce. Cette politique utilise `strict-dynamic` et
`unsafe-eval`, y compris en production, et autorise les ressources
publicitaires HTTPS. Les origines des styles et polices de la CMP restent
limitées à la configuration. `script-src-attr 'none'`, `base-uri 'none'`,
`frame-ancestors 'none'` et `form-action 'self'` restent appliqués.

Le mode, les identifiants d'éditeur et d'unités et la configuration CMP
doivent être présents **au build et au runtime**. Leur modification nécessite
une reconstruction et une nouvelle livraison : changer seulement les
variables de `next start` peut associer un nouveau nonce à un ancien HTML
prérendu et bloquer l'hydratation. Le cache hors ligne exclut les documents
à nonce ou `no-store`. Voir [le raccordement AdSense](docs/adsense.md).

Dans ce mode dynamique, le contrôle de budget mesure le HTML local et les
ressources propriétaires référencées, avant consentement. Il exclut les
téléchargements Google et CMP, y compris le script CMP chargé avant le
choix du lecteur ; leur poids doit être mesuré séparément avec la
configuration réelle.

Les en-têtes de cache restent : un an d'`immutable` sur `/medias`,
`/icons` et les fichiers versionnés (une image déjà téléchargée n'est plus
redemandée ; l'audit du site de l'autre titre relevait l'absence totale de
`Cache-Control` sur ses images), `Vary: Cookie` sur `/medias` puisque
`proxy.ts` y sert une variante selon le mode économie, et `must-revalidate`
sur `/sw.js`.

S'y ajoutent, côté application :

- mot de passe **six chiffres exactement, ou douze caractères et plus** —
  jamais huit (`convex/model/password.ts`) ;
- **limitation de débit en base** sur la connexion, le second facteur et la
  réinitialisation — l'audit du site de l'autre titre relevait l'absence totale
  de limitation ;
- **anti-robot** sur l'inscription d'entreprise : champ piège et temps minimum
  sur le formulaire, comme sur le contact public, plutôt qu'un CAPTCHA qui
  taxerait chaque visiteur réel ;
- **journal d'audit en ajout seul** : `convex/audit.ts` n'exporte aucune
  mutation, donc aucun point d'entrée ne modifie ni ne supprime une ligne ;
- **validation Zod ou validateur Convex sur toute entrée** : les arguments des
  fonctions Convex sont typés et validés avant d'atteindre le gestionnaire.

**Ce qui reste à durcir avant une mise en ligne réelle** : TLS 1.2 minimum (au
niveau de l'hébergeur, pas du code), rotation des clés JWKS de Better Auth,
sauvegardes chiffrées avec restauration testée, analyse de vulnérabilités des
dépendances en intégration continue, et le retrait du jeu de démonstration.

---

## Ce qui vient du socle d'origine

Ce dépôt part du socle applicatif de « Le Corporate », un autre titre. Ce qui
suit en vient et ne sert pas ici, ou en porte encore la trace.

- **Outillage d'import WordPress.** `scripts/export-wordpress.py`,
  `scripts/prepare-wordpress.py`, `scripts/prepare-wordpress-media.ts`,
  `scripts/import-wordpress.ts`, `convex/wordpressImport.ts` et
  `docs/MIGRATION-WORDPRESS.md` visent l'archive de l'autre titre. Ils ne sont
  **pas utilisés** : BOMA Infos n'a pas d'archive. Il en reste trois traces :
  les champs facultatifs `wordpressId` du schéma (tables `media`, `articles` et
  `documents`) et leurs index, la route `app/documents/[file]/route.ts` (liens
  stables vers les PDF migrés) et `scripts/wordpress-import.test.ts`, que
  `bun test scripts/` exécute.
- **`audit-le-corporate/`** est l'audit du site de cet autre titre. Plusieurs
  exigences du cahier des charges (§5.3 sécurité, §5.4 budget) en sont nées.
- **`prompts/`** contient les consignes de construction du socle, conservées
  comme historique technique.
- **Références « CDC § ».** Les commentaires du code renvoient au
  `CAHIER-DES-CHARGES.md`, dont la numérotation est conservée.
- **Préfixe `lc-`.** Les classes CSS et identifiants internes préfixés `lc-`
  (`lc-fr`, `lc-en`, `lc-hero`, `lc-media`, `lc-ad-slot`…) datent du socle ; ils
  n'ont pas été renommés.
- **Constats datés.** Quand ce README cite une panne, une mesure ou une
  décision datée, elle a été faite sur le socle d'origine et le texte le dit :
  ce ne sont pas des événements de BOMA Infos.

---

## À fournir avant la mise en ligne

- [ ] **Société éditrice, directeur de la publication et mentions légales.** La
      page `/mentions-legales` liste ce qui manque : directeur de la
      publication, raison sociale et forme juridique, RCCM et NIF, récépissé
      HAC, adresse postale, téléphone, courriel définitif, hébergeur, ISSN le
      cas échéant.
- [ ] **Téléphone et adresse de la rédaction** (`phone`, `phoneHref` et
      `address` dans `lib/site.ts`, aujourd'hui `null`).
- [ ] **Courriel de la rédaction.** Confirmer `redaction@bomainfos.com` : la
      boîte doit exister.
- [ ] **Comptes WhatsApp, LinkedIn et Facebook réels.** Les liens actuels sont
      génériques (`lib/site.ts`, `components/custom/footer.tsx`, valeurs par
      défaut de `convex/settings.ts`).
- [ ] **Logo officiel en vectoriel**, s'il existe : il remplace le maître
      redessiné, puis `bun run brand`.
- [ ] **Nom de domaine et DNS** de `www.bomainfos.com` ; régler
      `NEXT_PUBLIC_SITE_URL` et `SITE_URL` dessus.
- [ ] **Projet Convex cloud et hébergement.** Aucun n'est configuré ; poser
      `SITE_URL` et `BETTER_AUTH_SECRET` sur le déploiement Convex.
- [ ] **`ANTHROPIC_API_KEY`** (`bun run agents:cle`) et premier appel réel de la
      veille, surveillé.
- [ ] **Prestataire de courriel.** Aucun n'est branché : les notifications du
      portail restent dans la corbeille de sortie, et la confirmation
      d'inscription à la newsletter n'est pas envoyée par courriel.
- [ ] **Contrôle quotidien du budget en production**
      (`.github/workflows/budget-production.yml`) : à activer une fois le site
      en ligne.
- [ ] **Retrait du jeu de démonstration et de sa mention**
      (`DEMO_CONTENT_NOTICE` à `null`).
