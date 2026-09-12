/**
 * Creates — or re-keys — a nominative account — CDC §4.3, §5.3.
 *
 *   bun run compte -- --email=… --nom="…" --motdepasse=… --role=administrateur
 *
 * This is the **only** way to make the first account, and it is deliberately
 * a command line rather than a screen: the audit's first finding was a
 * WordPress advertising a default `admin` login through its own REST API.
 * Nothing ships with a pre-made account, the browser cannot reach
 * `POST /api/auth/sign-up/*` (`app/api/auth/[...all]/route.ts` closes it),
 * and the password is chosen here, at creation time.
 *
 * Run again on a known address, it replaces the password and revokes every
 * open session. Under twelve characters the password is PROVISIONAL: the
 * server refuses any privileged action until the holder replaces it from
 * `/compte` (§4.3).
 *
 * Everything goes through `accounts:ensureAccount`, a Convex action. No HTTP
 * sign-up is parsed here: Better Auth answers a sign-up for a known address
 * exactly as it answers a new one (no account enumeration), so a response
 * cannot tell the two apart — the action looks the account up itself.
 *
 * Roles: administrateur · editeur · entreprise · lecteur.
 * An Administrateur or an Éditeur can do nothing at all until they have
 * enrolled a second factor from `/compte` — that is enforced in Convex, not
 * here.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ROLES = ["administrateur", "editeur", "entreprise", "lecteur"];

function arg(name: string): string | undefined {
  const entry = process.argv
    .slice(2)
    .find((item) => item.startsWith(`--${name}=`));
  return entry?.slice(name.length + 3);
}

/** Runs a Convex function as the developer; stops the script if it fails. */
function run(fn: string, args: Record<string, unknown>) {
  const result = spawnSync(
    "bunx",
    ["convex", "run", fn, JSON.stringify(args)],
    {
      cwd: ROOT,
      stdio: "inherit",
    }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const email = arg("email");
const name = arg("nom");
const password = arg("motdepasse");
const role = arg("role") ?? "editeur";
const authorSlug = arg("signature");

if (!email || !name || !password) {
  console.error(
    'Usage : bun run compte -- --email=… --nom="…" --motdepasse=… [--role=administrateur] [--signature=slug]'
  );
  process.exit(1);
}
if (!ROLES.includes(role)) {
  console.error(`Rôle inconnu « ${role} ». Attendu : ${ROLES.join(", ")}.`);
  process.exit(1);
}
if (password.length < 6) {
  console.error("Le mot de passe doit compter au moins six caractères.");
  process.exit(1);
}
// En dessous de douze caractères (§4.3), le mot de passe est PROVISOIRE :
// le serveur refusera toute action du compte tant qu'il n'est pas remplacé.
const provisional = password.length < 12;

run("accounts:ensureAccount", { email, name, password });
run("accounts:bootstrapProfile", {
  email,
  roleSlug: role,
  displayName: name,
  authorSlug,
  provisionalPassword: provisional,
});

console.log(`\n✓ ${name} <${email}> — rôle « ${role} ».`);
if (provisional) {
  console.log(
    "  Mot de passe PROVISOIRE : à remplacer à la première connexion, depuis /compte\n" +
      "  (douze caractères au minimum). Tant qu'il ne l'est pas, le serveur refuse toute action."
  );
}
if (role === "administrateur" || role === "editeur") {
  console.log(
    "  La double authentification est obligatoire : connectez-vous puis activez-la sur /compte.\n" +
      "  Tant qu'elle n'est pas posée, le serveur refuse toute action de ce compte."
  );
}
