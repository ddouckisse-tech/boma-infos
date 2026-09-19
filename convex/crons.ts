import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Scheduled jobs — CDC §4.6: "Utilise l'ordonnanceur Convex pour les
 * traitements différés (transcription, newsletter)."
 *
 * Both jobs *propose*. The newsletter lands as a draft that an
 * administrator has to approve, and articles due for publication are moved
 * by the same rule the newsroom applied when it scheduled them — nothing
 * here decides anything new.
 */

// Les identifiants de tâche planifiée doivent rester en ASCII : Convex les
// refuse accentués. Ce sont des clés techniques, pas de l'interface.
const crons = cronJobs();

/** Thursday 06:00 UTC — 07:00 in Libreville, before the working day. */
crons.weekly(
  "weekly newsletter",
  { dayOfWeek: "thursday", hourUTC: 6, minuteUTC: 0 },
  internal.agentRuntime.composeWeeklyNewsletter,
  {}
);

/**
 * Scheduled pieces (`status: "scheduled"`) whose date has passed go live.
 *
 * This is not an agent deciding to publish: a human set the status and the
 * date, and this only honours them. Every transition is written to the
 * audit trail with the actor "Ordonnanceur".
 */
crons.interval(
  "release scheduled articles",
  { minutes: 5 },
  internal.schedule.releaseDue,
  {}
);

/**
 * 02:30 UTC — rebuilds what the médiathèque derives from the other tables
 * (search text, alternative-text flag, which article shows which picture),
 * in bounded batches. Every writer keeps them up to date; this repairs what
 * a forgotten path or a manual edit in the dashboard would have left behind.
 */
crons.daily(
  "rebuild media index",
  { hourUTC: 2, minuteUTC: 30 },
  internal.library.reindex,
  {}
);

export default crons;
