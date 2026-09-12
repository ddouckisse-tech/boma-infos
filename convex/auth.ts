import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { twoFactor } from "better-auth/plugins";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

/**
 * Public site URL, used by Better Auth to build absolute callback URLs.
 * Set `SITE_URL` on the Convex deployment (`npx convex env set SITE_URL ...`).
 */
const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

/** Backend handle on the Better Auth Convex component. */
export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Better Auth instance, rebuilt per Convex request context.
 *
 * Milestone 3 turns the milestone-1 plumbing into the real thing: passwords,
 * TOTP second factor, database-backed rate limiting and revocable sessions
 * (CAHIER-DES-CHARGES.md §4.3, §5.3).
 *
 * ## What is deliberately *not* here
 *
 * There is no default account. The audit found the legacy WordPress
 * advertising an `admin` login through its own REST API; this deployment
 * ships with an empty user table and `scripts/create-account.ts` is the only
 * way to make the first one, with a nominative address and a password chosen
 * at that moment.
 *
 * Sign-up is enabled at the library level because the company registration
 * of §4.4 has to create an account — but the browser cannot reach it:
 * `app/api/auth/[...all]/route.ts` refuses `sign-up/*` outright. Registration
 * goes through a server action that answers the same sentence whether or not
 * the address was already known, so the form is not an account oracle either.
 */
export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    // Sans secret explicite, Better Auth en dérive un et le chiffrement du
    // secret TOTP ne survit pas à un redéploiement.
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      // Plancher des mots de passe PROVISOIRES, que seule la ligne de
      // commande pose (`scripts/create-account.ts`). La règle des douze
      // caractères du §4.3 vaut pour tout mot de passe définitif : elle est
      // tenue dans `hooks.before` ci-dessous et dans `registerCompany`.
      minPasswordLength: 6,
      maxPasswordLength: 128,
      // Aucun courriel n'est encore expédié (aucun prestataire n'est câblé) :
      // exiger une vérification ici enfermerait tout le monde dehors.
      requireEmailVerification: false,
      autoSignIn: false,
      /**
       * Le lien de réinitialisation part dans la corbeille de sortie
       * (`notifications`), lisible depuis le back-office. Personne ne
       * prétend qu'un courriel est parti : il est composé, daté, et un
       * administrateur le transmet. Le formulaire public, lui, répond la
       * même phrase que l'adresse existe ou non (§5.3).
       */
      sendResetPassword: async ({ user, url }) => {
        if (!("runMutation" in ctx)) return;
        await ctx.runMutation(internal.notifications.queueRaw, {
          channel: "email",
          to: user.email,
          subject: "Le Corporate — réinitialisation de votre mot de passe",
          body:
            `Bonjour,\n\nUne réinitialisation de mot de passe a été demandée ` +
            `pour ce compte. Le lien ci-dessous est valable une heure et ne ` +
            `sert qu'une fois.\n\n${url}\n\nSi vous n'êtes pas à l'origine ` +
            `de cette demande, ignorez ce message : rien n'a changé.\n\n` +
            `La rédaction du Corporate`,
        });
      },
    },
    session: {
      // Une semaine, prolongée d'un jour à chaque visite. Les sessions sont
      // révocables une par une et toutes à la fois depuis /compte.
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    // CDC §5.3 : « aucune limitation de débit » était un défaut relevé.
    // Le stockage en base est le seul qui tienne sur plusieurs instances.
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 30,
      customRules: {
        // La connexion est la porte qu'on force. Dix essais par minute et
        // par IP, quelle que soit l'adresse visée — et non cinq : la
        // rédaction de Libreville sort par une seule adresse publique, un
        // quota trop serré enfermerait dehors les collègues d'une personne
        // qui se trompe de mot de passe.
        "/sign-in/email": { window: 60, max: 10 },
        "/two-factor/verify-totp": { window: 60, max: 5 },
        "/two-factor/verify-backup-code": { window: 60, max: 5 },
        "/forget-password": { window: 300, max: 3 },
        "/reset-password": { window: 300, max: 5 },
      },
    },
    hooks: {
      /**
       * CDC §4.3, côté serveur : douze caractères sur les deux chemins où
       * un titulaire choisit lui-même son mot de passe. Le formulaire le dit
       * aussi, mais le formulaire n'est pas une garantie.
       */
      before: createAuthMiddleware(async (hook) => {
        if (
          hook.path !== "/change-password" &&
          hook.path !== "/reset-password"
        ) {
          return;
        }
        const next = (hook.body as { newPassword?: unknown } | undefined)
          ?.newPassword;
        if (typeof next !== "string" || next.length < 12) {
          throw new APIError("BAD_REQUEST", {
            message: "Le mot de passe doit compter au moins douze caractères.",
          });
        }
      }),
      /**
       * Un mot de passe définitif vient d'être choisi : le drapeau
       * `mustChangePassword` du profil tombe. C'est la couche d'authentification
       * qui le dit, pas le navigateur.
       */
      after: createAuthMiddleware(async (hook) => {
        if (hook.path !== "/change-password") return;
        const subject = hook.context.session?.user.id;
        if (!subject || !("runMutation" in ctx)) return;
        await ctx.runMutation(internal.accounts.clearPasswordChange, {
          subject,
        });
      }),
    },
    plugins: [
      twoFactor({
        issuer: "Le Corporate",
        totpOptions: { digits: 6, period: 30 },
        // Dix codes de secours : perdre son téléphone ne doit pas couper
        // la rédaction de son back-office un soir de bouclage.
        backupCodeOptions: { amount: 10, length: 10 },
      }),
      /**
       * `better-auth` est épinglé à **1.6.21**, et pas au dernier 1.6.x.
       *
       * À partir de 1.6.22 le greffon `twoFactor` ajoute un compteur de
       * verrouillage de compte (`failedVerificationCount`, `lockedUntil`)
       * dans sa table ; le schéma du composant
       * `@convex-dev/better-auth@0.12.5` — le dernier publié — ne connaît
       * pas ces deux colonnes, et la valeur par défaut du compteur est
       * écrite **à la création**, quelle que soit l'option
       * `accountLockout`. L'activation du second facteur échouait donc sur
       * un `ArgumentValidationError` du composant lui-même.
       *
       * Ce qui est perdu est remplacé, pas supprimé : la force brute sur le
       * second facteur reste couverte par la limitation de débit déclarée
       * plus haut — cinq tentatives par minute sur `/two-factor/verify-totp`
       * comme sur les codes de secours. À lever dès que le composant
       * rattrape le schéma amont.
       */
      convex({ authConfig }),
    ],
  });
