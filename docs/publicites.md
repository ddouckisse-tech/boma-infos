# Publicités BOMA Infos

La régie interne utilise les campagnes Convex et les affiches de la médiathèque.
L’administration est accessible dans **Rédaction → Publicités**, aux administrateurs
disposant de la permission de gestion des réglages. Les mêmes contrôles sont
appliqués aux requêtes et mutations du serveur.

## Préparer et diffuser une campagne

1. Choisir **Nouvelle campagne**, renseigner le titre, l’annonceur et un lien local
   ou HTTPS, puis sélectionner l’affiche dans la médiathèque. Une seconde affiche
   smartphone facultative peut être choisie : privilégier une composition 16:9,
   de 640 px de large minimum, avec un titre lisible sur un écran de 358 px.
2. Choisir le format, les emplacements et le ciblage **Tous les écrans**,
   **Ordinateur** ou **Mobile et tablette**. Les emplacements incompatibles avec
   le format ne sont pas proposés.
3. Renseigner si nécessaire un début et une fin dans l’heure locale du navigateur.
   Le début est inclus, la fin exclue. La priorité va de 0 à 100.
4. Activer et enregistrer. Une campagne peut être modifiée ou mise en pause depuis
   la liste. La publication utilise le cache du journal, renouvelé sous environ
   cinq minutes à la prochaine visite.

Les bandeaux occupent les pauses entre les blocs d’accueil, les listes et les
articles longs. Le format carré occupe la colonne complémentaire d’article ou
les formats superposés. Aucun encart ne coupe une phrase ou un bloc d’article.

Sur téléphone et tablette (moins de 1024 px), l’affiche smartphone prend la
largeur de lecture, au ratio 16:9 comme une image d’article. Le navigateur choisit
sa source dans un seul élément picture, sans télécharger une seconde image
cachée. Sans affiche smartphone, l’affiche principale reste disponible. Les
bandeaux sur ordinateur peuvent atteindre 768 px ; leur format principal est
conservé. La carte flottante mobile présente aussi un grand visuel, avec une
hauteur bornée et une fermeture qui reste accessible pendant son défilement.

Sur ordinateur, la fenêtre publicitaire est prioritaire ; sur mobile, la carte
flottante compacte l’est. L’autre format sert de repli si aucune campagne du
format prioritaire n’est disponible. Une publicité superposée apparaît seulement
après un temps de lecture visible et 25 % de défilement. Une seule est permise
pendant 24 heures, dès son affichage, même après navigation ou rechargement.
Le lecteur peut fermer la publicité ; les préférences d’économie de données et
de réduction des animations suspendent ces formats. Les campagnes ciblées sur
un autre écran ne téléchargent pas leur affiche.

## Cinq exemples fictifs

**Charger les 5 exemples** ajoute cinq campagnes et leurs médias manquants. Le
chargement peut être répété : les campagnes existantes, leurs modifications et
l’ensemble du contenu rédactionnel sont conservés. Chaque exemple est identifié
dans l’administration, sur l’affiche et dans son encart. Ses liens aboutissent à
une page de démonstration, sans achat ni réservation.

Le catalogue public est accessible depuis le pied de page, **Publicité**, à
`/publicite`. Les pages `/publicite/demo/<slug>` ne sont pas indexables ; les
anciens liens des campagnes en pause restent valides.
Les cinq anciennes campagnes supplémentaires restent en pause après réduction du catalogue.
Les visuels originaux sont générés par `scripts/make-demo-ads.ts` et leur
manifeste est séparé de la photothèque rédactionnelle. Les variantes comprennent
480 px pour le mode économie de données.

Le mode local explicite `ADS_MODE=preview` présente ces mêmes exemples sans
écrire dans Convex. Le mode habituel `campaigns` diffuse uniquement les campagnes
actives du compte configuré. `off` masque les campagnes. Les fenêtres et cartes
flottantes de cette régie ne chargent aucun script publicitaire tiers.

## Vérifier une modification

Les tests publicitaires couvrent la validation, les droits, les calendriers, le
ciblage, le chargement répété et les fermetures. Exécuter ensuite le contrôle des
types, le lint et la compilation avec son budget. Pour la recette visuelle,
contrôler l’accueil, un article long, une rubrique et l’administration à 390 px,
834 px et 1440 px, puis le parcours modification → diffusion → fermeture →
navigation/rechargement.

## Configuration technique conservée

