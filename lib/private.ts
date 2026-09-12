/**
 * Vocabulary of the private areas — CDC §4.3, §4.4.
 *
 * Interface in French, code in English (house convention). Everything a
 * back-office or portal screen has to *name* lives here, so the same status
 * is never called two different things in two places.
 */

export type WorkflowStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "scheduled"
  | "published"
  | "rejected";

export const STATUS_LABEL: Record<WorkflowStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  in_review: "En revue",
  changes_requested: "Modifications demandées",
  scheduled: "Programmé",
  published: "Publié",
  rejected: "Refusé",
};

/** Tone of the pill. Never colour alone: the label always says the state. */
export const STATUS_TONE: Record<
  WorkflowStatus,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  draft: "neutral",
  submitted: "info",
  in_review: "info",
  changes_requested: "warning",
  scheduled: "info",
  published: "success",
  rejected: "danger",
};

export const SUBMISSION_KINDS = [
  { value: "communique", label: "Communiqué" },
  { value: "nomination", label: "Nomination" },
  { value: "resultats", label: "Résultats" },
  { value: "evenement", label: "Événement" },
  { value: "publi_redactionnel", label: "Publi-rédactionnel" },
] as const;

export const AUDIT_LABEL: Record<string, string> = {
  "article.create": "Article créé",
  "article.update": "Article modifié",
  "article.publish": "Article publié",
  "article.unpublish": "Article dépublié",
  "article.schedule": "Article programmé",
  "article.delete": "Article supprimé",
  "submission.review": "Dépôt — revue",
  "submission.reject": "Dépôt refusé",
  "submission.publish": "Dépôt publié",
  "organization.register": "Entreprise — demande d'inscription",
  "organization.approve": "Entreprise validée",
  "organization.reject": "Entreprise refusée",
  "user.create": "Compte créé",
  "user.role_change": "Changement de rôle",
  "user.deactivate": "Compte révoqué",
  "user.reactivate": "Compte réactivé",
  "category.create": "Rubrique créée",
  "category.update": "Rubrique modifiée",
  "category.delete": "Rubrique supprimée",
  "settings.update": "Réglages modifiés",
  "agent.toggle": "Agent activé ou désactivé",
  "agent.suggestion_accepted": "Suggestion d'agent acceptée",
  "agent.suggestion_rejected": "Suggestion d'agent rejetée",
  "media.update": "Média modifié",
  "media.upload": "Média ajouté",
  "media.delete": "Média supprimé",
  "newsletter.approve": "Newsletter validée",
};

/**
 * Server refusals, in French.
 *
 * The server sends a bare code and never explains *which* permission was
 * missing or whether the row exists (§5.3 — no enumeration). The interface
 * turns the code into a sentence; it does not add information the server
 * withheld.
 */
export const ACCESS_MESSAGE: Record<string, string> = {
  UNAUTHENTICATED: "Votre session a expiré. Reconnectez-vous.",
  NO_PROFILE:
    "Ce compte n'est rattaché à aucun profil. Contactez la rédaction.",
  SUSPENDED: "Ce compte a été révoqué.",
  TWO_FACTOR_REQUIRED:
    "Ce compte demande une vérification par application : activez-la depuis « Mon compte ».",
  PASSWORD_CHANGE_REQUIRED:
    "Votre code d'accès est provisoire : choisissez le vôtre depuis « Mon compte ».",
  FORBIDDEN: "Vous n'avez pas accès à cet élément.",
  ORGANIZATION_REQUIRED: "Aucune entreprise n'est rattachée à ce compte.",
  ORGANIZATION_PENDING:
    "Votre espace entreprise attend la validation d'un administrateur.",
};

const ACCESS_MESSAGE_EN: Record<string, string> = {
  UNAUTHENTICATED: "Your session has expired. Please sign in again.",
  NO_PROFILE: "This account is not linked to a profile. Contact the newsroom.",
  SUSPENDED: "This account has been revoked.",
  TWO_FACTOR_REQUIRED:
    "This account requires app verification. Enable it from My account.",
  PASSWORD_CHANGE_REQUIRED:
    "Your access code is temporary. Choose your own from My account.",
  FORBIDDEN: "You do not have access to this item.",
  ORGANIZATION_REQUIRED: "No company is linked to this account.",
  ORGANIZATION_PENDING: "Your company workspace is awaiting approval.",
};

const APPLICATION_MESSAGE_EN: Record<string, string> = {
  "Ce dépôt est en cours d'examen par la rédaction : il n'est plus modifiable.":
    "This submission is being reviewed and can no longer be edited.",
  "Ce dépôt a déjà été transmis.": "This submission has already been sent.",
  "Le titre est trop court.": "The title is too short.",
  "Le corps du dépôt doit compter au moins deux cents caractères.":
    "The submission body must contain at least two hundred characters.",
  "Le mot de passe doit compter au moins douze caractères.":
    "The password must contain at least twelve characters.",
};

/** Pulls a safe sentence out of a Convex error, whatever its shape. */
export function humanError(error: unknown, locale: "fr" | "en" = "fr"): string {
  const raw =
    typeof error === "object" && error !== null && "data" in error
      ? String((error as { data: unknown }).data ?? "")
      : "";
  if (raw && ACCESS_MESSAGE[raw]) {
    return locale === "en" ? ACCESS_MESSAGE_EN[raw] : ACCESS_MESSAGE[raw];
  }

  const message = error instanceof Error ? error.message : String(error ?? "");
  for (const [code, sentence] of Object.entries(ACCESS_MESSAGE)) {
    if (message.includes(code)) {
      return locale === "en" ? ACCESS_MESSAGE_EN[code] : sentence;
    }
  }
  // Convex préfixe les erreurs applicatives ; on ne montre que la phrase.
  const applicative = /Uncaught Error:\s*([^\n]+)/.exec(message);
  if (applicative) {
    const sentence = applicative[1].replace(/\s+at handler.*$/, "").trim();
    return locale === "en"
      ? (APPLICATION_MESSAGE_EN[sentence] ??
          "The operation could not be completed.")
      : sentence;
  }
  if (locale === "en") return "The operation could not be completed.";
  return message || "L'opération n'a pas abouti.";
}

/* -------------------------------------------------------------------------
   Formatting
   ------------------------------------------------------------------------- */

const dateTime = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateOnly = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export const formatDateTime = (value: number): string =>
  value > 0 ? dateTime.format(new Date(value)) : "—";

export const formatDate = (value: number): string =>
  value > 0 ? dateOnly.format(new Date(value)) : "—";

/** Micro-dollars → "0,0123 $". Anthropic bills in USD, so do we. */
export const formatCost = (micros: number): string =>
  `${(micros / 1_000_000).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })} $`;

export const formatNumber = (value: number): string =>
  value.toLocaleString("fr-FR");

export const formatDuration = (seconds: number): string => {
  if (seconds <= 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes} min ${rest} s` : `${rest} s`;
};

/** Textarea → blocks, the shape `convex/model/content.ts` expects. */
export function textToBlocks(
  text: string
): { type: "paragraph"; text: string }[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .map((part) => ({ type: "paragraph" as const, text: part }));
}

export function blocksToText(
  blocks: readonly { type: string; text?: string; items?: string[] }[]
): string {
  return blocks
    .map((block) =>
      block.type === "list"
        ? (block.items ?? []).map((item) => `- ${item}`).join("\n")
        : (block.text ?? "")
    )
    .filter((part) => part !== "")
    .join("\n\n");
}
