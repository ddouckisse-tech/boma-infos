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
 * open session. Under twelve characters the code is PROVISIONAL: the
 * interface reminds the holder to choose their own six-digit code (nothing
 * is refused meanwhile — client decision of 12/09/2026).
 *
 * Everything goes through `accounts:ensureAccount`, a Convex action. No HTTP
 * sign-up is parsed here: Better Auth answers a sign-up for a known address
 * exactly as it answers a new one (no account enumeration), so a response
 * cannot tell the two apart — the action looks the account up itself.
 *
 * Revocation, the counterpart of creation:
 *
 *   bun run compte -- --email=… --revoquer
 *
 * deactivates the profile, closes every open session and writes the gesture
 * to the audit log as the command line (`accounts:revokeByEmail`).
 *
 * Roles: administrateur · editeur · entreprise · lecteur.
 * The verification by authenticator app is optional for every role.
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

if (process.argv.includes("--revoquer")) {
  if (!email) {
    console.error("Usage : bun run compte -- --email=… --revoquer");
    process.exit(1);
  }
  run("accounts:revokeByEmail", { email });
  process.exit(0);
}

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
if (!/^\d{6}$/.test(password) && password.length < 12) {
  console.error(
    "Le mot de passe doit être un code à six chiffres, ou compter au moins douze caractères."
  );
  process.exit(1);
}
// Un code remis par un tiers est PROVISOIRE : l'interface rappelle à la
// personne de choisir le sien. Rien n'est refusé entre-temps (12/09/2026).
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
    "  Code PROVISOIRE : un rappel invite la personne à choisir son propre code à six chiffres\n" +
      "  depuis « Mon compte » ou « Réglages ». Rien n'est bloqué entre-temps."
  );
}
