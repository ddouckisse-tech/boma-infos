# Cahier des charges — BOMA Infos

> Média gabonais d'information générale · `www.bomainfos.com`
> Document de référence de l'application. Version 2.0 — 03/10/2026
> (reprend la structure du cahier des charges du socle d'origine, version 1.2 du 12/09/2026)

> **Origine.** Le socle applicatif de ce dépôt a été repris le 03/10/2026 du projet
> « Le Corporate », magazine économique gabonais d'un autre titre et d'un autre éditeur.
> Ce document en reprend la structure (numérotation §1 à §6, citée par le code) et les
> exigences techniques (§5) ; l'identité visuelle (§3), les rubriques (§4.1) et les
> agents (§4.6) sont ceux de BOMA Infos. Le dossier `audit-le-corporate/` et l'outillage
> d'import WordPress sont des héritages, conservés comme référence, non utilisés ici.

---

## 1. Contexte et justification

BOMA Infos est un média gabonais d'information générale, en ligne : toute
l'actualité du Gabon — politique, économie, société, tourisme, environnement,
culture, sport. C'est un nouveau média, qui n'a pas de site antérieur.

| Élément | Valeur |
|---|---|
| Adresse | `www.bomainfos.com` |
| Courriel de la rédaction | `redaction@bomainfos.com` — déduit du domaine, à confirmer par le propriétaire |
| Société éditrice, téléphone, adresse postale | **Non communiqués.** Le code les déclare `null` (`lib/site.ts`) et ne les affiche pas ; la page « Mentions légales » liste ce qui reste à fournir avant la mise en ligne publique |

### 1.1 Existant

Il n'y a **pas d'existant BOMA Infos** : ni site antérieur, ni audit de
l'existant, ni migration de contenu (§5.6).

Les exigences techniques du socle sont nées de l'audit d'un site de presse
WordPress, celui d'un autre titre (dossier `audit-le-corporate/`, conservé comme
référence). Elles restent valables comme principes. Voici ce que cet audit avait
mesuré et qui explique encore une exigence :

| Constat de l'audit | Conséquence | Exigence du socle |
|---|---|---|
| Page d'accueil de **9,35 Mo**, dont 7,95 Mo d'images | Coût de data prohibitif pour le lecteur gabonais | Budget de performance (§5.4), images AVIF/WebP (§2.2) |
| Premier affichage (FCP) à **4,46 s** en desktop, connexion rapide | Plus de 10 s en 3G/4G dégradée | LCP plafonné (§5.4) |
| **92** fichiers JavaScript (711 Ko, librairies en double), **16** feuilles de style (427 Ko), **6** familles typographiques | Blocage du rendu, incohérence visuelle, poids | Plafonds de JavaScript et de requêtes (§5.4), deux familles typographiques (§3.2) |
| **Aucun** en-tête de sécurité (ni HSTS, ni CSP, ni X-Frame-Options), TLS 1.0 / 1.1 encore acceptés, identifiant `admin` exposé par l'API publique | Clickjacking, MIME sniffing, protocoles obsolètes, force brute facilitée | Sécurité (§5.3) |
| **9** balises `<h1>` sur l'accueil | Pénalité SEO | Un seul `<h1>` par page (§3.5) |

La dette de ce site tenait à son mode de construction (constructeur de pages,
thème générique, greffons), pas à des réglages. D'où le choix d'une application
plutôt que d'un assemblage de greffons sur un système de gestion de contenu.

### 1.2 Objectifs de la refonte

« Refonte » désigne ici la reprise du socle pour BOMA Infos : il n'y a pas de
site à refondre. Les objectifs sont ceux de l'application :

1. **Lisibilité** — une expérience de lecture au niveau des titres de presse en
   ligne de référence : hiérarchie typographique tenue, confort de lecture longue.
2. **Frugalité** — page d'accueil **≤ 600 Ko**, article **≤ 400 Ko**. Le lecteur
   gabonais paie sa data ; chaque kilo-octet est un arbitrage éditorial.
3. **Autonomie de la rédaction** — publier sans développeur, sans page builder.
4. **Ouverture aux entreprises** — un portail où les sociétés déposent
   elles-mêmes leur actualité, avec modération avant publication.
