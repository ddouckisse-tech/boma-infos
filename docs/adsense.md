# Raccordement AdSense

Le mode AdSense est implémenté et reste désactivé tant que sa configuration est incomplète. Aucun compte, identifiant de régie ou annonceur réel n’est fourni par le dépôt. Les valeurs synthétiques des tests ne quittent pas les tests locaux.

## Configuration du site

Ces variables sont lues sur le serveur, sans préfixe `NEXT_PUBLIC_` :

| Variable                      | Valeur attendue                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `ADS_MODE`                    | `adsense` pour activer ce raccordement                                                               |
| `ADSENSE_CLIENT_ID`           | Identifiant fourni par votre compte, `ca-pub-` suivi de 16 chiffres                                  |
| `ADSENSE_SLOT_HOME_PRIMARY`   | Identifiant numérique de 10 chiffres de l’unité accueil principale                                   |
| `ADSENSE_SLOT_HOME_SECONDARY` | Identifiant de l’unité accueil secondaire, ordinateur seulement                                      |
| `ADSENSE_SLOT_ARTICLE`        | Identifiant de l’unité de lecture                                                                    |
| `ADSENSE_SLOT_LISTING`        | Identifiant de l’unité des listes                                                                    |
| `ADSENSE_CMP_ID`              | ID IAB de la CMP certifiée Google effectivement choisie                                              |
| `ADSENSE_CMP_SCRIPT_URL`      | URL HTTPS réelle du script d’installation de cette CMP pour ce site                                  |
| `ADSENSE_CMP_ALLOWED_ORIGINS` | Origines HTTPS exactes nécessaires à la CMP, séparées par des virgules ; inclure l’origine du script |

Au moins une unité doit être renseignée. Un emplacement non configuré ne produit aucun encart AdSense. Client, CMP ou liste d’origines invalide : aucun script tiers n’est chargé. Pas de wildcard, credentials URL, protocole autre que HTTPS ou directives CSP dans les origines.

Définir la même configuration complète **au build et au runtime** : `ADS_MODE`, identifiant d’éditeur, identifiants des unités retenues et paramètres CMP doivent être disponibles pour `next build`, `bun run budget` et le serveur de production. Toute modification de cette configuration nécessite une reconstruction et une nouvelle livraison. En particulier, le passage d’un mode interne statique à AdSense ne peut pas se faire en changeant uniquement les variables de `next start` : le proxy pourrait ajouter une CSP à nonce à un HTML déjà prérendu sans ce nonce, bloquant son hydratation.

Créer les unités **Display responsives** dans le compte autorisé. Désactiver **Auto ads**, les formats d’ancrage/vignette, l’optimisation automatique des dimensions et le remplissage automatique des unités vides dans ce compte pour conserver les emplacements et limites prévus ici. Le script Google peut autrement appliquer des réglages distants que ce composant ne contrôle pas. Aucun de ces réglages de compte n’est modifié par le code. Copier également dans `ads.txt` les lignes exactes données par Google si le compte le demande ; aucune ligne d’éditeur n’est inventée.

## CMP et consentement

