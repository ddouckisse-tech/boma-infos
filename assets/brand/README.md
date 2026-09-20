# Logo éditorial — Le Corporate.

Logo validé le 12 septembre 2026 : « Le » rose en serif italique, « Corporate »
en serif gras, point final rose, sans signature « By Up Concept ».

`le-corporate.svg` est le maître vectoriel, tracé depuis l’image choisie
(`public/logo_lecorporate.png`). Il contient les formes du nom, de l’accent
et du C utilisé pour les petits formats. `dimensions.json` décrit leurs cadres.
Les caractères sont des tracés : aucune police supplémentaire à charger.

`bun run brand` exporte les SVG et PNG puis régénère les icônes d’onglet et PWA.
Les fichiers produits sont versionnés. Le script ne dépend pas du fichier
bitmap d’origine, d’un outil de vectorisation ou d’un service externe.

- **Interface** : `BrandWordmark` emploie les deux fragments du SVG public
  `le-corporate.v1.svg`. Ils partagent une ressource mise en cache et héritent
  du thème de la page, y compris lorsque le lecteur choisit un thème différent
  de celui du système. Les mêmes tracés servent à tous les emplacements.
- **Clair** : marine `#002060`, rose `#C74794`, fond transparent.
- **Sombre** : blanc `#FFFFFF`, rose éclairci `#E06BAD`, fond transparent.
- **Partage** : PNG blanc/rose transparent pour la carte Open Graph sur fond
  marine ; PNG marine/rose sur fond blanc pour les données structurées.
- **Petits formats** : C serif et point rose, plutôt que le nom entier qui
  serait illisible dans un onglet. La variante maskable conserve sa zone sûre.

Après modification du maître, régénérer les exports ; si leur dessin change,
incrémenter les noms publics versionnés dans `lib/brand.ts`. Vérifier les deux
thèmes, un écran de 320 px et `bun run verify` (budget de page inclus).
