# Le Corporate — refonte applicative

Magazine économique gabonais édité par **Up Concept**. Ce dépôt remplace le
WordPress historique (WP 6.3.10 / Elementor / thème Newzin).

Document de référence : [`CAHIER-DES-CHARGES.md`](./CAHIER-DES-CHARGES.md).
Prompts d'implémentation par lot : [`prompts/`](./prompts).
Audit de l'existant : [`audit-le-corporate/`](./audit-le-corporate).

**État : lot 3 livré — la chaîne éditoriale complète.** Au journal public des
lots 1 et 2 s'ajoutent l'authentification à quatre rôles avec vérification
par application facultative, le back-office de rédaction, le portail des
entreprises partenaires et son workflow de modération jusqu'à la publication,
les sept agents éditoriaux sous garde-fous, et une mesure d'audience sans
traqueur tiers.

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

# 4. Créer le premier compte. Le dépôt n'en contient AUCUN : ni `admin`,
#    ni mot de passe par défaut — l'audit avait relevé le contraire sur
#    l'ancien site (CDC §5.3). Le mot de passe est un code à six chiffres,
#    ou douze caractères et plus (comptes entreprise) ; sous douze
#    caractères, il est PROVISOIRE.
bun run compte -- --email=vous@le-corporate.com --nom="Votre nom" \
  --motdepasse=123456 --role=administrateur

# 5. Serveur de développement Next.js
bun run dev            # http://localhost:3000
```

> Un code remis par un administrateur ou par `bun run compte` est
> **provisoire** dès qu'il fait moins de douze caractères, donc pour un code
> à six chiffres : une carte flottante le rappelle, fermable une semaine (le
> choix est mémorisé sur le profil), et rien n'est bloqué entre-temps. Le
> changement se fait depuis « Réglages » (administrateur) ou « Mon compte »
> (tout rôle de rédaction, `/redaction/compte`). La vérification par
> application reste facultative pour tous les rôles : le serveur Convex ne
> refuse jamais un appel pour ce motif.

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

| Script               | Effet                                                    |
| -------------------- | -------------------------------------------------------- |
| `bun run dev`        | Serveur de développement Next.js (port 3000)             |
| `bun run build`      | Compilation de production                                |
| `bun run start`      | Serveur de production                                    |
| `bun run typecheck`  | `next typegen` puis `tsc --noEmit`                       |
| `bun run lint`       | ESLint                                                   |
| `bun run format`     | Prettier (écriture)                                      |
| `bun run verify`     | typecheck + lint + build                                 |
| `bun run budget`     | Contrôle du budget de performance (§5.4)                 |
| `bun run seed`       | Charge le jeu de démonstration dans Convex               |
| `bun run media`      | Retélécharge et ré-encode les photographies              |
| `bun run documents`  | Régénère les PDF de la docuthèque                        |
| `bun run icons`      | Régénère les icônes de la PWA                            |
| `bun run convex:dev` | Backend Convex, en veille                                |
| `bun run dev:full`   | Convex + Next dans un seul processus                     |
| `bun run compte`     | Crée un compte nominatif (lot 3) ; `--revoquer` le ferme |
| `bun run agents:cle` | Copie `ANTHROPIC_API_KEY` sur le déploiement             |

`bun run build` enchaîne `next build` **puis** `bun run budget` : une
compilation qui dépasse un plafond du §5.4 échoue, elle n'avertit pas.

`.claude/launch.json` déclare la configuration `dev` pour démarrer le serveur
en un appel depuis l'outillage.

---

## Variables d'environnement

`.env.local` est généré par `convex dev` et **n'est pas versionné**. Le
gabarit versionné est [`.env.example`](./.env.example).

| Variable                      | Où                                                                   | Rôle                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `CONVEX_DEPLOYMENT`           | `.env.local`                                                         | Déploiement visé par la CLI Convex                                                                                        |
| `NEXT_PUBLIC_CONVEX_URL`      | `.env.local`                                                         | URL client du déploiement (WebSocket + HTTP)                                                                              |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `.env.local`                                                         | URL des actions HTTP (routes Better Auth)                                                                                 |
| `SITE_URL`                    | **sur le déploiement Convex**                                        | URL publique du site, utilisée par Better Auth                                                                            |
| `BETTER_AUTH_SECRET`          | **sur le déploiement Convex**                                        | Chiffre les secrets TOTP. Sans lui, Better Auth en dérive un, et les seconds facteurs ne survivent pas à un redéploiement |
| `ANTHROPIC_API_KEY`           | `.env.local` **et** sur le déploiement Convex (`bun run agents:cle`) | Clé de l'API Claude. Absente, les sept agents passent en mode simulé — voir « Les agents »                                |

Les deux URL Convex sont automatiquement autorisées dans la directive
`connect-src` de la politique de sécurité du contenu (voir
`lib/security-headers.ts`).

---

## Structure

```
app/
  layout.tsx                   racine : document seul (langue, polices, thème)
  error.tsx not-found.tsx      états d'erreur soignés, hors groupe de routes
  (journal)/                   LE JOURNAL PUBLIC — en-tête, pied, budget §5.4
    layout.tsx                 masthead + pied ; aucun client Convex monté
    page.tsx                   accueil : une, à la une, dossier, rubriques
    [slug]/                    301 des permaliens WordPress vers /article/<slug>
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
                               dépôts, médias, agents, statistiques,
                               rubriques, compte, comptes, réglages,
                               journal d'audit
    entreprise/                portail : dépôts, suivi, statistiques
  api/auth/[...all]/           proxy Better Auth ; `sign-up` fermé
  api/recherche/route.ts       point d'entrée du dialogue Cmd+K
  sitemap.ts robots.ts manifest.ts
  rss.xml/ news-sitemap.xml/   flux et plan de site « actualités »
  globals.css                  TOUS les jetons de design
