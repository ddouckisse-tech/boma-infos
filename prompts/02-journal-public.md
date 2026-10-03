> **Héritage du socle.** Ce document décrit la construction du journal public pour le
> titre d'origine, « Le Corporate ». Il est conservé comme historique technique et n'a
> pas été réécrit : les rubriques, contenus et chiffres qu'il cite sont ceux de ce titre.
> L'identité, la charte, les rubriques et les agents en vigueur sont ceux de BOMA Infos :
> voir [`README.md`](../README.md) et [`CAHIER-DES-CHARGES.md`](../CAHIER-DES-CHARGES.md).

# Prompt 2/3 — Le journal public

> À exécuter après le lot 1. Référence : `../CAHIER-DES-CHARGES.md` (§4.1, §4.2, §5.2, §5.4).
> Objectif : le site de presse public, complet, rapide, référencé.
> Toujours pas d'espace privé ni d'agent dans ce lot.

---

## Contexte

Le lot 1 a livré le socle et le design system (route `/design-system`). Tu
construis maintenant **le journal que lisent les Gabonais**.

Le critère qui prime sur tout le reste : **le poids**. L'ancien site charge
9,35 Mo en page d'accueil dont 7,95 Mo d'images, pour un premier affichage à
4,46 s. Ta page d'accueil doit tenir **sous 600 Ko** et afficher son contenu
principal en **moins de 2,5 s en 4G mobile**. Ce n'est pas un souhait : c'est la
condition pour qu'un lecteur à Libreville lise l'article sans y laisser son
forfait.

Relis le §3 du cahier des charges avant de composer les pages : la lecture est
le produit.

---

## Ce que tu dois livrer

### 1. Modèle de contenu (Convex)

Implémente le schéma du §5.2 pour la partie éditoriale :

- **`Article`** — titre, slug, chapô, corps (contenu riche), statut, rubrique,
  sous-rubrique, auteur, média principal, galerie, points-clés
  (« L'essentiel en 3 points »), champs SEO, origine (`redaction` | `partenaire`),
  temps de lecture, dates (création, publication, modification), compteur de vues.
- **`Category`** — nom, slug, parent, couleur d'accent, ordre, description.
- **`Author`** — nom, fonction, biographie, portrait, liens.
- **`Media`** — fichier, variantes (AVIF/WebP, plusieurs largeurs), texte
  alternatif, légende, crédit, dimensions.

Les 8 rubriques et leurs sous-rubriques (§4.1) sont créées en données de départ,
**administrables** — pas codées en dur dans les composants.

Prévois `Organization`, `Submission`, `User`, `Role` dans le schéma sans les
exploiter : le lot 3 s'en saisira.

Ajoute un jeu de données de démonstration réaliste (une vingtaine d'articles
répartis sur les rubriques, en français, avec de vraies images) pour que les
pages soient jugeables.

### 2. Pages publiques

- **Accueil** (`/`) — la une, « À la une », derniers articles par rubrique,
  dossier mis en avant, sélection « Espace pro ». Hiérarchie claire : on doit
  comprendre en trois secondes ce qui compte aujourd'hui.
- **Rubrique** (`/rubrique/[slug]`) — liste paginée, filtres par sous-rubrique.
- **Article** (`/article/[slug]`) — titre, chapô, signature, date, temps de
  lecture, « L'essentiel en 3 points », corps, médias légendés, barre de partage,
  articles liés, progression de lecture. **C'est la page la plus importante du
  site** : elle mérite le plus grand soin typographique (colonne à `68ch`,
  interligne 1,7, corps à 17/19 px).
- **Recherche** (`/recherche`) — plein texte avec index Convex, plus un dialogue
  `Cmd+K` accessible depuis toute page.
- **Auteur** (`/auteur/[slug]`), **Docuthèque** (documents téléchargeables),
  **À propos**, **Contacts** (formulaire validé par Zod, protection anti-robot).
- **Newsletter** — inscription avec double opt-in, désinscription en un clic.
- **Page hors-ligne** soignée (voir PWA ci-dessous).

Les états vides, de chargement (squelettes) et d'erreur sont traités partout —
pas de page blanche, pas de « Loading... » en anglais.

### 3. Partage — WhatsApp d'abord

Au Gabon, l'article circule par WhatsApp. La barre de partage met **WhatsApp en
premier**, puis LinkedIn, Facebook, et copie du lien. Les métadonnées Open Graph
doivent produire un aperçu impeccable : image **1200×630** générée
automatiquement pour chaque article, titre, description.

### 4. Performance — budget contraignant

Cible et plafond (§5.4) :

| Indicateur | Cible | Plafond |
|---|---|---|
| Poids accueil | 450 Ko | **600 Ko** |
| Poids article | 300 Ko | **400 Ko** |
| Requêtes (accueil) | 35 | **50** |
| JavaScript exécuté | 120 Ko | **180 Ko** |
| LCP (4G mobile) | 1,8 s | **2,5 s** |
| INP | 150 ms | **200 ms** |
| CLS | 0,05 | **0,1** |
| Lighthouse perf / a11y / SEO | ≥ 95 | **≥ 90** |

Moyens imposés :

- **Composants serveur par défaut** ; le client seulement là où l'interactivité
  l'exige.
- **Images** : AVIF avec repli WebP, dimensions explicites (donc CLS nul),
  `srcset` par point de rupture, chargement différé sauf pour la une.
  C'est ici que se joue l'essentiel : 7,95 Mo d'images aujourd'hui.
- **ISR** sur les pages éditoriales, revalidation à la publication.
- Aucune librairie d'animation, aucun carrousel lourd (l'ancien site charge
  Slider Revolution, swiper ×2, wow ×2 — tout cela disparaît).
