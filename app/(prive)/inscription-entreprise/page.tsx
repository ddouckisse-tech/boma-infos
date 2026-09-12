"use client";

import { useState } from "react";
import { AuthShell } from "@/components/custom/auth-shell";
import { CompanyRegistrationForm } from "@/components/custom/company-registration-form";

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
  const [done, setDone] = useState(false);

  return (
    <AuthShell
      title={done ? "Demande enregistrée" : "Ouvrir un espace entreprise"}
      intro={
        done
          ? undefined
          : "Déposez vos communiqués, nominations, résultats et annonces d'événements. La rédaction garde la main éditoriale : tout contenu partenaire est publié avec la mention « Contenu partenaire »."
      }
    >
      <CompanyRegistrationForm onDone={() => setDone(true)} />
    </AuthShell>
  );
}