Choisir et configurer une [CMP certifiée Google](https://support.google.com/adsense/answer/13554116?hl=en). La certification réelle de l’ID configuré doit être vérifiée dans la liste Google ; une URL HTTPS ne prouve pas une certification.

Le composant `AdsConsent` charge uniquement le script de la CMP choisie et écoute `__tcfapi('addEventListener', 2, ...)`. Il ne fabrique ni bannière ni consentement. Le fournisseur doit exposer son API TCF lors du chargement du script ; si son bootstrap est différé, son intégration peut émettre `window.dispatchEvent(new Event('lc:cmp-ready'))` après installation de l’API. Une CMP demandant d’autres attributs ou un bootstrap propriétaire doit être raccordée selon son propre code officiel avant activation. L’absence d’API laisse AdSense bloqué.

Le contrôle local est volontairement conservateur partout dans le monde : état CMP chargé, événement `tcloaded` ou `useractioncomplete`, ID attendu, chaîne TC présente, politique TCF 5 ou ultérieure, Google Advertising Products (vendeur 755) divulgué et consenti ; consentements aux finalités 1, 3, 4, et consentement ou intérêt légitime valable pour 2, 7, 9, 10. Les restrictions de l’éditeur sont respectées. `gdprApplies=false` seul ne vaut jamais accord. Les chaînes TCF 2.3 sont désormais nécessaires pour les nouveaux consentements. [Exigences Google TCF](https://support.google.com/adsense/answer/9804260?hl=en), [API IAB](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md).

Refus, attente, erreur ou révocation : aucun nouveau chargement publicitaire. Une révocation retire les unités et empêche leur nouvelle demande pendant cette navigation, même si un consentement est ensuite réaccordé. Un script déjà téléchargé ne peut pas être « désexécuté » : Google reçoit aussi les mises à jour TCF ; l’intégration bloque ses propres demandes et retire les iframes. La CMP doit fournir son accès permanent au changement des préférences.

## Dimensions et lecture

| Emplacement                                 | Dimensions demandées                                 |
| ------------------------------------------- | ---------------------------------------------------- |
| Article                                     | 300 × 250 ; 250 × 250 si moins de 300 px disponibles |
| Accueil / listes, ordinateur                | 728 × 90 si la colonne dispose de 728 px             |
| Accueil / listes, mobile ou colonne étroite | 320 × 100 ; 250 × 100 si moins de 320 px disponibles |
| Colonne de moins de 250 px                  | Aucune demande                                       |

Un écran de 320 px avec 16 px de marge de chaque côté dispose de 288 px : le format de repli mesure 250 px de large, sans débordement. Les dimensions critiques sont dans un `<style nonce>` inline et suivent la largeur du conteneur. Le `<ins>` n’est pas remonté au redimensionnement. Ce sont des unités responsives à dimensions CSS explicites, conformément aux [adaptations documentées](https://support.google.com/adsense/answer/9183363) ; le petit rectangle 250 × 100 peut avoir moins d’inventaire. [Limites dimensionnelles](https://support.google.com/adsense/answer/9185043?hl=en).

Chaque unité porte « Publicité » et une fermeture de 44 × 44 px, extérieure à l’iframe et séparée de son contenu. La fermeture réutilise le stockage interne pendant 24 heures et passe le focus au prochain contrôle sans défilement. Aucun rendu avant lecture des fermetures et accord CMP.

Une seule initialisation `adsbygoogle.push({})` par unité/navigation, aucun intervalle ni rotation AdSense. Les règles internes de rotation ne s’appliquent pas à cette régie. [Code d’intégration](https://support.google.com/adsense/answer/9190028?hl=en), [interdiction du rafraîchissement automatique éditeur](https://support.google.com/adsense/answer/1346295?hl=en).

Une unité `data-ad-status="unfilled"` garde sa hauteur tant qu’elle est visible, puis se replie entièrement hors écran. Si elle passe au-dessus, le composant conserve l’ancre de lecture pour éviter le saut. Le même repli s’applique à une erreur du script. Une unité remplie n’est jamais remplacée pour provoquer une nouvelle demande. [Gestion officielle des unités vides](https://support.google.com/adsense/answer/10762946?hl=en).

Le composant n’ajoute pas lui-même de position sticky. Si la colonne article est sticky, elle doit rester réservée à l’ordinateur, sans recouvrement, avec une seule publicité visible de 300 px de large maximum. Mobile : flux normal sous le texte. [Contraintes sticky](https://support.google.com/adsense/answer/10734935?hl=en).

## CSP et vérification

Une configuration complète, présente dès le build, active un nonce aléatoire par requête dans `proxy.ts`, transmis à Next, aux préférences, JSON-LD, CMP et AdSense. Le rendu HTML devient dynamique uniquement dans ce cas. Le cache hors ligne exclut les documents à nonce ou `no-store`. Les modes `campaigns`, `off` et `preview`, ainsi qu’une configuration AdSense incomplète, conservent la politique interne sans script publicitaire tiers.

La CSP AdSense utilise `nonce` et `strict-dynamic`, avec `unsafe-eval` même en production comme dans le guide Google ; les ressources publicitaires utilisent HTTPS, car Google ne maintient pas une liste fixe de domaines compatible. Les styles/polices de la CMP sont limités à ses origines configurées. La politique interne réserve `unsafe-eval` au développement. [CSP officiellement supportée](https://support.google.com/adsense/answer/16283098?hl=en).

Avec cette configuration dynamique, `bun run budget` démarre brièvement le serveur local du build sur `127.0.0.1`, avec `AUDIENCE_DISABLED=1`, puis mesure le HTML de l’accueil et d’un article réellement lié, ainsi que les ressources propriétaires référencées dans `.next` et `public`. Il conserve les plafonds existants, sans exécuter de scripts ni simuler un consentement. Le périmètre **« budget propriétaire avant consentement » exclut tous les téléchargements Google et CMP**, y compris le script CMP chargé avant le choix du lecteur. Le poids des ressources tierces doit être mesuré séparément dans un navigateur avec la configuration réelle ; une réussite de ce contrôle local ne garantit donc pas le poids complet de la page avec régie.

Tests purs : `bun test tests/adsense-*.test.ts` couvre la configuration, la politique de consentement TCF, la CSP et l’exclusion du cache hors ligne. Le nonce unique par requête et l’hydratation en production demandent aussi une vérification sur le build servi. Les validations réseau, rendu rempli/vide et révocation doivent utiliser des interceptions locales tant qu’aucun compte autorisé n’est fourni. Une validation finale avec la vraie CMP et les vraies unités reste nécessaire avant publication ; aucun revenu, taux de remplissage ni budget de poids des ressources Google n’est garanti par la vérification locale.
