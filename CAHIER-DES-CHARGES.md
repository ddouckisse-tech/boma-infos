# Cahier des charges — Le Corporate (refonte applicative)

> Magazine économique gabonais · édité par Up Concept
> Document de référence pour la refonte. Version 1.1 — 12/09/2026
> (v1.1 : fonds neutralisés en noirs/gris, contrastes recalculés — §3.1 et §3.5)
> Remplace le WordPress actuel (WP 6.3.10 / Elementor / thème Newzin).

---

## 1. Contexte et justification

### 1.1 Existant

`le-corporate.com` est aujourd'hui un WordPress 6.3.10 assemblé avec le thème
commercial **Newzin**, **Elementor 3.21.7**, **WooCommerce 8.5.5** (inutilisé
éditorialement) et **Slider Revolution 6.6.12**. L'audit technique du 11/09/2026
(`audit-le-corporate/Audit-le-corporate-com.pdf`) a relevé :

| Constat | Mesure | Conséquence |
|---|---|---|
| Poids de la page d'accueil | **9,35 Mo** dont 7,95 Mo d'images | Coût data prohibitif pour le lecteur gabonais |
| First Contentful Paint | **4,46 s** (desktop, connexion rapide) | > 10 s en 3G/4G dégradée |
| Fichiers JavaScript | **92** (711 Ko), librairies en double (swiper ×2, wow ×2, bootstrap ×2) | Blocage du rendu |
| Feuilles de style | **16** (427 Ko) | Idem |
| Familles typographiques | **6** chargées | Incohérence visuelle + poids |
| En-têtes de sécurité | **0 présent** (ni HSTS, CSP, X-Frame-Options…) | Exposition clickjacking / MIME sniffing |
| TLS 1.0 / 1.1 | Encore acceptés | Protocoles obsolètes (dépréciés 2020) |
| Compte administrateur | Identifiant `admin` **exposé** via `/wp-json/wp/v2/users` | Force brute facilitée |
| Balises `<h1>` sur l'accueil | **9** | Pénalité SEO |

La dette est structurelle : elle tient au mode de construction (page builder +
thème générique + greffons), pas à des réglages. Une refonte applicative est
préférable à un rafistolage.

### 1.2 Objectifs de la refonte

1. **Lisibilité** — une expérience de lecture au niveau des meilleurs titres de
   presse en ligne : hiérarchie typographique tenue, confort de lecture longue.
2. **Frugalité** — page d'accueil **≤ 600 Ko**, article **≤ 400 Ko**. Le lecteur
   gabonais paie sa data ; chaque kilo-octet est un arbitrage éditorial.
3. **Autonomie de la rédaction** — publier sans développeur, sans page builder.
4. **Ouverture aux entreprises** — un portail où les sociétés déposent
   elles-mêmes leur actualité, avec modération avant publication.
5. **Assistance par agents** — automatiser le répétitif (relecture, titraille,
   SEO, `alt` d'images, déclinaisons sociales, transcription d'interviews) sans
   jamais publier automatiquement.
6. **Sécurité** — surface d'attaque réduite, en-têtes stricts, rôles cloisonnés.

### 1.3 Non-objectifs (hors périmètre v1)

- Boutique en ligne (WooCommerce est abandonné).
- Application mobile native (une PWA installable couvre le besoin).
- Version anglaise (structure i18n prévue, contenu non traduit en v1).

---

## 2. Public et contraintes d'usage

### 2.1 Audience

| Segment | Part estimée | Usage |
|---|---|---|
| Cadres et dirigeants gabonais (Libreville, Port-Gentil) | ~60 % | Mobile, lecture en journée |
| Diaspora gabonaise (France, Belgique, Canada) | ~20 % | Desktop, bonne connexion |
| Institutions, bailleurs, partenaires régionaux (CEMAC) | ~15 % | Desktop |
| Entreprises partenaires (déposantes) | ~5 % | Desktop, portail dédié |

### 2.2 Contraintes du terrain gabonais — structurantes

Ces contraintes **priment sur les préférences esthétiques** en cas de conflit.

- **Le mobile domine.** Conception *mobile first* stricte, pas « responsive après
  coup ».
- **La data est chère et le réseau irrégulier.** D'où le budget de performance
  du §5.4, les images en AVIF/WebP, et un **mode économie de données**
  (images en basse définition, vidéos non préchargées) activable et mémorisé.