5. **Assistance par agents** — automatiser le répétitif (relecture, titraille,
   SEO, `alt` d'images, déclinaisons sociales, transcription d'interviews) et la
   veille de l'actualité (pistes de sujets sourcées), sans jamais publier
   automatiquement.
6. **Sécurité** — surface d'attaque réduite, en-têtes stricts, rôles cloisonnés.

### 1.3 Non-objectifs (hors périmètre v1)

- Boutique en ligne.
- Application mobile native (une PWA installable couvre le besoin).
- Version anglaise (structure i18n prévue, contenu non traduit en v1).
- Reprise d'une archive : BOMA Infos n'a pas de site antérieur (§5.6).

---

## 2. Public et contraintes d'usage

### 2.1 Audience

BOMA Infos s'adresse aux lecteurs gabonais, à la diaspora gabonaise et à ceux
qui suivent ou visitent le pays. Aucune répartition chiffrée n'a été
communiquée : les usages ci-dessous sont des hypothèses de conception, à
confronter à la mesure d'audience intégrée (`/redaction/statistiques`) une fois
le site en ligne.

| Segment | Usage supposé |
|---|---|
| Lecteurs gabonais (Libreville, Port-Gentil et le reste du pays) | Mobile, lecture en journée |
| Diaspora gabonaise | Desktop, bonne connexion |
| Lecteurs qui suivent ou visitent le Gabon | Non connu — la conception *mobile first* vaut pour tous |
| Entreprises partenaires (déposantes) | Desktop, portail dédié |

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

L'identité est celle de la charte graphique de BOMA Infos. Les valeurs ci-dessous
ont été relevées sur la carte « citation » fournie par le propriétaire ; la source
de vérité est `app/globals.css`, dont `lib/design-tokens.ts` reprend les valeurs
pour la galerie `/design-system`.

### 3.1 Couleurs — marine, or et filet tricolore

Trois partis pris portent l'identité. Le **marine** de la charte fait le bandeau,
la une, le pied de page et tout le thème sombre. L'**or** souligne : il est
l'emphase sur le marine et un ornement sur le blanc, où il ne porte jamais de
texte. Le **filet tricolore**, aux couleurs du drapeau gabonais, signe la page ; il
est décoratif. La palette par défaut de Tailwind est remise à zéro : aucune couleur
hors de celles-ci n'existe.

**Couleurs de marque**

| Rôle | Jeton | Valeur | Usage et contraste |
|---|---|---|---|
| Marine de marque | `navy-900` | **`#0B1848`** | Action primaire en thème clair, lettres du logo sur fond clair, fond des icônes — 16,96:1 sur blanc |
| Fond de la charte | `navy-950` | `#030921` | Fond de la carte de la charte ; texte posé sur l'or (12,45:1) |
| Fond nuit | `night` | `#050D2B` | Fond du thème sombre et des îles marine (bandeau, une, pied de page) : le fond de la charte, à peine relevé |
| Halo du projecteur | `navy-700` | `#1E347F` | Halo de la trame des îles marine — 11,33:1 sur blanc |
| Marine textuel | `navy-300` | `#ABC0F2` | Le marine qui porte du texte sur le fond nuit — 10,51:1 |
| Or de marque | `gold-400` | **`#F7C755`** | Emphase et action sur le marine — 12,06:1 sur le fond nuit ; **1,58:1 sur blanc : jamais de texte or sur blanc** |
| Or textuel | `gold-800` | `#735606` | L'or qui porte du texte sur blanc — 6,86:1 |

**Filet tricolore** — vert `#38AA75`, jaune `#FCC546`, bleu `#1765E6`, dans les
proportions 24 / 37 / 39 %. Toujours décoratif : aucune information ne passe par
lui seul. Le vert et le bleu ont chacun un cran qui porte du texte :

| Rôle | Jeton | Valeur | Usage et contraste |
|---|---|---|---|
| Vert textuel | `green-700` | `#106843` | 6,81:1 sur blanc |
| Bleu des liens | `blue-600` | `#0D54C6` | Couleur des liens en thème clair — 6,77:1 sur blanc |
| Bleu de focus | `blue-500` | `#1765E6` | Anneau de focus — 5,20:1 sur blanc |

**Thème clair**

