/**
 * Copies `ANTHROPIC_API_KEY` from `.env.local` onto the Convex deployment.
 *
 *   bun run agents:cle
 *
 * The seven agents run inside a Convex action (`convex/agentRuntime.ts`), so
 * the key has to live on the deployment, not in the Next.js process. One
 * variable, one name, read with `process.env.ANTHROPIC_API_KEY` in both
 * runtimes — this script only saves retyping it.
 *
 * With no key, the agents keep working from their offline stand-in and every
 * proposal is labelled "simulation". Setting the key is the only step needed
 * to switch to the real Claude API: no code changes.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

let key = process.env.ANTHROPIC_API_KEY ?? "";
if (!key) {
  try {
    const file = readFileSync(path.join(ROOT, ".env.local"), "utf8");
    key = /^ANTHROPIC_API_KEY=(.*)$/m.exec(file)?.[1]?.trim() ?? "";
  } catch {
    key = "";
  }
}

if (!key) {
  console.error(
    "ANTHROPIC_API_KEY est vide dans .env.local et dans l'environnement.\n" +
      "Les sept agents continuent de tourner en mode simulé, clairement\n" +
      "étiqueté dans le back-office. Renseignez la clé puis relancez\n" +
      "`bun run agents:cle` pour passer en réel."
  );
  process.exit(1);
}

const result = spawnSync(
  "bunx",
  ["convex", "env", "set", "ANTHROPIC_API_KEY", key],
  { cwd: ROOT, stdio: "inherit" }
);
process.exit(result.status ?? 0);
