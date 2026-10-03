# Logo éditorial — BOMA Infos

« BOMA » en Source Serif 4 Semibold, « infos » en Inter ExtraBold, et trois
pastilles — verte, jaune et bleue, les couleurs du drapeau gabonais — posées
au-dessus de « infos ».

`boma-infos.svg` est le maître vectoriel. Les lettres sont des tracés : aucune
police à charger. Son cadre mesure 5194 × 1194 ; `dimensions.json` le décrit,
avec les trois pastilles (centre, rayon, couleur) et le cadre du B capital
qu’emploient les petits formats. Le maître contient le tracé `wordmark` (les
lettres), le tracé `capital-b` (déclaré dans `<defs>`, pour les icônes) et les
cercles `dot-green`, `dot-yellow` et `dot-blue`.

**Origine du dessin.** Aucun fichier source du logo n’a été fourni : le maître a
été **redessiné d’après l’image de la charte** (la carte « citation » du
propriétaire). Les proportions, les graisses et la position des pastilles ont été
mesurées sur cette image. Si le propriétaire fournit le logo officiel en
vectoriel, il remplace le maître, puis `bun run brand` régénère tous les exports.

## Exports

`bun run brand` exporte les fichiers ci-dessous, puis régénère les icônes
(`bun run icons`). Les fichiers produits sont versionnés. Le script ne dépend ni
d’une police, ni d’un outil de vectorisation, ni d’un service externe.

| Fichier                                | Contenu                                                                                                 | Emploi                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `public/brand/boma-infos.v1.svg`       | Fragments `#wordmark` (lettres, sans couleur propre) et `#dots` (pastilles, avec leurs trois couleurs)  | `BrandWordmark` les référence par `<use>`                                                              |
| `public/brand/boma-infos-light.v1.svg` | Lettres marine `#0B1848`, pastilles vert `#38AA75`, jaune `#FCC546` et bleu `#1765E6`, fond transparent | Version autonome pour fond clair                                                                       |
| `public/brand/boma-infos-dark.v1.svg`  | Lettres blanches `#FFFFFF`, mêmes pastilles, fond transparent                                           | Version autonome pour fond sombre                                                                      |
| `public/brand/boma-infos-light.v1.png` | Lettres marine et pastilles sur fond blanc, 1120 × 257 px                                               | Logo des données structurées                                                                           |
| `assets/brand/boma-infos-dark.png`     | Lettres blanches et pastilles, fond transparent, 800 px de large                                        | Carte Open Graph de chaque article, sur fond marine ; hors de `public/`, donc jamais servie au lecteur |

## Dans l’interface

`BrandWordmark` affiche deux fragments du même SVG public : `#wordmark`, dont la
couleur vient du thème (marine sur une page blanche, blanc sur du marine), et
`#dots`, qui garde les trois couleurs de la charte partout. Les deux partagent
une seule ressource mise en cache. Les lettres suivent le thème de l’endroit où
elles se trouvent — blanches dans le bandeau et le pied de page, qui sont des
« îles marine » (classe `dark`) — et le thème choisi par le lecteur, même quand
il diffère de celui de son système. La page d’erreur du journal emploie les
mêmes fragments. Le lien fait au moins 44 px de haut, même quand le logo
rétrécit sur mobile.

## Icônes

Le nom entier serait illisible dans un onglet : les icônes reprennent le **B
capital** du logo, en blanc sur marine `#0B1848`, souligné des trois pastilles.
`bun run icons` produit `app/icon.svg`, `app/icon.png`, `public/favicon.ico`,
`public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` et
`apple-touch-icon.png`. La variante maskable garde le dessin dans la zone sûre de
80 % que recadre Android.

## Modifier le logo

Après modification du maître, régénérer les exports avec `bun run brand`. Si le
dessin change, incrémenter les noms publics versionnés (`.v1`) dans
`lib/brand.ts` ; `scripts/make-brand.ts` refuse d’exporter si le cadre déclaré
dans `lib/brand.ts` ne correspond plus à `dimensions.json`. Vérifier les deux
thèmes, un écran de 320 px et `bun run verify` (budget de page inclus).