`advertising.publicFeed` ne publie que les campagnes actives et valides,
24 maximum. Les fichiers sont issus du manifeste du site ou du stockage
Convex ; chaque rendu est limité à **16 Kio dès que la campagne inclut
un emplacement article, article-inline, popup ou floating**, carré comme rectangle, même si elle partage aussi
l’accueil ou les listes. Ailleurs, les plafonds restent de 32 Kio pour un
carré et 55 Kio pour un rectangle (1 Kio = 1024 octets). La taille réelle des
fichiers envoyés est vérifiée avant d’appliquer le plafond, à l’enregistrement,
à l’activation et dans le flux public. Un média encore référencé
par une campagne ne peut pas être supprimé. Le calendrier utilise
l’ordonnanceur Convex, qui réveille le catalogue aux dates de début et de fin.
Les pages du journal conservent leur revalidation à cinq minutes.

Configuration serveur :

- `ADS_MODE=campaigns` : catalogue Convex (défaut) ; inventaire absent ou erreur,
  aucun encart. Les nouvelles fonctions doivent être livrées sur l’environnement
  cible lors d’une publication autorisée.
- `ADS_MODE=off` : aucun encart.
- `ADS_MODE=preview` : cinq campagnes fictives de recette ; aucune
  écriture en base. Ce mode est utilisé pour les captures locales.
- `ADS_FEED_URL` et `ADS_FEED_TOKEN` facultatifs : ordonnanceur HTTPS renvoyant
  `{ "campaignIds": ["identifiant-de-campagne-existant"] }`. Le serveur sélectionne
  uniquement les identifiants approuvés du catalogue actif ; les inconnus sont
  ignorés, la liste est limitée à 24. Réponse limitée à 16 Ko, délai 2,5 secondes,
  redirections refusées, jeton jamais envoyé au navigateur. Une panne masque les
  emplacements. Ce flux sélectionne les campagnes internes ; il ne fournit ni
  HTML ni tag publicitaire tiers.

Le **mode régie AdSense** dispose d’un raccordement séparé : voir
[Configuration AdSense](adsense.md). Aucun rafraîchissement de campagne interne
n’est appliqué à une unité AdSense.

## Références et adaptation

Les références ci-dessous sont des **catalogues de formats**, pas un audit
visuel des pages d’article de ces éditeurs.

- [M Publicité — spécifications](https://mpublicite.fr/wp-content/uploads/2023/02/Mpub-Specificites_techniques-1.pdf) : pavé 300×250 et bannières.
- [MEDIA FIGARO — formats web](https://media.figaro.fr/formats-web) : pavé et formats de colonne.
- [PréventionBTP — kit média](https://www.kitmediapreventionbtp.fr/les-formats-publicitaires/) : bannière au milieu de l’accueil et déclinaison mobile plus courte.
- [AdSense — règles sticky](https://support.google.com/adsense/answer/10734935?hl=en) : séparation, pas de chevauchement, largeur ≤300 px, desktop uniquement.
- [AdSense — emplacement et rafraîchissement](https://support.google.com/adsense/answer/1346295?hl=en) : les liens éditoriaux restent distincts ; aucun auto-refresh de tags AdSense.

L’adaptation de BOMA Infos retient un nombre réduit d’encarts, une gouttière
large et une colonne qui respecte la hauteur disponible. Les affiches internes
acceptent le carré et le rectangle ; leurs proportions peuvent différer de
celles d’un inventaire de régie normalisé.

## Intégration avec l’import WordPress

Section héritée du socle : BOMA Infos n’importe aucune archive, et l’outillage
d’import WordPress est conservé, non utilisé (voir
[la migration du titre d’origine](MIGRATION-WORDPRESS.md)). Si une archive est un
jour importée, ne pas écraser la branche d’import. Les seuls points communs
attendus sont `app/(journal)/article/[slug]/page.tsx`, `convex/schema.ts`,
`convex/library.ts`, `convex/_generated/api.d.ts`, `proxy.ts`, le root layout et
`scripts/check-budget.ts`.
Conserver les ajouts de l’import (contenu, médias, liens, marque et redirections)
puis y reporter les composants de publicité et la table additionnelle.
Le contrôle des images Convex ajouté par l’import doit être conservé en combinant
le contrôle des pages dynamiques de cette branche. La marque du fallback
`app/error.tsx` doit reprendre le logo en vigueur (`BRAND_LOGO`) sans
réintroduire `next/link`. Le pied de page propose un lien vers le catalogue public de la régie ;
`lib/content/server.ts` conserve son fonctionnement éditorial.

## Recette locale

Les preuves d’une recette locale s’écrivent dans `output/ads/` (captures et
rapports JSON, ignorés par git : le dossier n’est pas versionné).
`AUDIENCE_DISABLED=1` empêche les mesures d’audience pendant la recette locale.
Les tests de politiques et de flux sont dans `tests/advertising-*.test.ts`.
Les résultats de la recette du socle figurent dans
[le compte rendu de recette](recette-publicites.md) ; celle de BOMA Infos est à
rejouer selon la même procédure.
