/**
 * Creates a nominative account — CDC §4.3, §5.3.
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
 * Roles: administrateur · editeur · entreprise · lecteur.
 * An Administrateur or an Éditeur can do nothing at all until they have
 * enrolled a second factor from `/compte` — that is enforced in Convex, not
 * here.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ROLES = ["administrateur", "editeur", "entreprise", "lecteur"];

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  try {
    const file = readFileSync(path.join(ROOT, ".env.local"), "utf8");
    const match = new RegExp(`^${name}=(.*)$`, "m").exec(file);
    return match?.[1]?.trim().split(" #")[0]?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function arg(name: string): string | undefined {
  const entry = process.argv
    .slice(2)
    .find((item) => item.startsWith(`--${name}=`));
  return entry?.slice(name.length + 3);
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
if (password.length < 12) {
  console.error("Le mot de passe doit compter au moins douze caractères.");
  process.exit(1);
}

const siteUrl = env("NEXT_PUBLIC_CONVEX_SITE_URL");
if (!siteUrl) {
  console.error(
    "NEXT_PUBLIC_CONVEX_SITE_URL est absent : exécutez `bunx convex dev --once` d'abord."
  );
  process.exit(1);
}

const response = await fetch(`${siteUrl}/api/auth/sign-up/email`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password, name }),
});

if (!response.ok) {
  const detail = await response.text();
  // Un compte déjà présent n'est pas une erreur : on rattache le profil.
  if (!/already exists|USER_ALREADY_EXISTS/i.test(detail)) {
    console.error(
      `Création du compte refusée (${response.status}) : ${detail}`
    );
    process.exit(1);
  }
  console.log("Compte déjà existant — mise à jour du profil applicatif.");
}

const result = spawnSync(
  "bunx",
  [
    "convex",
    "run",
    "accounts:bootstrapProfile",
    JSON.stringify({ email, roleSlug: role, displayName: name, authorSlug }),
  ],
  { cwd: ROOT, stdio: "inherit" }
);

if (result.status !== 0) process.exit(result.status ?? 1);

console.log(`\n✓ ${name} <${email}> — rôle « ${role} ».`);
if (role === "administrateur" || role === "editeur") {
  console.log(
    "  La double authentification est obligatoire : connectez-vous puis activez-la sur /compte.\n" +
      "  Tant qu'elle n'est pas posée, le serveur refuse toute action de ce compte."
  );
}