components/
  ui/                          primitives shadcn/ui — JAMAIS modifiées
  custom/                      compositions maison (éditoriales et interface)
  providers/                   PreferencesProvider (+ ConvexClientProvider, lot 3)
convex/
  schema.ts                    modèle de données complet (§5.2)
  model/content.ts             validateurs et types partagés des blocs
  model/access.ts              RÔLES ET PERMISSIONS — le seul garde-barrière
  model/audit.ts               journal d'audit + corbeille de notifications
  model/agents.ts              déclaration des sept agents (§4.6)
  model/agentEngine.ts         prompts, analyse, repli hors ligne, coûts
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
  crons.ts schedule.ts         ordonnanceur : newsletter, publications datées
  seeding.ts seed/             le corpus de démonstration, en clair
  mediaManifest.ts             GÉNÉRÉ — dimensions et poids exacts des photos
  auth.ts http.ts              Better Auth : mots de passe, TOTP, débit
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
  check-live-budget.ts         même contrôle sur le site servi (workflow quotidien)
  media-thumbnails.ts          rattrapage des vignettes de 240 px (stockage Convex)
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

| Indicateur       | Plafond §5.4 | Constaté                            |
| ---------------- | ------------ | ----------------------------------- |
| Poids accueil    | 600 Ko       | 542 Ko                              |
| Poids article    | 400 Ko       | 366 Ko                              |
| Requêtes accueil | 50           | 40                                  |
| Requêtes article | 50           | 25                                  |
| JavaScript       | 180 Ko       | 164 Ko (accueil) · 168 Ko (article) |