- Polices auto-hébergées et sous-ensemblées (acquis du lot 1).

**Ajoute un contrôle automatique du budget** : une compilation qui dépasse un
plafond doit **échouer**, pas avertir.

Câble le **mode économie de données** posé au lot 1 : quand il est actif, images
en basse définition, aucune vidéo préchargée, médias non essentiels remplacés
par un espace réservé cliquable.

### 5. PWA et hors-ligne

Manifeste, icônes, installable. Service worker : les articles consultés restent
lisibles hors connexion, une page hors-ligne soignée remplace l'erreur réseau.
Les coupures sont fréquentes sur le terrain — ce n'est pas un gadget.

### 6. Référencement

- **Un seul `<h1>` par page** (l'accueil actuelle en compte 9).
- Métadonnées par page, URL canoniques, Open Graph et Twitter Card.
- Données structurées **`NewsArticle`** (et `Organization`, `BreadcrumbList`).
- `sitemap.xml` et **flux RSS** générés automatiquement.
- `robots.txt` cohérent.
- **Préservation des URL de l'ancien site** : mets en place le plan de
  redirection 301 (§5.6). La valeur SEO acquise ne doit pas être perdue —
  c'est un actif du média.

### 7. Accessibilité

Conformité **WCAG 2.2 AA / RGAA** : hiérarchie de titres continue, `alt` sur
toutes les images, navigation clavier intégrale, focus visible, cibles ≥ 44 px,
contrastes vérifiés. Rappel du cahier des charges : le magenta `#C74794` sur
blanc est conforme (4,6:1) **mais interdit sous 17 px**, et sur le fond
`#E6E7F3` il tombe à 4,1:1 — donc réservé aux éléments non textuels.

---

## Vérification — mesurée, pas supposée

1. Mesure réellement le poids et le nombre de requêtes de l'accueil et d'un
   article, dans un navigateur. **Donne les chiffres constatés**, comparés aux
   plafonds.
2. Lighthouse mobile sur l'accueil et sur un article : reporte les quatre scores.
3. Contrôle visuel à **320, 768, 1024, 1440 px** : aucun défilement horizontal.
4. Vérifie qu'il n'y a qu'un seul `<h1>` par page.
5. Teste le hors-ligne : coupe le réseau, recharge un article déjà consulté.
6. Teste l'aperçu de partage WhatsApp (métadonnées Open Graph).
7. Navigation clavier complète sur la page d'article.
8. `bun run build` et contrôle de types sans erreur.

Si un budget est dépassé, **dis-le et corrige** — ne livre pas en signalant
l'écart comme acceptable.

---

## Ce que tu ne fais pas dans ce lot

Pas de connexion, pas de back-office, pas de portail entreprise, pas d'agent.
Le contenu vient du jeu de démonstration.

---

## Livrable attendu

Un site de presse public complet et consultable, sous les budgets de
performance, référencé, accessible, installable, avec les chiffres de mesure
constatés à l'appui.
