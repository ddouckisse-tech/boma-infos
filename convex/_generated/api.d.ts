/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as advertising from "../advertising.js";
import type * as agentRuntime from "../agentRuntime.js";
import type * as agents from "../agents.js";
import type * as articleCounts from "../articleCounts.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as guard from "../guard.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as journal from "../journal.js";
import type * as library from "../library.js";
import type * as mediaManifest from "../mediaManifest.js";
import type * as mediaRenditions from "../mediaRenditions.js";
import type * as model_access from "../model/access.js";
import type * as model_advertising from "../model/advertising.js";
import type * as model_agentEngine from "../model/agentEngine.js";
import type * as model_agents from "../model/agents.js";
import type * as model_articleCounts from "../model/articleCounts.js";
import type * as model_articleWrites from "../model/articleWrites.js";
import type * as model_audience from "../model/audience.js";
import type * as model_audit from "../model/audit.js";
import type * as model_content from "../model/content.js";
import type * as model_media from "../model/media.js";
import type * as model_password from "../model/password.js";
import type * as model_text from "../model/text.js";
import type * as model_translation from "../model/translation.js";
import type * as model_watch from "../model/watch.js";
import type * as newsletter from "../newsletter.js";
import type * as newsletterDraft from "../newsletterDraft.js";
import type * as newsroom from "../newsroom.js";
import type * as notifications from "../notifications.js";
import type * as portal from "../portal.js";
import type * as schedule from "../schedule.js";
import type * as seed_articles1 from "../seed/articles1.js";
import type * as seed_articles2 from "../seed/articles2.js";
import type * as seed_articles3 from "../seed/articles3.js";
import type * as seed_articles4 from "../seed/articles4.js";
import type * as seed_catalog from "../seed/catalog.js";
import type * as seed_index from "../seed/index.js";
import type * as seed_people from "../seed/people.js";
import type * as seed_types from "../seed/types.js";
import type * as seeding from "../seeding.js";
import type * as settings from "../settings.js";
import type * as stats from "../stats.js";
import type * as taxonomy from "../taxonomy.js";
import type * as translation from "../translation.js";
import type * as translationWorker from "../translationWorker.js";
import type * as wordpressImport from "../wordpressImport.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  advertising: typeof advertising;
  agentRuntime: typeof agentRuntime;
  agents: typeof agents;
  articleCounts: typeof articleCounts;
  audit: typeof audit;
  auth: typeof auth;
  contact: typeof contact;
  crons: typeof crons;
  guard: typeof guard;
  health: typeof health;
  http: typeof http;
  journal: typeof journal;
  library: typeof library;
  mediaManifest: typeof mediaManifest;
  mediaRenditions: typeof mediaRenditions;
  "model/access": typeof model_access;
  "model/advertising": typeof model_advertising;
  "model/agentEngine": typeof model_agentEngine;
  "model/agents": typeof model_agents;
  "model/articleCounts": typeof model_articleCounts;
  "model/articleWrites": typeof model_articleWrites;
  "model/audience": typeof model_audience;
  "model/audit": typeof model_audit;
  "model/content": typeof model_content;
  "model/media": typeof model_media;
  "model/password": typeof model_password;
  "model/text": typeof model_text;
  "model/translation": typeof model_translation;
  "model/watch": typeof model_watch;
  newsletter: typeof newsletter;
  newsletterDraft: typeof newsletterDraft;
  newsroom: typeof newsroom;
  notifications: typeof notifications;
  portal: typeof portal;
  schedule: typeof schedule;
  "seed/articles1": typeof seed_articles1;
  "seed/articles2": typeof seed_articles2;
  "seed/articles3": typeof seed_articles3;
  "seed/articles4": typeof seed_articles4;
  "seed/catalog": typeof seed_catalog;
  "seed/index": typeof seed_index;
  "seed/people": typeof seed_people;
  "seed/types": typeof seed_types;
  seeding: typeof seeding;
  settings: typeof settings;
  stats: typeof stats;
  taxonomy: typeof taxonomy;
  translation: typeof translation;
  translationWorker: typeof translationWorker;
  wordpressImport: typeof wordpressImport;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