> Chiffres **re-mesurés à la fin du lot 3**. L'accueil a maigri (489 → 478 Ko,
> 31 → 28 requêtes) : la mise en page racine ne contient plus l'en-tête ni le
> pied, le découpage des lots JavaScript a changé. Le poids de l'accueil suit
> aussi la photographie de la une — il bouge de quelques kilo-octets d'un jeu
> de contenu à l'autre. L'article a pris 5 Ko, dont 1,2 Ko de JavaScript :
> c'est la balise d'audience, qui remplace les deux traqueurs tiers de
> l'ancien site. Le bandeau photographique pleine largeur (une de l'accueil
> et en-tête d'article, `.lc-hero`) ajoute ensuite 10 Ko à l'accueil — la
> variante 1280 px de la photo de une — et 4 Ko à l'article, dont la photo
> reste plafonnée à 960 px pour tenir sous les 400 Ko.
>
> Chiffres **re-mesurés le 12/09/2026 après la recomposition du back-office**.
> Le découpage des lots JavaScript de Turbopack est désormais réglé dans
> `next.config.ts` (`experimental.turbopackChunking`) : avec les seuils par
> défaut, le socle partagé (tailwind-merge, noyau lucide, `next/link`) était
> chargé deux fois par les pages du journal et l'article dépassait le plafond
> de JavaScript (187 Ko). Trois requêtes de plus par page, mais plus aucune
> duplication ; l'envoi d'images depuis la médiathèque n'ajoute rien au
> journal, dont la vignette vidéo n'embarque plus le manifeste des photos.
>
> Chiffres **re-mesurés le 13/09/2026 en production, archive WordPress en
> ligne** (compilation Vercel). L'arrivée des 1 019 articles avait porté
> l'accueil à 595 Ko et le JavaScript des articles à 179,9 Ko ; un article à
> photo lourde dépassait même 400 Ko **sans aucune compilation**, par simple
> régénération ISR. Trois corrections : vignettes de liste en 240 px au lieu
> de 320 (`scripts/media-thumbnails.ts`, −50 Ko à l'accueil) ; plus de moteur
> de fusion de classes ni de primitive shadcn dans le JavaScript public
> (`lib/cx.ts`, −12 Ko sur chaque page — la page introuvable de la racine,
> présente partout, les tirait via le formulaire de recherche) ; et un
> contrôle quotidien du site servi, décrit ci-dessous.

**Surveillance en production.** La compilation ne voit pas ce que l'ISR
change ensuite. `scripts/check-live-budget.ts` mesure l'accueil et les trois
derniers articles réellement servis, avec les mêmes règles, et sort en erreur
dès **95 %** d'un plafond. `.github/workflows/budget-production.yml` le lance
chaque matin et sur demande ; GitHub prévient par courriel en cas d'échec.

```bash
bun run scripts/check-live-budget.ts https://lecorporate.com
```

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

## La chaîne éditoriale (lot 3)

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

Trois points tiennent aux défauts que l'audit avait relevés :

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
rôles** (décision du client du 12/09/2026) : « Mon compte » (`/compte`, ou
`/redaction/compte` sans quitter le back-office) et « Réglages »
(administrateur) affichent un code QR, l'adresse `otpauth://` en clair et dix
codes de secours à usage unique. Le compte n'est marqué comme protégé qu'après
avoir saisi un code produit par l'application ; ne pas l'activer ne retire
aucune permission — `convex/model/access.ts` ne refuse plus rien pour ce
motif.

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
320, 640, 960 et 1280 px** par le navigateur lui-même — aucun traitement
serveur — puis chaque taille est envoyée au stockage de fichiers Convex. La
largeur de 240 px sert les vignettes de liste (96 px sur un téléphone) ; pour
les images importées sans elle, `bun run scripts/media-thumbnails.ts --prod`
la rajoute, de façon idempotente (`--simulation` pour compter d'abord). Le texte
alternatif reste **obligatoire avant de placer l'image** dans un article : le
champ est requis à l'écran, et le validateur Convex ne l'accepte pas vide.

### Les agents

Les sept agents du §4.6 tournent dans une **action Convex** — l'ordonnanceur
porte donc réellement les traitements longs (transcription, newsletter
hebdomadaire) et aucun formulaire n'attend un modèle.

| #   | Agent                 | Déclencheur                                          | Repli manuel                                           |
| --- | --------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| 1   | Relecture             | à l'enregistrement / à la demande                    | la relecture reste manuelle                            |
| 2   | Titraille             | à la demande                                         | les champs se saisissent à la main                     |
| 3   | SEO                   | à la demande                                         | slug dérivé du titre, métadonnées à la main            |
| 4   | Média                 | depuis la médiathèque                                | le texte alternatif reste obligatoire, saisi à la main |
| 5   | Modération des dépôts | à la soumission (ordonnanceur)                       | la revue se fait sans fiche                            |
| 6   | Diffusion             | à la publication, et chaque jeudi pour la newsletter | rédaction à la main                                    |
| 7   | Transcription         | à la demande (différé)                               | transcription à la main                                |

**Un agent propose, un humain dispose.** Aucune fonction n'écrit un champ d'elle-même :
`agents:decide` est le seul chemin d'une proposition vers le contenu, et il exige
une session. Une proposition **rejetée** laisse l'empreinte de sa valeur et n'est
plus jamais re-proposée pour la même cible.

Trois barrières avant chaque appel, dans cet ordre : l'interrupteur de l'agent,
le plafond de dépense mensuel, la permission de l'appelant. Une exécution
bloquée est quand même journalisée, avec son motif et le repli correspondant.

#### Clé d'API : réel ou simulé, sans changement de code

Une seule variable, `ANTHROPIC_API_KEY`, lue avec `process.env` :

- **présente** → l'API Claude est appelée (`@anthropic-ai/sdk`), modèle
  `claude-sonnet-5` pour le volume, `claude-opus-5` pour les deux tâches où une
  erreur coûte quelque chose à la rédaction : la titraille et la
  pré-qualification d'un dépôt. Le coût réel de chaque exécution est calculé
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
la proposition affichée est étiquetée « simulation ».

### Statistiques, sans traqueur tiers

L'ancien site charge MonsterInsights et Google Analytics ; celui-ci ne charge
rien. Une vue est comptée par `proxy.ts` **au passage de la requête** : côté
serveur, sans cookie, sans identifiant, sans JavaScript, sans requête
supplémentaire — donc sans un octet au budget du §5.4. Ce qu'un serveur ne peut
pas savoir, la durée de lecture et le canal de partage, vient d'un composant
client minuscule (`AudienceBeacon`) qui envoie deux nombres et rien d'autre.

Aucune ligne enregistrée ne décrit un lecteur : trois compteurs par article et
un seau par jour. La rédaction voit l'audience par article, par rubrique et par
jour ; l'entreprise voit **ses** publications, le périmètre étant résolu dans
Convex à partir de la session.

---

## Design system

La page [`/design-system`](http://localhost:3000/design-system) présente la
palette complète en clair et en sombre, l'échelle typographique, les
espacements, les formes et tous les composants dans chacun de leurs états.
Elle n'est pas indexée (`robots: noindex`).

Source de vérité des jetons : `app/globals.css`. `lib/design-tokens.ts` en est
un miroir destiné à l'affichage ; garder les deux synchronisés.

### Logo éditorial

Le logo choisi est partagé par les en-têtes, le pied de page, la connexion,
le compte et les espaces privés via `BrandWordmark` : « Le » italique rose,
« Corporate » en serif gras et point rose. Le nom passe du marine au blanc
selon le thème. Le dessin est vectoriel, sans police supplémentaire.

Le [maître et ses exports](assets/brand/README.md) alimentent aussi les icônes
et les aperçus de partage. `bun run brand` les régénère ; le budget comptabilise
une seule ressource SVG partagée par les emplacements de l’interface.

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
`/icons` et les fichiers versionnés (l'audit relevait l'absence totale de
`Cache-Control` sur les images du site actuel, soit une cinquantaine
d'allers-retours vers l'Europe à chaque visite), `Vary: Cookie` sur
`/medias` puisque `proxy.ts` y sert une variante selon le mode économie, et
`must-revalidate` sur `/sw.js`.

S'y ajoutent, côté application :

- mot de passe **six chiffres exactement, ou douze caractères et plus** —
  jamais huit (`convex/model/password.ts`) ;
- **limitation de débit en base** sur la connexion, le second facteur et la
  réinitialisation — l'audit relevait l'absence totale de limitation ;
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
