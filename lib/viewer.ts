import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

/**
 * The signed-in account as `accounts.me` describes it — one type for every
 * private screen, derived from the query so it can never drift from the
 * server's shape. Type-only imports: nothing here reaches the bundle.
 */
export type Viewer = NonNullable<FunctionReturnType<typeof api.accounts.me>>;

/** First name, for a greeting; the whole name when there is only one word. */
export const firstNameOf = (name: string): string =>
  name.trim().split(/\s+/)[0] ?? name;

/** Two letters for an avatar: initials of the first two words. */
export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
