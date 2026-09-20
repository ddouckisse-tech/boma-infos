"use client";

import { useState } from "react";
import { AuthShell } from "@/components/custom/auth-shell";
import { CompanyRegistrationForm } from "@/components/custom/company-registration-form";
import { usePreferences } from "@/components/providers/preferences-provider";
import { localize } from "@/lib/i18n";

/**
 * Company registration, as a full page — CDC §4.4 step 1.
 *
 * The masthead opens the same form in a floating card; this route stays the
 * canonical address, reachable without JavaScript and linkable from anywhere
 * — a press kit, an e-mail, a partner's site.
 *
 * The form lives in `CompanyRegistrationForm` and tells this frame when the
 * request has gone through, so the heading stops asking for something that
 * has already been sent.
 */
export default function CompanyRegistrationPage() {
  const { locale } = usePreferences();
  const [done, setDone] = useState(false);

  return (
    <AuthShell
      title={
        done
          ? localize(locale, {
              fr: "Demande enregistrée",
              en: "Request received",
            })
          : localize(locale, {
              fr: "Ouvrir un espace entreprise",
              en: "Create a company space",
            })
      }
      intro={
        done
          ? undefined
          : localize(locale, {
              fr: "Déposez vos communiqués, nominations, résultats et annonces d'événements. La rédaction garde la main éditoriale : tout contenu partenaire est publié avec la mention « Contenu partenaire ».",
              en: "Submit press releases, appointments, results and event announcements. The newsroom retains editorial control: all partner content is published with the ‘Partner content’ label.",
            })
      }
    >
      <CompanyRegistrationForm onDone={() => setDone(true)} />
    </AuthShell>
  );
}