- **WhatsApp est le canal de partage principal.** Le partage WhatsApp est
  un bouton de premier rang, pas une icône secondaire ; les aperçus Open Graph
  doivent être irréprochables (image 1200×630, titre, description).
- **Coupures fréquentes.** PWA avec service worker : les articles consultés
  restent lisibles hors-ligne, une page hors-ligne soignée remplace l'erreur.
- **Moyens de paiement locaux.** Pour les offres payantes (§4.5) :
  **Airtel Money** et **Moov Money** avant la carte bancaire.

---

## 3. Identité visuelle et design system

### 3.1 Couleurs — marque conservée, fonds neutralisés

Les deux couleurs de marque sont relevées dans les variables du thème en
production (`--color-primary`, `--color-secondary`) : **elles ne changent pas**.
Les **fonds**, eux, abandonnent la dominante bleutée au profit de **neutres
purs** — arbitrage du 12/09/2026, pris pour le confort de lecture.

| Rôle | Jeton | Valeur | Usage |
|---|---|---|---|
| Primaire | `--brand-navy` | **`#002060`** | Titres, navigation, texte fort — **thème clair uniquement** |
| Secondaire | `--brand-magenta` | **`#C74794`** | Accents, rubriques, éléments graphiques — **pas de texte courant** |
| Secondaire texte | `--brand-magenta-600` | **`#B83D85`** | Le magenta dès qu'il porte du texte (voir §3.5) |
| Fond de lecture | `--surface` | `#FFFFFF` | Fond principal |
| Fond doux | `--surface-muted` | **`#F5F5F5`** | Sections alternées, cartes |
| Fond très doux | `--surface-subtle` | **`#FAFAFA`** | Séparations discrètes |
| Encre | `--ink` | **`#1A1A1A`** | Corps de texte — 17,4:1 sur blanc, 16,0:1 sur fond doux |

**Échelles dérivées** : `navy-50 → navy-950` (`#002060` = `navy-900`),
`magenta-50 → magenta-950` (`#C74794` = `magenta-500`, `#B83D85` = `magenta-600`),
et une **échelle de neutres** qui porte tous les fonds :
`50 #FAFAFA · 100 #F5F5F5 · 200 #E5E5E5 · 300 #D4D4D4 · 400 #A3A3A3 · 500 #737373
· 600 #525252 · 700 #404040 · 800 #262626 · 900 #171717 · 950 #0A0A0A`.

**Couleurs à supprimer** — hétérogènes, héritées des greffons, sans rôle défini :
`#148DFE` (bleu vif Elementor), `#066AAB` (boutons WPForms), `#461CFB`, `#DD8502`.
S'y ajoutent les anciens fonds bleutés `#E6E7F3` et `#F1F6FE`, et l'encre `#0D1B3E`.