| Rôle | Valeur | Contraste |
|---|---|---|
| Fond | `#FFFFFF` | — |
| Texte | `#0D152A` | 18,14:1 sur blanc |
| Surface douce (sections alternées, cartes) | `#F3F6FB` | 16,74:1 pour le texte |
| Texte atténué | `#4B556C` | 7,46:1 sur blanc |
| Action primaire | marine `#0B1848` | 16,96:1 pour le texte blanc de l'aplat |
| Accent (liens, libellés d'action) | bleu `#0D54C6` | 6,77:1 sur blanc |
| Filet | `#E2E6EF` | Décoratif |
| Bordure de contrôle | `#7D869C` | 3,64:1 sur blanc |

**Thème sombre — c'est la charte elle-même**

| Rôle | Valeur | Contraste |
|---|---|---|
| Fond | `#050D2B` | Le marine de la charte, à peine relevé : jamais un noir |
| Texte | `#ECF0F9` | 16,74:1 sur le fond |
| Carte | `#091436` | 15,79:1 pour le texte |
| Surcouche (menus, fenêtres) | `#101C41` | 14,55:1 pour le texte |
| Texte atténué | `#ACB7D2` | 9,52:1 sur le fond |
| Action primaire et accent | or `#F7C755` | 12,06:1 sur le fond ; texte `#030921` sur l'aplat, 12,45:1 |
| Filet | `#1C294E` | Décoratif |
| Bordure de contrôle | `#657498` | 4,10:1 sur le fond |

Le lecteur choisit entre clair, sombre et « système » (valeur par défaut) ; le
choix est mémorisé et appliqué avant le premier affichage, sans clignotement. Le
fond sombre n'est jamais un noir : le noir absolu fait haloter le texte en lecture
longue.

**Échelles dérivées**, générées en OKLCH à teinte constante et ancrées sur les
pixels de la charte : `navy-50 → navy-950` (`navy-900` = marine de marque),
`gold-50 → gold-950` (`gold-400` = or de marque), et les crans du vert et du bleu
du filet (`green-*`, `blue-*`). Les neutres sont très légèrement teintés marine —
des gris purs juraient à côté du marine de la charte :
`50 #F8FAFE · 100 #F3F6FB · 200 #E2E6EF · 300 #CFD4DF · 400 #A4ABBB · 500 #788094
· 600 #515B71 · 700 #3B455B · 800 #222B40 · 900 #121A2E · 950 #070C1C`.

**Couleurs fonctionnelles**, avec leur contraste sur le fond de la page :

| Fonction | Thème clair | Thème sombre |
|---|---|---|
| Succès | `#106843` (6,81:1) | `#61C994` (9,36:1) |
| Alerte | `#B45309` (5,02:1) | `#F0A742` (9,38:1) |
| Erreur | `#B42318` (6,57:1) | `#F9827A` (7,74:1) |
| Information | `#0D54C6` (6,77:1) | `#9DBFF8` (10,23:1) |

### 3.2 Typographie — de 6 familles à 2

Le site WordPress audité (§1.1) chargeait six familles typographiques. On en
retient **deux**, auto-hébergées en `woff2` (via `next/font` : aucune requête vers
un service de polices tiers) avec `font-display: swap` et le sous-ensemble `latin`
— le français n'exige pas le latin étendu.

| Rôle | Police | Justification |
|---|---|---|
| **Titres et marque** | **Source Serif 4** | La serif de la charte : le « BOMA » du logo et la carte « citation ». **Une seule graisse chargée : 600**, celle mesurée sur la charte (22 Ko). Un titre qui réclame 700 ou 800 reçoit cette graisse telle quelle, sans faux gras. |
| **Corps, interface, données** | **Inter** (variable) | Dessinée pour l'écran, lisible aux petites tailles, chiffres tabulaires pour les données chiffrées. Un seul fichier variable couvre toutes les graisses de l'interface. |

**L'emphase de la charte** — serif grasse italique, en or — est une **troisième
face** (Source Serif 4, 700 italique), jamais préchargée : elle n'est téléchargée
que par une page qui s'en sert (la carte « citation », où `*les mots*` d'une
citation deviennent l'emphase) et le contrôle de budget (§5.4) la compte alors.
Aucune autre famille n'est chargée.

**Échelle typographique** (base 16 px, ratio 1,25 — *major third*, fluide de 320
à 1280 px) :

| Jeton | Mobile | Desktop | Usage |
|---|---|---|---|
| `display` | 32 px | 56 px | Titre de la une |
| `h1` | 28 px | 40 px | Titre d'article |
| `h2` | 22 px | 28 px | Intertitres |
| `h3` | 19 px | 22 px | Sous-sections |
| `body` | **17 px** | **19 px** | Corps d'article |
| `small` | 14 px | 15 px | Légendes, signatures, dates |

**Règles de lecture — non négociables :**
- Mesure du corps d'article : **65 à 75 caractères** (`max-width: min(68ch, 39rem)` :
  le plafond de 39 rem tient la mesure à 65–74 caractères avec Inter).
