# Encarts publics — BOMA Infos

Fonctionnalité héritée du socle de BOMA Infos : implémentée localement le
13 septembre 2026 (branche `codex/public-advertising`, base `52f081b`), avant la
reprise du code le 03/10/2026. Le dépôt ne fournit aucune campagne payante et
rien n’est supposé déployé : la mise en service est une procédure à suivre pour
BOMA Infos, décrite dans [le compte rendu de recette](recette-publicites.md).

## Emplacements

| Page                                           | Emplacement                                                        | Grand écran                                              | Petit écran                                      |
| ---------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------ |
| Accueil                                        | `home-primary` après « À la une », avant le dossier                | 1 rectangle centré                                       | 1 rectangle plus court                           |
| Accueil                                        | `home-secondary` après « Derniers articles » (au moins 4 articles) | 1 rectangle supplémentaire                               | Aucun                                            |
| Article                                        | `article` dans la colonne complémentaire                           | 1 affiche carrée ou rectangulaire, sous 2 lectures liées | Les recommandations et l’encart suivent le texte |
| Rubrique et sous-rubrique, pagination comprise | `listing` après les résultats (au moins 4 articles)                | 1 rectangle                                              | 1 rectangle                                      |

Pas d’encart dans la une, au milieu d’un paragraphe, dans les formulaires,
le pied de page, les pages de recherche/contact/compte ou les espaces privés.
La colonne droite mesure 300 px ; la largeur de lecture reste inchangée.
Les recommandations réutilisent `journal.related` (sous-rubrique, rubrique,
étiquettes en commun, puis date), sans répéter les mêmes liens au pied.
Le sommaire reste distinct. La colonne ne devient sticky qu’à partir de
1024 px **et** si sa hauteur complète tient sous l’en-tête. Sinon elle défile
normalement. Aucun élément ne chevauche le texte.

## Lecture et fermetures

- Mention « Publicité » permanente ; « Autopromotion » si concerné.
- Croix indépendante de l’affiche, cible tactile de 44 px, libellé clavier.
- Fermeture de l’emplacement **et de la campagne** pendant 24 heures,
  conservée localement, partagée entre onglets ; jamais de retour sur une page
  laissée ouverte. Expiration du refus évaluée lors d’une nouvelle navigation.
- Campagnes internes : 90 secondes de visibilité effective entre changements,
  **deux changements maximum par page**. Le compteur s’arrête si l’encart est
  hors écran, l’onglet masqué, survolé ou focalisé. Bouton pause/reprise.
- Rotation suspendue avec animations réduites ou économie de données.
- Dates de campagne recontrôlées dans le navigateur même sur une page ISR.
- Aucun espace réservé si aucun candidat n’est disponible. Géométrie constante
  pendant la rotation ; affiches non recadrées et chargées paresseusement.
- Sans stockage disponible, le refus reste en mémoire pendant l’exécution de
  l’application ; un rechargement complet peut perdre cette préférence.

## Alimentation interne

Dans `/redaction/publicites`, l’administrateur choisit une affiche de la
médiathèque (ou l’envoie via le sélecteur existant), son texte alternatif,
un titre, l’annonceur, le lien, les emplacements, les dates et la priorité.
Création, modification, activation et pause sont protégées **côté Convex** par
`settings:manage` et consignées dans le journal d’audit.

`advertising.publicFeed` ne publie que les campagnes actives et valides,
24 maximum. Les fichiers sont issus du manifeste du site ou du stockage
Convex ; chaque rendu est limité à **16 Kio dès que la campagne inclut
l’emplacement article**, carré comme rectangle, même si elle partage aussi
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
- `ADS_MODE=preview` : quatre autopromotions typographiques de recette ; aucune
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
réintroduire `next/link`. Les encarts ne modifient ni le footer ni
`lib/content/server.ts`.

## Recette locale

Les preuves d’une recette locale s’écrivent dans `output/ads/` (captures et
rapports JSON, ignorés par git : le dossier n’est pas versionné).
`AUDIENCE_DISABLED=1` empêche les mesures d’audience pendant la recette locale.
Les tests de politiques et de flux sont dans `tests/advertising-*.test.ts`.
Les résultats de la recette du socle figurent dans
[le compte rendu de recette](recette-publicites.md) ; celle de BOMA Infos est à
rejouer selon la même procédure.