**Couleurs fonctionnelles** (à ajouter, absentes aujourd'hui) :
succès `#0F7B4F` · alerte `#B45309` · erreur `#B42318` · information `#00509D`.

**Mode sombre** — la bascule du site actuel est conservée. Le fond est un **noir
neutre `#121212`**, jamais un noir pur : au-delà de la fatigue visuelle, le noir
absolu fait haloter le texte en lecture longue. Surfaces `#171717` et `#1F1F1F`,
texte `#EDEDED` (jamais blanc pur) — soit 16,0:1, du confort AAA.
Le navy `#002060` tombe à **1,23:1 sur ce fond** : il est donc **proscrit en
thème sombre**, où les titres passent à `#EDEDED`. Le magenta est remonté à
`#E06BAD` (6,1:1), conforme pour le texte.

### 3.2 Typographie — de 6 familles à 2

Le site charge aujourd'hui Poppins, Open Sans, Barlow Condensed, Roboto, Roboto
Slab et Source Sans Pro. On retient **deux familles**, auto-hébergées en
`woff2` avec `font-display: swap` et sous-ensemble latin étendu :

| Rôle | Police | Justification |
|---|---|---|
| **Titres et chapôs** | **Source Serif 4** | La serif est le marqueur des grands titres de presse ; elle donne l'autorité éditoriale qui manque au Poppins actuel, et distingue le titre du corps au premier coup d'œil. |
| **Corps, interface, données** | **Inter** | Dessinée pour l'écran, excellente lisibilité aux petites tailles, chiffres tabulaires pour les chiffres économiques. |

Poppins peut être conservé **uniquement** dans le lock-up du logo existant.

**Échelle typographique** (base 16 px, ratio 1,25 — *major third*) :

| Jeton | Mobile | Desktop | Usage |
|---|---|---|---|
| `display` | 32 px | 56 px | Titre de la une |
| `h1` | 28 px | 40 px | Titre d'article |
| `h2` | 22 px | 28 px | Intertitres |
| `h3` | 19 px | 22 px | Sous-sections |
| `body` | **17 px** | **19 px** | Corps d'article |
| `small` | 14 px | 15 px | Légendes, signatures, dates |

**Règles de lecture — non négociables :**
- Mesure du corps d'article : **65 à 75 caractères** (`max-width: 68ch`).
- Interligne du corps : **1,7**. Interligne des titres : 1,15.
- Aucun corps de texte en dessous de 17 px sur mobile.
- Texte toujours aligné à gauche, jamais justifié (fentes sur mobile).

### 3.3 Grille, espacement, formes

- Espacement sur une **échelle de 4 px** : 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Points de rupture : `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
- Largeur maximale du contenu : 1280 px ; colonne de lecture 680 px.
- Grille : 4 colonnes (mobile) → 8 (tablette) → 12 (desktop).
- Rayons : 4 px (contrôles), 8 px (cartes), 16 px (modales). **Pas de rayon
  supérieur** : la presse sérieuse n'a pas de coins arrondis mous.
- **Pas d'ombres portées diffuses.** Séparation par filets `1px` en `navy-100`
  et par aplats. Ombre réservée aux éléments réellement flottants (menu, modale).
- **Aucune animation décorative** (le thème actuel charge `wow.js`, `animate.css`,
  `splitting`, `simpleParallax` — tous supprimés). Seules subsistent les
  transitions d'état < 200 ms, désactivées sous `prefers-reduced-motion`.

### 3.4 Composants du design system

Base **shadcn/ui** (Radix + Tailwind). `components/ui/` n'est jamais modifié :
toute personnalisation passe par composition dans `components/custom/`.

**Éditoriaux** : `ArticleCard` (3 variantes : une / liste / compacte) ·
`FeaturedHero` · `CategoryBadge` (couleur par rubrique) · `AuthorByline` ·
`ReadingProgress` · `ShareBar` (WhatsApp en premier) · `RelatedArticles` ·
`KeyPoints` (« L'essentiel en 3 points ») · `PullQuote` · `ArticleBody`
(styles de contenu riche) · `TableOfContents` (articles longs).

**Interface** : `Header` (navigation 8 rubriques + recherche + bascule de thème) ·
`MegaMenu` (sous-rubriques) · `MobileNav` (tiroir) · `Footer` · `SearchDialog`
(`Cmd+K`) · `Pagination` · `EmptyState` · `Skeleton` · `DataSaverToggle`.

**Applicatifs** : `Editor` (éditeur riche) · `MediaPicker` · `StatusPill`
(workflow) · `SubmissionForm` · `ReviewPanel` · `AgentSuggestionCard`
(proposition d'agent, acceptable/rejetable) · `StatsTile`.

### 3.5 Accessibilité — RGAA / WCAG 2.2 niveau AA

- Contraste : **4,5:1** minimum pour le texte, 3:1 pour les éléments graphiques.
  **Point de vigilance mesuré** : le magenta de marque `#C74794` n'atteint que
  **4,41:1 sur blanc** et **4,05:1 sur `#F5F5F5`** — il échoue donc au seuil AA
  pour le texte courant. Il reste réservé aux **éléments graphiques, badges et
  titres larges** (≥ 24 px, ou ≥ 18,7 px en gras, où le seuil est 3:1). Dès
  qu'il porte du texte courant, c'est `--brand-magenta-600` **`#B83D85`** qui
  s'applique : 5,19:1 sur blanc, 4,76:1 sur fond doux.
  Contrastes du corps de texte, vérifiés : `#1A1A1A` sur blanc **17,4:1**,
  sur `#F5F5F5` **16,0:1** ; `#EDEDED` sur `#121212` **16,0:1**, sur `#1F1F1F`
  **14,1:1**. Tous en AAA — c'est l'objectif pour de la lecture longue.
- Navigation clavier complète, `:focus-visible` de 2 px toujours visible.
- Cibles tactiles **≥ 44 × 44 px**.
- Toute image porte un `alt` pertinent (l'agent Média le propose, §4.6).
- Structure : **un seul `<h1>` par page** (contre 9 aujourd'hui), hiérarchie
  continue, points de repère ARIA, lien d'évitement.
- `lang="fr-FR"`, respect de `prefers-reduced-motion` et `prefers-color-scheme`.

---

## 4. Fonctionnalités

### 4.1 Architecture éditoriale — reprise de l'existant

Arborescence relevée en production, conservée (l'orthographe de
« Réglementations » est corrigée) :

| Rubrique | Sous-rubriques |
|---|---|
| **Business & Lifestyle** | Big deal · Entreprendre · Innovation · Technologie |
| **Éditorial** | — |
| **Succès story** | Femme dirigeante · Graine de manager · Leader · Startup |
| **Espace pro** | Docuthèques · Formation · Opportunités · **Réglementations** · Séminaires |
| **Tribune** | — |
| **Dossier spécial** | — |
| **Intelligence économique & Fortune d'Afrique** | — |
| **Interview** | — |

Pages : **À propos**, **Contacts**. Les rubriques sont administrables (ajout,
renommage, réordonnancement, couleur d'accent) sans intervention technique.

### 4.2 Site public

- **Accueil** : une principale, « À la une », derniers articles par rubrique,
  dossier en avant, sélection « Espace pro ».
- **Rubrique** : liste paginée, filtres par sous-rubrique, tri.
- **Article** : titre, chapô, signature, date, temps de lecture, « L'essentiel
  en 3 points », corps, médias légendés, partage, articles liés.
- **Recherche** plein texte avec suggestions (`Cmd+K`).
- **Page auteur**, **page Docuthèque** (documents téléchargeables),
  **Contacts** (formulaire), **À propos**.
- **Newsletter** : inscription, double opt-in, désinscription en un clic.
- **Flux RSS** et `sitemap.xml` générés automatiquement.

### 4.3 Comptes et rôles

Quatre rôles, permissions cloisonnées :

| Rôle | Périmètre |
|---|---|
| **Administrateur** (rédaction en chef) | Tout : publication, rubriques, comptes, réglages, agents, statistiques. |
| **Éditeur / Journaliste** (interne) | Rédige, soumet, publie dans ses rubriques autorisées. Ne gère ni comptes ni réglages. |
| **Client / Entreprise** (partenaire) | Accède **uniquement** à son espace : dépose ses actualités, suit leur statut, consulte ses statistiques de diffusion. Ne voit jamais le contenu d'une autre entreprise. |
| **Lecteur** (facultatif) | Favoris, historique, préférences de newsletter. |

Exigences : mots de passe forts, **double authentification obligatoire pour
Administrateur et Éditeur**, sessions révocables, journal d'audit horodaté de
toute action sensible (publication, dépublication, changement de rôle).
Aucun identifiant par défaut du type `admin`.

### 4.4 Portail entreprise — dépôt d'actualité

Le cœur de la demande. Une entreprise partenaire dépose son actualité
elle-même ; la rédaction garde la main éditoriale.

**Parcours :**
1. **Inscription** de l'entreprise (raison sociale, NIF/RCCM, secteur, logo,
   contact). Compte **validé manuellement** par un administrateur.
2. **Dépôt** : titre, chapô, corps, visuels, rubrique souhaitée, date de
   diffusion demandée, type (communiqué, nomination, résultats, événement,
   publi-rédactionnel).
3. **Contrôle automatique** à la soumission (agent Modération, §4.6) : score de
   conformité à la charte, détection du publi-rédactionnel non déclaré,
   signalement des allégations invérifiables. **L'agent conseille, ne décide pas.**
4. **Revue** par la rédaction : accepter · demander des modifications (avec
   commentaires) · refuser (motif obligatoire).
5. **Publication** par la rédaction, à la date convenue. Tout contenu
   commercial porte une mention **« Communiqué » / « Contenu partenaire »**
   visible et non contournable — exigence déontologique.
6. **Retour** : l'entreprise suit le statut et, une fois publié, consulte
   vues, temps de lecture moyen et partages.

**Statuts** : `brouillon → soumis → en revue → modifications demandées →
programmé → publié` (ou `refusé`). Chaque transition notifiée par courriel,
et par WhatsApp si le numéro est renseigné.

### 4.5 Offres (préparées en v1, activables ensuite)

Dépôt gratuit limité (n par trimestre), forfaits de publi-rédactionnel,
mise en avant, encarts. Paiement **Airtel Money / Moov Money** d'abord, carte
ensuite. Facturation conforme (NIF, TVA gabonaise).

### 4.6 Agents — automatiser le répétitif

Sept agents. **Règle absolue : un agent propose, un humain dispose.** Aucun
agent ne publie, ne refuse ni ne modifie un contenu sans validation ; toute
suggestion est tracée, acceptable ou rejetable, et l'historique est conservé.

| # | Agent | Tâche répétitive supprimée | Déclenchement |
|---|---|---|---|
| 1 | **Relecture** | Orthographe, grammaire, typographie française (espaces insécables, guillemets « », capitales accentuées), respect du style maison. | À l'enregistrement |
| 2 | **Titraille** | Propose 3 titres, 1 chapô, 1 accroche réseaux, 1 méta-description. | À la demande |
| 3 | **SEO** | Slug, méta-données, mots-clés, maillage interne (repère les articles liés du fonds), données structurées `NewsArticle`. | À l'enregistrement |
| 4 | **Média** | Texte alternatif de chaque image (accessibilité + SEO), légende, recadrages 16:9 / 1:1 / 1200×630, conversion AVIF/WebP, compression. | À l'import |
| 5 | **Modération** | Pré-qualifie les dépôts entreprises : conformité à la charte, publi-rédactionnel déguisé, allégations à vérifier, doublons. Produit une fiche de synthèse pour le rédacteur en chef. | À la soumission |
| 6 | **Diffusion** | Décline l'article en formats LinkedIn, WhatsApp, Facebook ; compose la newsletter hebdomadaire à partir des articles de la semaine. | À la publication |
| 7 | **Transcription** | Audio/vidéo d'interview → texte horodaté → trame d'article questions/réponses. Sert directement la rubrique Interview. | À l'import d'un média |

Garde-fous : journal complet des exécutions, plafond de dépense mensuel avec
alerte, données éditoriales non utilisées pour l'entraînement de modèles
tiers, désactivation individuelle de chaque agent, **repli manuel toujours
disponible** si un agent est indisponible.

---

## 5. Exigences techniques

### 5.1 Pile retenue

| Couche | Choix | Motif |
|---|---|---|
| Cadre applicatif | **Next.js (App Router)**, React, **TypeScript strict** | Rendu serveur et statique : indispensable au SEO d'un média et à un premier affichage rapide sur réseau lent. |
| Style | **Tailwind CSS** + jetons du §3 | Pas de CSS mort, cohérence garantie. |
| Composants | **shadcn/ui** (Radix) | Accessibles par construction, possédés dans le dépôt. |
| Données & temps réel | **Convex** | Requêtes réactives, fonctions serveur typées, ordonnanceur pour les agents. |
| Authentification | **better-auth** | Rôles, 2FA, sessions révocables. |
| Médias | Stockage objet + transformation à la volée (AVIF/WebP) | Le poste le plus lourd aujourd'hui (7,95 Mo). |
| Formulaires | **React Hook Form + Zod** | Le schéma Zod est la source de vérité, partagé client/serveur. |
| Notifications | **sonner** · Icônes **lucide-react** | Conventions maison. |
| Recherche | Index plein texte Convex | Suffisant au volume ; extractible ensuite. |

Conventions maison : **code en anglais, interface en français**, jamais de `any`
non justifié, `components/ui/` intouché.

### 5.2 Modèle de données (entités principales)

`Article` (titre, slug, chapô, corps, statut, rubrique, auteur, médias,
points-clés, SEO, origine `redaction|partenaire`, dates) · `Category` ·
`Author` · `Media` · `Organization` (entreprise partenaire) · `Submission`
(dépôt + historique de revue) · `User` + `Role` · `Newsletter` ·
`AgentRun` (journal des agents) · `AuditLog`.

### 5.3 Sécurité — correction des défauts constatés

| Défaut actuel | Exigence |
|---|---|
| Aucun en-tête de sécurité | **HSTS** (`max-age=31536000; includeSubDomains; preload`), **CSP** stricte, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictive, `X-Frame-Options: DENY`. |
| TLS 1.0 / 1.1 acceptés | **TLS 1.2 minimum**, 1.3 privilégié. |
| Identifiant `admin` exposé | Aucune énumération de comptes ; identifiants nominatifs ; messages d'erreur d'authentification non discriminants. |
| Aucune limitation de débit | Limitation sur authentification, formulaires et dépôts ; anti-robot sur les formulaires publics. |
| Dépendances obsolètes | Analyse automatique des vulnérabilités en intégration continue ; mises à jour mensuelles. |
| Téléversements non contrôlés | Vérification du type réel, taille plafonnée, nettoyage des métadonnées EXIF, fichiers servis depuis un domaine distinct. |

Également : validation Zod de **toute** entrée côté serveur, protection CSRF,
sauvegardes quotidiennes chiffrées avec restauration testée, politique de
confidentialité et registre de traitement conformes.

### 5.4 Budget de performance — contraignant, vérifié en intégration continue

| Indicateur | Cible | Plafond | Aujourd'hui |
|---|---|---|---|
| Poids accueil | 450 Ko | **600 Ko** | 9 350 Ko |
| Poids article | 300 Ko | **400 Ko** | ~2 000 Ko |
| Requêtes (accueil) | 35 | **50** | 169 |
| JavaScript exécuté | 120 Ko | **180 Ko** | 711 Ko |
| LCP (4G, mobile milieu de gamme) | 1,8 s | **2,5 s** | ~4,5 s (desktop) |
| INP | 150 ms | **200 ms** | non mesuré |
| CLS | 0,05 | **0,1** | non mesuré |
| Lighthouse (perf. / a11y / SEO) | ≥ 95 | **≥ 90** | non atteint |

Toute compilation qui dépasse un plafond **échoue**. Moyens : composants
serveur par défaut, images AVIF/WebP dimensionnées et différées (sauf la une),
polices auto-hébergées sous-ensemblées, aucune librairie d'animation, ISR pour
les pages éditoriales, cache CDN.

### 5.5 Compatibilité

Chrome/Edge, Safari, Firefox (2 dernières versions majeures), **Safari iOS 15+**,
**Chrome Android 100+** (parc gabonais). Dégradation maîtrisée sans JavaScript
pour la lecture. Vérification réelle à **320 px** (pas de défilement horizontal),
768 px, 1024 px, 1440 px.

### 5.6 Reprise de l'existant

Migration du fonds WordPress : articles, médias, rubriques, auteurs, dates.
**Les URL actuelles sont préservées** ou redirigées en 301 — la valeur SEO
acquise ne doit pas être perdue. Recette : inventaire avant/après, contrôle des
liens morts, vérification d'un échantillon d'articles.

---

## 6. Livraison

### 6.1 Lots

| Lot | Contenu | Livrable vérifiable |
|---|---|---|
| **1 — Fondations** | Socle applicatif, design system complet, jetons, thème clair/sombre, mise en page, composants de base. | Le socle tourne, la galerie de composants est navigable. |
| **2 — Journal public** | Modèle de contenu, accueil, rubriques, article, recherche, auteurs, SEO, PWA, budget de performance tenu. | Le site public est consultable et mesuré. |
| **3 — Espaces privés et agents** | Authentification et rôles, back-office rédaction, portail entreprise et workflow de modération, les 7 agents, statistiques. | Un dépôt d'entreprise va jusqu'à la publication. |

Chaque lot correspond à un prompt d'implémentation : `prompts/01`, `02`, `03`.

### 6.2 Critères de recette

Le projet est réputé livré quand : les budgets du §5.4 sont tenus et vérifiés en
intégration continue ; l'audit d'accessibilité AA ne remonte aucun défaut
bloquant ; les en-têtes de sécurité du §5.3 sont en place ; un dépôt d'entreprise
parcourt tout le workflow jusqu'à publication ; les 7 agents produisent des
suggestions validables ; les anciennes URL répondent ; la rédaction publie sans
assistance technique.

### 6.3 Risques

| Risque | Parade |
|---|---|
| Le fonds migré (images lourdes) casse le budget de performance | Retraitement des médias à la migration, non négociable |
| Les entreprises déposent du publicitaire déguisé | Mention « Communiqué » automatique + agent Modération + refus motivé |
| Coût des agents non maîtrisé | Plafond mensuel, journal, désactivation unitaire |
| Dépendance à un agent indisponible | Repli manuel systématique sur chaque tâche |
| Perte de référencement à la bascule | Plan de redirection 301 vérifié avant mise en ligne |

---

*Fin du cahier des charges — v1.0*
