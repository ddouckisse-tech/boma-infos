# Migration du fonds WordPress

Source : https://le-corporate.com/ ; destination : https://lecorporate.com/.
Import réalisé à partir du fonds public du 12 septembre 2026, dans le déploiement
Convex de production `dusty-peccary-252` (projet `okatech/le-corporate`).

## Périmètre

- 1 019 articles, 23 rubriques, 355 étiquettes source et une signature publique.
- 1 302 pièces jointes identifiées : 1 283 dans l'API et 19 retrouvées sur les
  pages publiques et dans leurs métadonnées Open Graph.
- 1 297 images récupérables, avec fichiers source et versions WebP dans Convex.
- Deux PDF publics conservés dans la docuthèque. Le ZIP et le journal technique
  WordPress sont archivés localement, sans publication dans la docuthèque.
- 26 articles de démonstration passent en brouillon ; six documents de
  démonstration deviennent inactifs. Aucun compte, fichier ou document supprimé.

Les slugs, dates UTC, textes, signatures, liens et couvertures sont conservés.
Le modèle affiche une rubrique principale et une sous-rubrique ; l'ensemble des
catégories WordPress reste dans `sourceCategorySlugs`. Aucun résumé en trois
points ni crédit photographique n'est inventé. Les 19 notices complémentaires
gardent leur provenance dans l'archive source.

Deux indisponibilités préexistantes sont consignées : l'image de médiathèque
WordPress 52 (original et sept variantes en 404, aucune couverture concernée) et
une image Facebook intégrée au post 276 (403). La couverture de ce dernier est
conservée. Les 1 019 couvertures sont disponibles.

## Archives et reprise

Le dossier `.migration/le-corporate/` est exclu de Git et de Vercel :

- `raw/` : réponses API, en-têtes, sitemaps, notices complémentaires et preuves
  d'indisponibilité ; le HTML intégral est conservé dans `raw/posts.json`.
- `originals/`, `encoded/` : fichiers récupérés et variantes d'affichage.
- `prepared-*.json`, `conversion-report.json` : import préparé et contrôle texte.
- `backups/production-before-import.zip` : sauvegarde Convex avec fichiers avant
  toute écriture de migration, à conserver en lieu sûr.
- `uploads-prod.jsonl` : reprise par empreinte SHA-256, sans clés d'accès.
- `verification-prod.json` : rapprochement de toutes les identités importées.

Commandes depuis la racine du projet (Bun, Python 3 et lxml disponibles) :

```sh
python3 scripts/export-wordpress.py
bun scripts/prepare-wordpress-media.ts
python3 scripts/prepare-wordpress.py
bun scripts/wordpress-import.test.ts
bun run typecheck
bun run lint
```

Attendre la fin de l'encodage avant d'importer : les poids déclarés et les fichiers
doivent provenir du même manifeste stable. Les contrôles Convex refusent toute
discordance de type ou de taille.

Après déploiement des fonctions `wordpressImport` sur la base cible :

```sh
bun scripts/import-wordpress.ts --prod --stage media
bun scripts/import-wordpress.ts --prod --stage documents
bun scripts/import-wordpress.ts --prod --stage articles
bun scripts/import-wordpress.ts --prod --stage verify
```

Les fonctions sont internes et exigent l'authentification développeur. L'option
`--credential-file` accepte un fichier privé contenant une clé temporaire du
déploiement cible pour accélérer les lots ; cette clé doit être révoquée après
utilisation. Le fichier ne doit jamais être versionné ou envoyé à Vercel.

`wordpressImport:retireDemo` constitue la dernière étape, après rapprochement
réussi. Elle vérifie slug et titre du corpus de démonstration avant masquage.
Ne pas exécuter `seeding:run` en production : cette ancienne commande réinitialise
les tables éditoriales.

## Publication et contrôle

La production Vercel utilise les variables de son propre environnement ;
`.env.local` reste associé au déploiement de développement. Les archives sont
chargées à la demande avec ISR ; les 30 articles les plus récents sont préparés
au build. Une page ne charge que les médias des articles qu'elle affiche.

Le budget de transfert inclut les images Convex réellement téléchargées. Les
contrôles de livraison couvrent le build, le budget, la recherche, le sitemap,
les liens historiques, les PDF et un échantillon d'articles et d'images en ligne.

Livraison vérifiée le 13 septembre 2026 :

- Domaine public actif : https://lecorporate.com/ ; déploiement Vercel
  `dpl_4iLcs23dD68g6tJo4gaTLCwwXeZ8` prêt et associé au domaine.
- Rapprochement intégral des 1 019 articles publiés avec les données préparées,
  sans différence ; 1 297 originaux et 4 189 variantes WebP présents dans Convex.
- 21 tests d'import, contrôle TypeScript, lint et builds local/distant réussis.
  Budgets de transfert respectés, images comprises.
- Douze parcours HTTP contrôlés avec succès, dont deux anciennes adresses,
  la recherche, la pagination et un PDF. Le sitemap contient 1 019 articles.
- Accueil et article contrôlés dans le navigateur : couvertures chargées,
  aucun débordement horizontal ni erreur de console observés.
- Clé temporaire d'import révoquée et fichier d'identifiants supprimé.

Les preuves détaillées restent dans `live-verification.json` et
`database-content-verification.json`, sous `.migration/le-corporate/`.
