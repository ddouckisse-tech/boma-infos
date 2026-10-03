> **Héritage du socle.** Ce document décrit la construction du socle (fondations et design
> system) pour le titre d'origine, « Le Corporate ». Il est conservé comme historique
> technique et n'a pas été réécrit : les couleurs, polices, logo et chiffres qu'il cite sont
> ceux de ce titre. L'identité, la charte, les rubriques et les agents en vigueur sont ceux de
> BOMA Infos : voir [`README.md`](../README.md) et [`CAHIER-DES-CHARGES.md`](../CAHIER-DES-CHARGES.md).

# Prompt 1/3 — Fondations et design system

> À exécuter en premier. Référence : `../CAHIER-DES-CHARGES.md` (§3, §5.1, §5.3).
> Objectif : un socle applicatif qui tourne, et un design system complet et
> visible. Aucune fonctionnalité éditoriale dans ce lot.

---

## Contexte à charger avant de commencer

Tu implémentes la refonte de **Le Corporate**, magazine économique gabonais
(édité par Up Concept), aujourd'hui sur un WordPress lourd (9,35 Mo en page
d'accueil, 4,46 s de premier affichage, 6 familles de polices, 92 fichiers JS).

Lis `CAHIER-DES-CHARGES.md` en entier avant d'écrire la moindre ligne. Les §3
(design system) et §5 (exigences techniques) font foi ; en cas de doute, c'est
le cahier des charges qui tranche, pas ta préférence.

**L'audience est gabonaise et majoritairement mobile, sur data payante.** Chaque
décision se juge à ce critère : est-ce que ça alourdit la page ? Si oui, c'est
probablement non.

---

## Ce que tu dois livrer

### 1. Initialisation du projet

Dans `/Users/okatech/LeCorporate`, initialise :

- **Next.js** (App Router) + **React** + **TypeScript en mode strict**
- **Tailwind CSS**
- **shadcn/ui** (Radix)
- **Convex** (schéma vide pour l'instant, la connexion doit fonctionner)
- **better-auth** (installé et câblé à Convex, sans écran de connexion encore)
- **React Hook Form + Zod**, **sonner**, **lucide-react**
- ESLint + Prettier, `bun` comme gestionnaire de paquets
- Dépôt git initialisé, premier commit

**Contraintes :**
- Jamais de `any` non justifié par un commentaire.
- **Code en anglais, interface en français.** Toute chaîne visible par un
  utilisateur est en français, sans exception.
- `components/ui/` (shadcn) n'est **jamais** modifié. Toute personnalisation se
  fait par composition dans `components/custom/`.

### 2. Jetons de design

Crée `app/globals.css` (ou équivalent) avec les jetons du §3 du cahier des
charges, en variables CSS, déclinés clair **et** sombre.

**Couleurs de marque — valeurs exactes relevées en production, à ne pas altérer :**

```
--brand-navy:     #002060   /* primaire   */
--brand-magenta:  #C74794   /* secondaire */
--surface-muted:  #E6E7F3   /* fond doux  */
--surface:        #FFFFFF
--ink:            #0D1B3E
```

Génère les échelles continues `navy-50 → navy-950` (avec `navy-900 = #002060`)
et `magenta-50 → magenta-950` (avec `magenta-500 = #C74794`), plus les couleurs
fonctionnelles : succès `#0F7B4F`, alerte `#B45309`, erreur `#B42318`,
information `#00509D`.

**Mode sombre** : fond bleu encre `#0A1430` (jamais de noir pur), magenta remonté
à `#E06BAD` pour tenir le contraste. Trois états gérés : choix explicite clair,
choix explicite sombre, et suivi du système par défaut.

**N'introduis aucune autre couleur.** Les valeurs `#148DFE`, `#066AAB`,
`#461CFB`, `#DD8502` présentes sur l'ancien site sont des scories de greffons :
elles ne doivent apparaître nulle part.

Ajoute les jetons d'espacement (échelle de 4 px : 4, 8, 12, 16, 24, 32, 48, 64,
96), de rayon (4 / 8 / 16 px, **pas au-delà**) et les points de rupture
(640 / 768 / 1024 / 1280 / 1536).

### 3. Typographie

Remplace les 6 familles actuelles par **deux**, auto-hébergées en `woff2`,
sous-ensemble latin étendu, `font-display: swap` :

- **Source Serif 4** — titres et chapôs (autorité éditoriale)
- **Inter** — corps, interface, données (chiffres tabulaires activés)

