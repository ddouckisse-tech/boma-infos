# Recette des encarts — socle, 13 septembre 2026

Recette réalisée sur le socle (branche locale `codex/public-advertising`, base
`52f081b`) avant la reprise par BOMA Infos du 03/10/2026. Les captures utilisaient
le corpus de développement du socle et des autopromotions explicitement
identifiées. Les mesures et résultats ci-dessous sont ceux du socle : ils ne
valent pas recette de BOMA Infos, dont le logo, les rubriques et le corpus de
démonstration diffèrent. La section « Limites et mise en service » donne la
procédure à suivre pour BOMA Infos.

## Contrôles réalisés

- 45 tests passent : champs et dates de campagne, formats, tailles réelles
  et plafonds de médias, sélection de flux, fermetures et synchronisation,
  temps visible, configuration AdSense, consentement TCF, CSP et cache hors ligne.
- TypeScript, ESLint, compilation de production et budget bloquant passent.
- Navigateur Chrome : accueil avec deux encarts sur ordinateur et un sur mobile ;
  article avec deux lectures liées et un encart. Aucune erreur de page ni
  débordement à 320, 375, 768, 1024 et 1440 px.
- Colonne de 300 px, sticky seulement si sa hauteur tient sous l’en-tête ;
  statique à 1024 × 900 et sur mobile, sticky à 1440 × 1100.
- Rotation après 90 secondes visibles, arrêt après deux changements ; réduction
  des animations respectée, pause, focus après fermeture, synchronisation des
  onglets. Une page ouverte reste fermée après 24 h ; une nouvelle navigation
  peut réafficher l’encart après expiration du délai.
- Affiches carrées et rectangulaires réelles testées avec un inventaire local :
  image entière, campagne périmée éliminée, inventaire vide sans espace,
  emplacement secondaire mobile sans image téléchargée.
- AdSense sur **build de production local** : identifiants synthétiques,
  scripts CMP/Google interceptés et remplacés localement ; toutes les autres
  destinations non locales bloquées. Aucun appel réel de régie.
- Accord requis avant script Google ; deux initialisations sur ordinateur,
  une sur mobile, aucune après dix minutes simulées. Révocation masque les
  unités ; réaccord ne relance pas la même unité. Nonce différent à chaque
  rechargement, aucune erreur CSP ou d’hydratation. Unité vide repliée hors écran,
  fermeture conservée après rechargement, aucun débordement à 320 px.

## Budget mesuré sur le socle

Même plafonds : 600 Kio accueil, 400 Kio article, 180 Kio JavaScript, 50 requêtes.

| Build                        | Page de référence               |     Total | JavaScript | Requêtes |
| ---------------------------- | ------------------------------- | --------: | ---------: | -------: |
| Campagnes en aperçu          | Accueil                         | 499,0 Kio |  173,3 Kio |       37 |
| Campagnes en aperçu          | Article dossier diversification | 377,3 Kio |  176,9 Kio |       26 |
| AdSense configuré localement | Accueil                         | 409,8 Kio |  173,3 Kio |       35 |
| AdSense configuré localement | Article Ivindo Capital          | 242,4 Kio |  176,9 Kio |       22 |

Les pages dynamiques AdSense sont réellement servies par le build local pour
ce contrôle. Il mesure les ressources propriétaires avant consentement,
**pas le script de la CMP ni les ressources Google**. Leurs poids doivent être
mesurés avec le compte et la CMP retenus, y compris le bootstrap CMP avant accord.
Les pages et illustrations des deux échantillons diffèrent : les totaux ne
constituent pas une comparaison de vitesse des deux modes.

Le gain de JavaScript vient d’un graphe client identique pour le journal et
sa page introuvable, et d’un écran d’erreur autonome. Les plafonds et les
réglages Turbopack existants sont conservés. Les affiches comprenant un
emplacement article sont limitées à 16 Kio pour préserver la marge de lecture.

## Preuves locales

La recette du socle a écrit, dans `output/ads/` (ignoré par Git, donc absent du
dépôt) :

- `home-desktop.png`, `home-mobile.png`, `article-desktop.png`, `article-mobile.png`.
- `article-dark.png`, `article-closed.png`, `fixture-real-posters-*.png`.
- `adsense-mock-desktop.png`, `adsense-mock-mobile.png` : simulations identifiées.
- `check.json`, `behavior.json`, `fixture-check.json`, `adsense-check.json`.
- `verify.log`, `build-adsense.log`.

## Limites et mise en service

Pour BOMA Infos, la mise en service suit cet ordre :

1. déployer les fonctions Convex publicitaires sur l’environnement cible, lors
   d’une publication autorisée ; le dépôt ne fournit aucune campagne réelle ;
2. écrire les campagnes depuis `/redaction/publicites` ;
3. valider la sauvegarde complète depuis l’administration, après la publication
   des nouvelles fonctions ; les protections serveur et validations sont
   présentes et testées au niveau du modèle.

Pour AdSense : vrais identifiants, compte autorisé, CMP certifiée configurée,
unités manuelles et options de compte décrites dans [adsense.md](adsense.md).
Reconstruction requise avec la configuration définitive. Le remplissage réel,
les revenus et le poids des ressources tierces ne sont pas validés par cette
recette.

La recette du socle n’a comporté ni push, ni merge, ni déploiement.