- Interligne du corps : **1,7**. Interligne des titres : 1,15.
- Aucun corps de texte en dessous de 17 px sur mobile.
- Texte toujours aligné à gauche, jamais justifié (fentes sur mobile).

### 3.3 Grille, espacement, formes

- Espacement sur une **échelle de 4 px** : 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Points de rupture : `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
- Largeur maximale du contenu : 1280 px ; colonne de lecture `min(68ch, 39rem)`,
  soit 624 px au plus.
- Grille : 4 colonnes (mobile) → 8 (tablette) → 12 (desktop).
- Rayons : 4 px (contrôles), 8 px (cartes), 16 px (modales). **Pas de rayon
  supérieur** : la presse sérieuse n'a pas de coins arrondis mous.
- **Pas d'ombres portées diffuses.** Séparation par filets `1px` à la couleur du
  jeton `--border` (`#E2E6EF` en thème clair, `#1C294E` en thème sombre) et par
  aplats. Ombre réservée aux éléments réellement flottants (menu, modale).
- **Aucune animation décorative** (le site audité au §1.1 chargeait `wow.js`,
  `animate.css`, `splitting`, `simpleParallax` : rien de tel ici). Seules
  subsistent les transitions d'état < 200 ms, désactivées sous
  `prefers-reduced-motion`.

### 3.4 Composants du design system

Base **shadcn/ui** (Radix + Tailwind). `components/ui/` n'est jamais modifié :
toute personnalisation passe par composition dans `components/custom/`.