Implémente l'échelle du §3.2 (fluide entre mobile et desktop) :
`display` 32→56 · `h1` 28→40 · `h2` 22→28 · `h3` 19→22 · `body` **17→19** ·
`small` 14→15.

**Règles de lecture à coder dans les styles de base, pas à laisser au hasard :**
- corps d'article limité à `68ch`
- interligne du corps **1,7**, des titres 1,15
- jamais de texte sous 17 px sur mobile
- **jamais de texte justifié**

Télécharge et auto-héberge les polices : **aucun appel à
`fonts.googleapis.com`** (l'ancien site en fait 5, c'est un coût réseau et une
fuite de données).

### 4. Composants de base

Installe depuis shadcn/ui les primitives nécessaires (bouton, champ, étiquette,
boîte de dialogue, menu déroulant, onglets, info-bulle, feuille latérale,
sélecteur, case à cocher, badge, avatar, séparateur, squelette, alerte).

Puis compose dans `components/custom/` :

- **`Header`** — logo « Le Corporate », navigation des 8 rubriques (§4.1 du CDC),
  recherche, bascule de thème. Méga-menu au survol sur desktop pour les
  rubriques à sous-rubriques ; tiroir latéral sur mobile.
- **`Footer`** — rubriques, mentions, réseaux (LinkedIn, WhatsApp, Facebook),
  inscription newsletter (formulaire inerte à ce stade).
- **`ThemeToggle`** — clair / sombre / système, choix mémorisé, sans
  clignotement au chargement.
- **`DataSaverToggle`** — mode économie de données, mémorisé (il sera consommé
  au lot 2 ; ici, il pose l'état et le contexte).
- **`Container`**, **`Section`**, **`PageHeader`** — mise en page.

Les 8 rubriques et leurs sous-rubriques sont dans le §4.1 du cahier des charges :
reprends-les exactement (dont **« Réglementations »**, corrigé de la faute du
site actuel).

### 5. Galerie de composants

Crée une route **`/design-system`** qui présente, sur une seule page navigable :
la palette complète (clair et sombre), l'échelle typographique, les espacements,
tous les composants dans chacun de leurs états (normal, survol, focus, désactivé,
erreur), et un exemple de colonne de lecture à `68ch`.

Cette page est ton instrument de vérification et la référence visuelle de
l'équipe. **Elle doit être atteignable depuis le navigateur.**

### 6. Sécurité et en-têtes

Configure dès maintenant les en-têtes du §5.3 — l'ancien site n'en a **aucun** :

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy` stricte (ajustée au fil des lots, jamais absente)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy` restrictive (géolocalisation, micro, caméra refusés)

### 7. Accessibilité dès le socle

`lang="fr-FR"` · lien d'évitement · `:focus-visible` de 2 px toujours visible ·
cibles tactiles ≥ 44 × 44 px · respect de `prefers-reduced-motion` ·
contrastes conformes AA. **Aucune librairie d'animation** (pas de `wow.js`,
`animate.css`, `splitting`, `simpleParallax` — ce sont les fautes de l'ancien
site). Seules les transitions d'état < 200 ms sont admises.

---

## Vérification — à faire, pas à supposer

Avant de déclarer le lot terminé :

1. Le serveur de développement tourne, `/design-system` s'affiche.
2. Contrôle réel dans un navigateur à **320 px, 768 px, 1024 px, 1440 px** :
   aucun défilement horizontal à aucune largeur.
3. Bascule clair / sombre / système : aucun clignotement, contrastes tenus.
4. Navigation au clavier de bout en bout : le focus est visible partout.
5. `bun run build` et le contrôle de types passent sans erreur.
6. Les en-têtes de sécurité sont présents dans la réponse (vérifie-les).
7. Aucune requête vers `fonts.googleapis.com`.

Rapporte **ce que tu as constaté**, pas ce qui devrait fonctionner. Si un point
échoue, dis-le explicitement.

---

## Ce que tu ne fais pas dans ce lot

Pas de modèle de contenu, pas de page d'article, pas d'authentification
fonctionnelle, pas d'agent, pas de back-office. Ce lot produit **le socle et le
langage visuel**, rien d'autre.

---

## Livrable attendu

Un projet qui démarre, une galerie `/design-system` navigable qui montre
l'intégralité du design system en clair et en sombre, les en-têtes de sécurité
en place, et un commit git propre.
