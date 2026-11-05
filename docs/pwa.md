# Installation de BOMA Infos

La page `/installer`, accessible depuis le pied de page, décrit les parcours
Android et Safari sur iPhone/iPad. L’accueil propose aussi une invitation sur
mobile, avec fermeture pendant quatorze jours et repli en mémoire si le stockage
local est refusé. Le mode application autonome masque cette invitation.

Le bouton d’installation appelle la fenêtre native seulement après réception de
`beforeinstallprompt`, sur une action directe du lecteur. Chaque événement est
consommé une seule fois ; erreurs et refus donnent accès aux instructions. Une
acceptation est distinguée de l’événement `appinstalled`. Les publicités flottantes
sont suspendues pendant la fenêtre native. Sans API native, la page guide le
lecteur dans le menu du navigateur ; iOS utilise Partager puis Sur l’écran
d’accueil. Dans un navigateur intégré à une messagerie, le guide recommande
d’ouvrir la page dans Safari ou Chrome.

L’identité du manifeste reste `/?source=pwa`, identique à l’ancien `start_url`
implicite. Les icônes originales sont conservées : Android 192/512, maskable512 et
Apple180. Le service worker est enregistré en production, avec vérification de
mise à jour sans cache. Les navigations privées/API restent réseau seul. Le cache
hors ligne est limité aux pages publiques conservées sur cet appareil (40 pages
maximum) ; il ne rend pas tout le journal disponible hors connexion.

Les tests `tests/pwa-*.test.ts` couvrent plateformes, stockage, déroulement du
prompt, identités/icônes, stratégies réseau/cache et conservation des caches
étrangers. La confirmation sur un véritable Android/iPhone doit encore être
effectuée lorsque l’accès au navigateur et aux appareils est disponible.

Références : [déclenchement natif sur MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt),
[applications d’écran d’accueil iOS sur WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