**Éditoriaux** : `ArticleCard` (3 variantes : une / liste / compacte) ·
`FeaturedHero` · `CategoryBadge` (couleur par rubrique) · `AuthorByline` ·
`ReadingProgress` · `ShareBar` (WhatsApp en premier) · `RelatedArticles` ·
`KeyPoints` (« L'essentiel en 3 points ») · `PullQuote` · `ArticleBody`
(styles de contenu riche) · `TableOfContents` (articles longs).

**Interface** : `BrandWordmark` (logo) · `Header` (navigation des dix rubriques +
recherche + bascule de thème) · `MegaMenu` (sous-rubriques) · `MobileNav`
(tiroir) · `Footer` · `SearchDialog` (`Cmd+K`) · `Pagination` · `EmptyState` ·
`Skeleton` · `DataSaverToggle`.

**Applicatifs** : `Editor` (éditeur riche) · `MediaPicker` · `StatusPill`
(workflow) · `SubmissionForm` · `ReviewPanel` · `AgentSuggestionCard`
(proposition d'agent, acceptable/rejetable) · `WatchLeadCard` (piste de la
Veille : faits, sources, fiabilité ; « Retenir » ouvre un brouillon, « Écarter »
l'empêche de revenir) · `StatsTile`.

**Signature de la charte** — quatre éléments, relevés sur la carte « citation » :

- **Filet tricolore** (`boma-rule`) — trait de 3 px en dégradé à arrêts francs
  vert / jaune / bleu, dans les proportions 24 / 37 / 39 %. Un seul élément,
  aucune requête ; décoratif, donc toujours `aria-hidden`. Il ferme le bandeau,
  ouvre le pied de page et souligne les titres (une, article, citation, en-têtes
  de page).
- **Trame** (`boma-field`) — fond nuit parsemé d'un point de 1 px tous les 14 px, à
  9 % d'opacité, que le halo du projecteur (`navy-700`) éclaire en haut à droite.
  Réservée aux îles marine.
- **Carte « citation »** (`PullQuote`) — île marine à trame de points, citation en
  serif blanche, filet tricolore dessous, attribution en texte atténué. Les mots
  balisés `*les mots*` y deviennent l'emphase de la charte, en or ; la page qui s'en
  sert télécharge la troisième face typographique (§3.2).
- **Îles marine** — le bandeau, la une, l'en-tête d'article, la carte « citation »
  et le pied de page portent la classe `dark` : les jetons du thème sombre s'y
  appliquent et ils gardent les couleurs de la charte dans les deux thèmes, quel
  que soit le thème de la page. Leurs composants (pastille de rubrique,
  signature) suivent.

### 3.5 Accessibilité — RGAA / WCAG 2.2 niveau AA

- Contraste : **4,5:1** minimum pour le texte, 3:1 pour les éléments graphiques et
  les bordures de contrôle. **Deux règles** tiennent la palette de la charte :
  1. **L'or ne porte jamais de texte sur blanc.** L'or de marque `#F7C755` ne
     mesure que **1,58:1** sur blanc : il reste réservé aux aplats, aux filets et
     aux pastilles. Sur blanc, le texte « or » est le `gold-800` `#735606`
     (**6,86:1**) ; c'est sur le fond nuit que l'or de marque porte du texte
     (**12,06:1**). La carte « citation » est donc une île marine.
  2. **Le marine de marque ne porte jamais de texte sur le fond nuit.** `#0B1848`
     n'y mesure que **1,13:1** : en thème sombre, l'action primaire passe à l'or,
     le texte à `#ECF0F9` et le marine textuel à `navy-300` (**10,51:1**).

  Contrastes du corps de texte, vérifiés : `#0D152A` sur blanc **18,14:1**, sur
  `#F3F6FB` **16,74:1** ; `#ECF0F9` sur `#050D2B` **16,74:1**, sur la carte
  `#091436` **15,79:1**, sur la surcouche `#101C41` **14,55:1**. Tous en AAA — c'est
  l'objectif pour de la lecture longue. Texte atténué : `#4B556C` sur blanc
  **7,46:1**, `#ACB7D2` sur le fond nuit **9,52:1**. Bordures de contrôle : `#7D869C`
  sur blanc **3,64:1**, `#657498` sur le fond nuit **4,10:1**. Liens en thème clair :
  `#0D54C6` sur blanc **6,77:1**. Anneau de focus : `#1765E6` sur blanc (**5,20:1**),
  or sur le fond nuit.
- Le filet tricolore et les pastilles sont décoratifs : aucune information ne passe
  par la couleur seule.
- Texte sur photographie (une, en-tête d'article) : un voile marine, opaque sous le
  texte, tient **3:1** pour le titre large et **4,5:1** pour le chapô et la
  signature, même sur une photographie blanche.
- Navigation clavier complète, `:focus-visible` de 2 px toujours visible.
- Cibles tactiles **≥ 44 × 44 px**.
- Toute image porte un `alt` pertinent (l'agent Média le propose, §4.6).
- Structure : **un seul `<h1>` par page** (contre 9 sur l'accueil du site audité),
  hiérarchie continue, points de repère ARIA, lien d'évitement.
- `lang="fr-FR"`, respect de `prefers-reduced-motion` et `prefers-color-scheme`.

---

## 4. Fonctionnalités

### 4.1 Architecture éditoriale — rubriques et sous-rubriques

Dix rubriques, administrables en base :

| Rubrique | Sous-rubriques |
|---|---|
| **Politique** | Institutions · Gouvernement · Diplomatie · Territoires |
| **Économie** | Entreprises · Mines & énergie · Finances publiques · Numérique |
| **Société** | Éducation · Santé · Emploi |
| **Tourisme** | Destinations · Parcs nationaux · Hôtellerie & transport |
| **Environnement** | — |
| **Culture** | Musique · Patrimoine |
| **Sport** | Football · Autres disciplines |
| **Éditorial** | — |
| **Idées** | Tribune · Interview |
| **Espace pro** | Opportunités · Réglementations · Formation · Docuthèques |

Pages : **À propos**, **Contacts**, ainsi que les pages légales (**Mentions
légales**, **Politique de confidentialité**). Les rubriques sont administrables
(ajout, renommage, réordonnancement, couleur d'accent) sans intervention
technique. L'accent d'une rubrique se choisit parmi cinq crans de la charte qui
portent du texte sur blanc : `navy-900`, `navy-700`, `gold-800`, `green-700`,
`blue-600`.

### 4.2 Site public

Le site public de BOMA Infos comprend :

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

Fonction du socle, conservée. Une entreprise partenaire dépose son actualité
elle-même ; la rédaction garde la main éditoriale.

**Parcours :**
1. **Inscription** de l'entreprise (raison sociale, NIF/RCCM, secteur, logo,
   contact). Compte **validé manuellement** par un administrateur.
2. **Dépôt** : titre, chapô, corps, visuels, rubrique souhaitée, date de
   diffusion demandée, type (communiqué, nomination, résultats, événement,
   publi-rédactionnel).
3. **Contrôle automatique** à la soumission (agent Modération des dépôts, §4.6) :
   score de conformité à la charte, détection du publi-rédactionnel non déclaré,
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

Huit agents. **Règle absolue : un agent propose, un humain dispose.** Aucun
agent ne publie, ne refuse ni ne modifie un contenu sans validation ; toute
suggestion est tracée, acceptable ou rejetable, et l'historique est conservé.

Sept agents travaillent sur un contenu que la rédaction détient déjà (texte, image,
dépôt d'entreprise, enregistrement). Leur consigne
porte le contexte de BOMA Infos : actualité générale du Gabon, exactitude d'abord
et neutralité — en politique plus qu'ailleurs : ni jugement, ni rumeur, ni propos
prêté à quelqu'un sans source nommée. Le huitième, la **Veille de l'actualité**,
va chercher l'actualité sur le web au lieu de traiter un contenu reçu.

| # | Agent | Tâche répétitive supprimée | Déclenchement |
|---|---|---|---|
| 1 | **Relecture** | Orthographe, grammaire, typographie française (espaces insécables, guillemets « », capitales accentuées), respect du style maison. | À l'enregistrement |
| 2 | **Titraille** | Propose 3 titres, 1 chapô, 1 accroche réseaux, 1 méta-description. | À la demande |
| 3 | **SEO** | Slug, méta-données, mots-clés, maillage interne (repère les articles liés du fonds), données structurées `NewsArticle`. | À l'enregistrement |
| 4 | **Média** | Texte alternatif de chaque image (accessibilité + SEO), légende, recadrages 16:9 / 1:1 / 1200×630, conversion AVIF/WebP, compression. | À l'import |
| 5 | **Modération des dépôts** | Pré-qualifie les dépôts entreprises : conformité à la charte, publi-rédactionnel déguisé, allégations à vérifier, doublons. Produit une fiche de synthèse pour le rédacteur en chef. | À la soumission |
| 6 | **Diffusion** | Décline l'article en formats LinkedIn, WhatsApp, Facebook ; compose la newsletter hebdomadaire à partir des articles de la semaine. | À la publication |
| 7 | **Transcription** | Audio/vidéo d'interview → texte horodaté → trame d'article questions/réponses. Sert directement la rubrique Interview. | À l'import d'un média |
| 8 | **Veille de l'actualité** | Cherche sur le web l'actualité du Gabon dans sept domaines — politique, économie, société, tourisme, environnement, culture, sport — et propose des **pistes de sujets sourcées** : titre de travail, faits en deux ou trois phrases, pourquoi maintenant, rubrique suggérée, pages sources. Ne rédige rien. | Chaque matin à 05:30 UTC (06:30 à Libreville), pour un tour d'horizon ; à la demande par domaine depuis le back-office (`/redaction/agents`) |

**Garde-fous propres à la Veille.** Elle part du web et non d'un texte de la
rédaction : l'enjeu est qu'elle ne rapporte jamais un fait sans page derrière lui.

1. **Des sources vérifiées.** Chaque source citée est confrontée aux adresses
   réellement rapportées par l'outil de recherche pendant l'exécution : une source
   introuvable est retirée, une piste sans source est écartée. Une piste appuyée sur
   deux sites au moins est étiquetée « recoupée », sinon « source unique, à
   recouper ». Si une exécution ne rapporte aucune trace de ses recherches, la
   vérification est impossible : les pistes sont conservées et étiquetées « sources
   non vérifiées par l'agent », jamais présentées comme vérifiées.
2. **Pas de doublon.** Une piste déjà proposée — en attente, retenue ou écartée —
   ne revient pas, même reformulée. Écarter une piste est donc définitif pour la
   veille : le tableau propose « Annuler » pendant dix secondes après le geste,
   pour qu'un clic malheureux ne fasse pas perdre un sujet. Une piste retenue ne
   se rouvre pas : son brouillon existe.
3. **Un brouillon, jamais un article.** Retenir une piste ouvre un **brouillon**
   qui commence par la note de veille et ses sources ; rien n'est publié, rien
   n'est même rédigé : un journaliste vérifie et écrit.
4. **Sans clé d'API, aucune piste inventée.** L'agent ne lance aucune recherche ; il
   signale seulement les rubriques restées sans parution depuis plus de sept jours
   et fournit les recherches à lancer à la main.
5. **Un coût borné.** Interrupteur individuel et plafond de dépense mensuel,
   communs à tous les agents ; les recherches web y sont comptées (10 $ les mille
   recherches, six recherches au plus par exécution).

Modèle par défaut : `claude-opus-5-5` ; outil de recherche web de l'API Claude
(`web_search_20260209`).

**Garde-fous communs aux huit agents** : journal complet des exécutions, plafond de
dépense mensuel avec alerte, données éditoriales non utilisées pour
l'entraînement de modèles tiers, désactivation individuelle de chaque agent,
**repli manuel toujours disponible** si un agent est indisponible.

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
| Médias | Stockage objet + transformation à la volée (AVIF/WebP) | Le poste le plus lourd du site audité (7,95 Mo d'images sur l'accueil). |
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

| Défaut constaté (site audité) | Exigence |
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

| Indicateur | Cible | Plafond | Site audité |
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

**Sans objet pour BOMA Infos** : il n'existe pas de site antérieur, donc ni fonds
à migrer, ni URL à préserver, ni référencement acquis à protéger.

Le socle portait la migration d'un fonds WordPress (articles, médias, rubriques,
auteurs, dates ; URL préservées ou redirigées en 301 ; recette par inventaire
avant/après, contrôle des liens morts, vérification d'un échantillon d'articles).
Son outillage est **conservé, non utilisé** : scripts d'export, de préparation et
d'import (`scripts/export-wordpress.py`, `scripts/prepare-wordpress.py`,
`scripts/prepare-wordpress-media.ts`, `scripts/import-wordpress.ts`), fonctions
Convex `wordpressImport`, et le récit de la migration du titre d'origine
(`docs/MIGRATION-WORDPRESS.md`). Si une archive était un jour reprise, ces exigences
redeviendraient celles du socle.

Les redirections de `lib/legacy-redirects.ts` sont **génériques** : elles ne
reprennent aucune adresse d'un ancien site. Elles répondent en 301 aux chemins
que lecteurs, lecteurs de flux et moteurs de recherche essaient sur tout site
d'actualité (`/feed`, `/about`, `/category/<slug>`, `/author/<slug>`…), et
renvoient à l'accueil les points d'accès WordPress que les robots sondent
(`/wp-json`, `/wp-login.php`…), sans laisser de trace de ce qui est installé. Un
chemin d'un seul segment qui correspond au slug d'un article renvoie à
`/article/<slug>`.

---

## 6. Livraison

### 6.1 Lots

Les trois premiers lots sont le **socle hérité**, livré : ils ont été construits
pour le titre d'origine et repris le 03/10/2026. Le quatrième adapte ce socle à
BOMA Infos.

| Lot | Contenu | Livrable vérifiable |
|---|---|---|
| **1 — Fondations** (socle hérité, livré) | Socle applicatif, design system complet, jetons, thème clair/sombre, mise en page, composants de base. | Le socle tourne, la galerie de composants est navigable. |
| **2 — Journal public** (socle hérité, livré) | Modèle de contenu, accueil, rubriques, article, recherche, auteurs, SEO, PWA, budget de performance tenu. | Le site public est consultable et mesuré. |
| **3 — Espaces privés et agents** (socle hérité, livré) | Authentification et rôles, back-office rédaction, portail entreprise et workflow de modération, les sept agents d'origine, statistiques. | Un dépôt d'entreprise va jusqu'à la publication. |
| **4 — BOMA Infos — identité, rubriques, veille** (03/10/2026) | Charte graphique (§3) : jetons, typographie, logo, filet tricolore, îles marine ; dix rubriques (§4.1) ; huitième agent, la Veille de l'actualité (§4.6), et consigne BOMA Infos des sept autres ; coordonnées non communiquées déclarées `null` ; jeu de démonstration de 28 articles, 6 signatures, 40 photographies libres (Wikimedia Commons) et 6 documents, entièrement fictif. | Le site affiche la charte de BOMA Infos dans les deux thèmes ; les dix rubriques sont administrables ; la Veille propose des pistes sourcées (ou, sans clé d'API, signale les rubriques silencieuses) ; une mention de démonstration figure sur chaque page et en tête de chaque article. |

Les trois lots d'origine correspondent chacun à un prompt d'implémentation :
`prompts/01`, `02`, `03`, conservés comme historique technique (ils décrivent la
construction du socle pour le titre d'origine). Le lot 4 est décrit par ce
document et par le `README.md`.

Le jeu de démonstration est fictif (personnes, citations, chiffres) : les
institutions réelles n'y sont citées qu'en contexte neutre, et aucun propos n'est
attribué à une personne réelle ni au titulaire d'une fonction. La mention de
démonstration (`DEMO_CONTENT_NOTICE`, `lib/site.ts`) se retire avec le jeu, à la
mise en ligne.

### 6.2 Critères de recette

Le projet est réputé livré quand : les budgets du §5.4 sont tenus et vérifiés en
intégration continue ; l'audit d'accessibilité AA ne remonte aucun défaut
bloquant ; les en-têtes de sécurité du §5.3 sont en place ; un dépôt d'entreprise
parcourt tout le workflow jusqu'à publication ; les 8 agents produisent des
suggestions validables (la Veille, des pistes dont chaque source a été retrouvée
par la recherche ; sans clé d'API, des notes hors ligne qui n'inventent aucune
piste) ; les redirections génériques du §5.6 répondent en 301 ; la rédaction
publie sans assistance technique ; les mentions légales sont complétées par
l'éditeur ; le jeu de démonstration et sa mention sont retirés avant la mise en
ligne publique.

### 6.3 Risques

| Risque | Parade |
|---|---|
| Des images lourdes — publiées par la rédaction ou issues d'une archive importée — cassent le budget de performance | Retraitement des médias (AVIF/WebP à plusieurs largeurs), non négociable ; budget vérifié à chaque compilation (§5.4) |
| Les entreprises déposent du publicitaire déguisé | Mention « Communiqué » automatique + agent Modération des dépôts + refus motivé |
| Coût des agents non maîtrisé — dont la Veille, seule à payer des recherches web | Plafond mensuel commun, journal, désactivation unitaire ; recherches web comptées dans le plafond (10 $ les mille), six recherches au plus par exécution |
| Une veille qui inventerait une information | Vérification des sources (une source que la recherche n'a pas rapportée est retirée, une piste sans source est écartée) ; brouillon et non publication (retenir une piste n'écrit rien) ; journal des exécutions ; sans clé d'API, aucune piste inventée |
| Dépendance à un agent indisponible | Repli manuel systématique sur chaque tâche |
| Contenu de démonstration pris pour de l'information | Mention sur chaque page (pied de page) et en tête de chaque article ; jeu de démonstration et mention retirés à la mise en ligne |
| Courriel de la rédaction non confirmé, mentions légales incomplètes | `redaction@bomainfos.com` est déduit du domaine : confirmer que la boîte existe ; les champs non communiqués restent `null` et ne sont pas affichés ; la page « Mentions légales » liste ce qui manque |
| Perte de référencement si une archive est un jour importée | Plan de redirection 301 généré depuis cette archive et vérifié avant mise en ligne (§5.6) |

---

*Fin du cahier des charges — BOMA Infos, version 2.0*
