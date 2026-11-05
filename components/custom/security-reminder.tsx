"use client";

import { useId, useState } from "react";
import { useMutation } from "convex/react";
import { KeyRound, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ActionButton } from "@/components/custom/action-button";
import { Modal } from "@/components/custom/modal";
import { PasswordChangeForm } from "@/components/custom/password-change-form";
import { usePreferences } from "@/components/providers/preferences-provider";
import { humanError } from "@/lib/private";
import { localize } from "@/lib/i18n";
import type { Viewer } from "@/lib/viewer";
import { toast } from "sonner";

/** How long a closed reminder stays closed while the code is provisional. */
const SNOOZE_MS = 7 * 86_400_000;

/**
 * Floating security reminder — the client's request of 12/09/2026.
 *
 * Shown while the account still uses the provisional code an administrator
 * handed over. It is a suggestion, not a wall: the screen behind it works,
 * the card can be closed (for a week, on every device — the choice is
 * stored on the profile), and « Changer maintenant » opens the three rows
 * of six boxes right here, so the whole gesture takes thirty seconds and
 * never leaves the page. The same form lives in the settings and in
 * « Mon compte » for whoever prefers to come back to it.
 */
export function SecurityReminder({ viewer }: { viewer: Viewer }) {
  const dismiss = useMutation(api.accounts.dismissReminder);
  const { locale } = usePreferences();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  // L'heure est lue une fois, au montage : un rendu doit rester pur, et un
  // rappel qui apparaîtrait à la seconde près n'intéresse personne.
  const [mountedAt] = useState(() => Date.now());

  const snoozed =
    viewer.reminderDismissedAt !== undefined &&
    mountedAt - viewer.reminderDismissedAt < SNOOZE_MS;
  const due = viewer.passwordChangeRequired && !snoozed && !hidden;

  const close = async () => {
    setHidden(true);
    try {
      await dismiss({});
    } catch (error) {
      toast.error(humanError(error, locale));
    }
  };

  return (
    <>
      {due && (
        <aside
          aria-labelledby={titleId}
          className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 rounded-xl border border-warning-token/60 bg-card p-4 shadow-floating sm:inset-x-auto sm:right-6 sm:w-[24rem] lg:bottom-6"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-warning-token/15 text-warning-token"
            >
              <KeyRound className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p id={titleId} className="font-display type-h3">
                {localize(locale, {
                  fr: "Changez votre code d'accès",
                  en: "Change your access code",
                })}
              </p>
              <p className="mt-1 type-small text-muted-foreground">
                {localize(locale, {
                  fr: "Le code qui vous a été remis est provisoire. Choisissez six chiffres suivis d’une lettre, puis confirmez ce nouveau code.",
                  en: "The code you received is temporary. Choose six digits followed by one letter, then confirm the new code.",
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void close()}
              aria-label={localize(locale, {
                fr: "Fermer le rappel",
                en: "Close reminder",
              })}
              className="-me-1 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ActionButton type="button" onClick={() => setOpen(true)}>
              {localize(locale, { fr: "Changer maintenant", en: "Change now" })}
            </ActionButton>
            <ActionButton
              type="button"
              variant="ghost"
              onClick={() => void close()}
            >
              {localize(locale, { fr: "Plus tard", en: "Later" })}
            </ActionButton>
          </div>
        </aside>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label={localize(locale, {
          fr: "Changer le code d'accès",
          en: "Change access code",
        })}
        variant="panel"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border py-2 ps-5 pe-3">
          <h2 className="font-display type-h3">
            {localize(locale, {
              fr: "Changer le code d'accès",
              en: "Change access code",
            })}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={localize(locale, { fr: "Fermer", en: "Close" })}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="p-5">
          {open && (
            <PasswordChangeForm
              mode="pin"
              autoFocus
              onDone={() => setOpen(false)}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
