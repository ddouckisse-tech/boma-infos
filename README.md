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

Pour travailler avec les fonctions Convex en rechargement continu, ouvrir un
second terminal : `CONVEX_AGENT_MODE=anonymous bun run convex:dev`.

Pour rattacher le projet à un compte Convex cloud plutôt qu'au déploiement
local anonyme : `bunx convex dev --configure=new --project le-corporate`
(interactif, demande l'équipe). **Ne jamais lancer `convex deploy`** sans
demande explicite.

### Scripts

| Script              | Effet                                        |
| ------------------- | -------------------------------------------- |
| `bun run dev`       | Serveur de développement Next.js (port 3000) |
| `bun run build`     | Compilation de production                    |
| `bun run start`     | Serveur de production                        |
| `bun run typecheck` | `next typegen` puis `tsc --noEmit`           |
| `bun run lint`      | ESLint                                       |
| `bun run format`    | Prettier (écriture)                          |
| `bun run verify`    | typecheck + lint + build                     |

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
`connect-src` de la politique de sécurité du contenu (voir `proxy.ts`).

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
  security-headers.ts          en-têtes de sécurité statiques
proxy.ts                       politique de sécurité du contenu (nonce par requête)
next.config.ts                 en-têtes de sécurité + formats d'images
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

---

## Sécurité

En-têtes posés par `next.config.ts` : HSTS (`max-age=31536000;
includeSubDomains; preload`), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` restrictive, `Cross-Origin-Opener-Policy`,
`Cross-Origin-Resource-Policy`, `X-DNS-Prefetch-Control: off`.

La `Content-Security-Policy` est construite par requête dans `proxy.ts` :

- **production** — `script-src 'self' 'nonce-…' 'sha256-…' 'strict-dynamic'`.
  Le seul script en ligne du projet (application du thème avant le premier
  rendu) est autorisé par son empreinte SHA-256, pas par `'unsafe-inline'`.
- **développement** — `'unsafe-inline'` et `'unsafe-eval'` sont ajoutés :
  le rechargement à chaud de Turbopack en a besoin. L'en-tête reste présent.

Toute modification du script de `lib/preferences.ts` change son empreinte :
elle est recalculée automatiquement, rien à mettre à jour à la main.
