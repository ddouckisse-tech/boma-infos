# Le Corporate — refonte applicative

Magazine économique gabonais édité par **Up Concept**. Ce dépôt remplace le
WordPress historique (WP 6.3.10 / Elementor / thème Newzin).

Document de référence : [`CAHIER-DES-CHARGES.md`](./CAHIER-DES-CHARGES.md).
Prompts d'implémentation par lot : [`prompts/`](./prompts).
Audit de l'existant : [`audit-le-corporate/`](./audit-le-corporate).

**État : lot 1 livré — socle applicatif et design system.** Ni modèle de
contenu, ni page d'article, ni authentification fonctionnelle, ni agent :
ceux-ci relèvent des lots 2 et 3.

---

## Démarrage

Prérequis : Node ≥ 20, [bun](https://bun.sh) (gestionnaire de paquets imposé).

```bash
bun install

# 1. Déploiement Convex de développement, local et anonyme (non interactif).
#    Écrit CONVEX_DEPLOYMENT / NEXT_PUBLIC_CONVEX_URL / NEXT_PUBLIC_CONVEX_SITE_URL
#    dans .env.local et génère convex/_generated/.
CONVEX_AGENT_MODE=anonymous bunx convex dev --once

# 2. Variable d'environnement attendue par Better Auth, posée SUR le
#    déploiement Convex (pas dans .env.local) :
CONVEX_AGENT_MODE=anonymous bunx convex env set SITE_URL http://localhost:3000

# 3. Serveur de développement Next.js
bun run dev            # http://localhost:3000
```

> **Le backend Convex local ne survit pas à `--once`.** Pour que la requête
> de santé du pied de page et les routes `/api/auth/*` répondent, il faut un
> `convex dev` qui tourne en parallèle du serveur Next :
>
> ```bash
> # soit deux terminaux :
> CONVEX_AGENT_MODE=anonymous bun run convex:dev   # terminal 1
> bun run dev                                      # terminal 2
>
> # soit un seul, Convex démarrant Next lui-même :
> CONVEX_AGENT_MODE=anonymous bun run dev:full
> ```
>
> Sans lui, l'application s'affiche normalement : le pied de page indique
> « Connexion à Convex… » au lieu de « Convex connecté ».

Pour rattacher le projet à un compte Convex cloud plutôt qu'au déploiement
local anonyme : `bunx convex dev --configure=new --project le-corporate`
(interactif, demande l'équipe). **Ne jamais lancer `convex deploy`** sans
demande explicite.

### Scripts

| Script               | Effet                                        |
| -------------------- | -------------------------------------------- |
| `bun run dev`        | Serveur de développement Next.js (port 3000) |
| `bun run build`      | Compilation de production                    |
| `bun run start`      | Serveur de production                        |
| `bun run typecheck`  | `next typegen` puis `tsc --noEmit`           |
| `bun run lint`       | ESLint                                       |
| `bun run format`     | Prettier (écriture)                          |
| `bun run verify`     | typecheck + lint + build                     |
| `bun run convex:dev` | Backend Convex local, en veille              |
| `bun run dev:full`   | Convex + Next dans un seul processus         |

`.claude/launch.json` déclare la configuration `dev` pour démarrer le serveur
en un appel depuis l'outillage.

---

## Variables d'environnement

`.env.local` est généré par `convex dev` et **n'est pas versionné**. Le
gabarit versionné est [`.env.example`](./.env.example).

| Variable                      | Où                            | Rôle                                           |
| ----------------------------- | ----------------------------- | ---------------------------------------------- |
| `CONVEX_DEPLOYMENT`           | `.env.local`                  | Déploiement visé par la CLI Convex             |
| `NEXT_PUBLIC_CONVEX_URL`      | `.env.local`                  | URL client du déploiement (WebSocket + HTTP)   |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `.env.local`                  | URL des actions HTTP (routes Better Auth)      |
| `SITE_URL`                    | **sur le déploiement Convex** | URL publique du site, utilisée par Better Auth |

Les deux URL Convex sont automatiquement autorisées dans la directive
`connect-src` de la politique de sécurité du contenu (voir
`lib/security-headers.ts`).

---

## Structure

```
app/
  layout.tsx                   racine : lang="fr-FR", polices, providers, en-tête, pied
  page.tsx                     accueil du lot 1
  not-found.tsx                404 soignée
  globals.css                  TOUS les jetons de design (couleurs, typo, espacements)
  design-system/               galerie /design-system (référence visuelle de l'équipe)
  rubrique/[...segments]/      pages de rubrique et de sous-rubrique (gabarit, lot 2)
components/
  ui/                          primitives shadcn/ui — JAMAIS modifiées
  custom/                      compositions maison (Header, Footer, ThemeToggle…)
  providers/                   PreferencesProvider, ConvexClientProvider
convex/
  schema.ts                    schéma applicatif (vide au lot 1)
  auth.ts / auth.config.ts     Better Auth branché sur Convex
  http.ts                      routes HTTP de Better Auth
  health.ts                    requête réactive de contrôle de connexion
lib/
  navigation.ts                les 8 rubriques du CDC §4.1 et leurs sous-rubriques
  design-tokens.ts             catalogue des jetons affiché par /design-system
  preferences*.ts              thème (clair/sombre/système) et économie de données
  security-headers.ts          TOUS les en-têtes de sécurité, CSP comprise
  auth-client.ts / auth-server.ts  better-auth côté navigateur et côté serveur
next.config.ts                 applique les en-têtes + formats d'images
```

### Conventions

- **Code en anglais, interface en français.** Toute chaîne visible est en
  français, sans exception.
- TypeScript strict, jamais de `any` non justifié par un commentaire.
- `components/ui/` (shadcn) n'est jamais modifié : toute personnalisation
  passe par composition dans `components/custom/`.
- Formulaires : React Hook Form + Zod. Notifications : sonner. Icônes :
  lucide-react.
- Aucune librairie d'animation. Rayons plafonnés à 16 px. Pas d'ombre
  diffuse en dehors des éléments réellement flottants.

---

## Design system

La page [`/design-system`](http://localhost:3000/design-system) présente la
palette complète en clair et en sombre, l'échelle typographique, les
espacements, les formes et tous les composants dans chacun de leurs états.
Elle n'est pas indexée (`robots: noindex`).

Source de vérité des jetons : `app/globals.css`. `lib/design-tokens.ts` en est
un miroir destiné à l'affichage ; garder les deux synchronisés.

### Palette (cahier des charges v1.1)

Les deux couleurs de marque sont inchangées — navy `#002060`, magenta
`#C74794` — mais **les fonds et l'encre sont neutres**, plus bleutés :

|                | Clair               | Sombre              |
| -------------- | ------------------- | ------------------- |
| Fond de page   | `#FFFFFF`           | `#121212`           |
| Surface douce  | `#F5F5F5`           | `#1F1F1F`           |
| Carte          | `#FFFFFF`           | `#171717`           |
| Texte          | `#1A1A1A` (17,40:1) | `#EDEDED` (16,00:1) |
| Texte atténué  | `#525252` (7,81:1)  | `#A3A3A3` (7,43:1)  |
| Accent textuel | `#B83D85` (5,19:1)  | `#E06BAD` (6,13:1)  |

Deux règles à ne pas enfreindre :

- **`#C74794` ne porte jamais de texte courant** — 4,41:1 sur blanc, 4,05:1
  sur `#F5F5F5`, sous le seuil AA. Il sert aux aplats, filets, fonds de badge
  et titres larges. Le magenta textuel est `--brand-magenta-600` `#B83D85`.
- **Le navy `#002060` est proscrit en thème sombre** — 1,23:1 sur `#121212`.
  Les titres y passent à `--foreground`, l'action primaire à navy-300
  `#A2BFF1` (10,04:1).

Les ratios mesurés sont affichés dans la section « Accessibilité » de
`/design-system`.

---

## Sécurité

En-têtes posés par `next.config.ts` : HSTS (`max-age=31536000;
includeSubDomains; preload`), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` restrictive, `Cross-Origin-Opener-Policy`,
`Cross-Origin-Resource-Policy`, `X-DNS-Prefetch-Control: off`.

La `Content-Security-Policy` vit dans `lib/security-headers.ts` :

```
default-src 'self'; base-uri 'none'; object-src 'none';
frame-ancestors 'none'; frame-src 'none'; form-action 'self';
script-src 'self' 'unsafe-inline'; script-src-attr 'none';
style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;
font-src 'self'; media-src 'self'; worker-src 'self' blob:;
manifest-src 'self'; connect-src 'self' <URL Convex>;
upgrade-insecure-requests
```

`'unsafe-eval'` est ajouté **en développement seulement** (rechargement à
chaud de Turbopack) ; `upgrade-insecure-requests` n'apparaît qu'en
production.

**Pourquoi `'unsafe-inline'` sur `script-src`.** Next.js sérialise la charge
utile React Server Components dans des `<script>` en ligne dont le contenu
change à chaque rendu. Les autoriser autrement impose un nonce par requête,
ce qui **désactive le rendu statique de toutes les pages** — inacceptable au
regard du budget de performance du §5.4. La variante à nonce +
`strict-dynamic` a été implémentée puis retirée : elle bloquait
effectivement l'hydratation sur les pages prérendues. Tout le reste reste
verrouillé : aucune origine tierce, aucun gestionnaire d'événement en ligne
(`script-src-attr 'none'`), pas d'`eval` en production, `base-uri` et
`form-action` fermés.

**À revoir au lot 3** : les espaces privés sont rendus dynamiquement par
nature ; ces routes-là pourront passer à un nonce sans coûter le cache.
