"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { Building2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ActionButton } from "@/components/custom/action-button";
import { FormError, FormNotice } from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { usePreferences } from "@/components/providers/preferences-provider";
import { antiRobot } from "@/lib/anti-robot";
import { localize } from "@/lib/i18n";

export const SECTORS = [
  "Banque et assurance",
  "Énergie et mines",
  "Bois et agro-industrie",
  "Transport et logistique",
  "Télécommunications",
  "BTP et immobilier",
  "Commerce et distribution",
  "Services et conseil",
  "Santé",
  "Administration et institutions",
  "Autre",
] as const;

const SECTOR_EN: Record<(typeof SECTORS)[number], string> = {
  "Banque et assurance": "Banking and insurance",
  "Énergie et mines": "Energy and mining",
  "Bois et agro-industrie": "Timber and agribusiness",
  "Transport et logistique": "Transport and logistics",
  Télécommunications: "Telecommunications",
  "BTP et immobilier": "Construction and real estate",
  "Commerce et distribution": "Retail and distribution",
  "Services et conseil": "Services and consulting",
  Santé: "Healthcare",
  "Administration et institutions": "Government and institutions",
  Autre: "Other",
};

const MINIMUM = 12;

/**
 * Company registration form — CDC §4.4 step 1.
 *
 * Extracted from the page so the full-page route and the floating card share
 * one implementation. The account is **not** opened here: the request is
 * recorded, an administrator validates it by hand, and only then does the
 * portal unlock — §4.4, "pas d'ouverture automatique".
 *
 * The form always says the same thing when it is done, whether or not the
 * address was already known (§5.3 — no account enumeration), and carries the
 * same honeypot-plus-dwell-time anti-robot as the public contact form rather
 * than a CAPTCHA that would tax every real visitor.
 *
 * `useAction` needs a Convex client in context. The page gets it from the
 * private layout; the floating card mounts its own provider inside the
 * lazily loaded chunk, so the public journal never pays for it (§5.4).
 */
export function CompanyRegistrationForm({
  onDone,
  onSwitchToSignIn,
  compact = false,
}: {
  /** Told when the request goes through, so the frame can retitle itself. */
  onDone?: () => void;
  /** In the floating card, swaps to sign-in instead of navigating. */
  onSwitchToSignIn?: () => void;
  /** In the floating card: the switch above already offers sign-in, and
   *  the eleven fields must fit a desktop screen without scrolling. */
  compact?: boolean;
}) {
  const register = useAction(api.accounts.registerCompany);
  const { locale } = usePreferences();
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const [form, setForm] = useState({
    name: "",
    sector: SECTORS[0],
    taxId: "",
    registrationId: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    whatsapp: "",
    password: "",
    confirmation: "",
    honeypot: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const set =
    (key: keyof typeof form) => (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.name.trim().length < 2) {
      setError(
        localize(locale, {
          fr: "Indiquez la raison sociale.",
          en: "Enter the registered company name.",
        })
      );
      return;
    }
    if (form.password.length < MINIMUM) {
      setError(
        localize(locale, {
          fr: `Le mot de passe doit compter au moins ${MINIMUM} caractères.`,
          en: `The password must be at least ${MINIMUM} characters long.`,
        })
      );
      return;
    }
    if (form.password !== form.confirmation) {
      setError(
        localize(locale, {
          fr: "Les deux saisies du mot de passe diffèrent.",
          en: "The two password entries do not match.",
        })
      );
      return;
    }
    setPending(true);
    try {
      await register({
        name: form.name,
        sector: form.sector,
        taxId: form.taxId || undefined,
        registrationId: form.registrationId || undefined,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone || undefined,
        whatsapp: form.whatsapp || undefined,
        password: form.password,
        honeypot: form.honeypot,
        openedAt: openedAt.current,
      });
      setDone(true);
      onDone?.();
    } catch {
      setError(
        localize(locale, {
          fr: "La demande n'a pas pu être transmise. Réessayez dans un instant.",
          en: "The request could not be sent. Please try again shortly.",
        })
      );
    }
    setPending(false);
  };

  if (done) {
    return (
      <>
        <FormNotice>
          {localize(locale, {
            fr: "Votre demande d’espace entreprise a été transmise à la rédaction. Un administrateur la valide manuellement : vous recevrez un message dès l’ouverture du compte. Aucun dépôt n’est possible avant cette validation.",
            en: "Your company-space request has been sent to the newsroom. An administrator reviews it manually: you will receive a message when the account is opened. You cannot submit content before approval.",
          })}
        </FormNotice>
        <p className="mt-4 type-small text-muted-foreground">
          <Link href="/" className="underline underline-offset-2">
            {localize(locale, {
              fr: "Retour au journal",
              en: "Back to the newspaper",
            })}
          </Link>
        </p>
      </>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={compact ? "@container grid gap-3" : "@container grid gap-4"}
    >
      <FormError>{error}</FormError>

      <div aria-hidden="true" className="sr-only">
        <label htmlFor="site_web">
          {localize(locale, { fr: "Ne pas remplir", en: "Leave blank" })}
        </label>
        <input
          id="site_web"
          name={antiRobot.honeypotField}
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={set("honeypot")}
        />
      </div>

      <div className="grid gap-4 @xl:grid-cols-2">
        <TextField
          label={localize(locale, {
            fr: "Raison sociale",
            en: "Registered company name",
          })}
          required
          autoComplete="organization"
          value={form.name}
          onChange={set("name")}
        />

        <div className="grid gap-2">
          <label htmlFor="secteur" className="type-small font-medium">
            {localize(locale, {
              fr: "Secteur d’activité",
              en: "Business sector",
            })}
            <span className="text-destructive">*</span>
          </label>
          <select
            id="secteur"
            required
            value={form.sector}
            onChange={set("sector")}
            className="h-11 w-full rounded-lg border border-input bg-background px-2.5 type-body text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {locale === "en" ? SECTOR_EN[sector] : sector}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 @md:grid-cols-2">
        <TextField
          label={localize(locale, {
            fr: "NIF (identification fiscale)",
            en: "Tax identification number",
          })}
          value={form.taxId}
          onChange={set("taxId")}
        />
        <TextField
          label={localize(locale, {
            fr: "RCCM (registre du commerce)",
            en: "Trade register number (RCCM)",
          })}
          value={form.registrationId}
          onChange={set("registrationId")}
        />
      </div>

      <div className="grid gap-4 @xl:grid-cols-2">
        <TextField
          label={localize(locale, {
            fr: "Contact — nom et prénom",
            en: "Contact — full name",
          })}
          required
          autoComplete="name"
          value={form.contactName}
          onChange={set("contactName")}
        />

        <TextField
          label={localize(locale, {
            fr: "Adresse électronique du contact",
            en: "Contact email address",
          })}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          hint={localize(locale, {
            fr: "C'est aussi l'identifiant de connexion.",
            en: "This is also the sign-in address.",
          })}
          value={form.contactEmail}
          onChange={set("contactEmail")}
        />
      </div>

      <div className="grid gap-4 @md:grid-cols-2">
        <TextField
          label={localize(locale, { fr: "Téléphone", en: "Phone" })}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={form.contactPhone}
          onChange={set("contactPhone")}
        />
        <TextField
          label="WhatsApp"
          type="tel"
          inputMode="tel"
          hint={localize(locale, {
            fr: "Reçoit aussi les changements de statut.",
            en: "Also receives status updates.",
          })}
          value={form.whatsapp}
          onChange={set("whatsapp")}
        />
      </div>

      <div className="grid gap-4 @xl:grid-cols-2">
        <TextField
          label={localize(locale, { fr: "Mot de passe", en: "Password" })}
          type="password"
          autoComplete="new-password"
          required
          minLength={MINIMUM}
          hint={localize(locale, {
            fr: "Douze caractères au minimum.",
            en: "At least twelve characters.",
          })}
          value={form.password}
          onChange={set("password")}
        />

        <TextField
          label={localize(locale, {
            fr: "Confirmation du mot de passe",
            en: "Confirm password",
          })}
          type="password"
          autoComplete="new-password"
          required
          value={form.confirmation}
          onChange={set("confirmation")}
        />
      </div>

      <p className="type-small text-muted-foreground">
        {localize(locale, {
          fr: "Ces informations servent à examiner votre demande de compte et à gérer votre accès.",
          en: "This information is used to review your account request and manage your access.",
        })}{" "}
        <Link
          href="/confidentialite#espace-entreprise"
          prefetch={false}
          className="underline underline-offset-4 hover:text-foreground"
        >
          {localize(locale, { fr: "Données et droits", en: "Data and rights" })}
        </Link>
        .
      </p>

      <ActionButton type="submit" disabled={pending} className="w-full">
        <Building2 aria-hidden="true" className="size-4" />
        {pending
          ? localize(locale, { fr: "Envoi…", en: "Sending…" })
          : localize(locale, {
              fr: "Transmettre la demande",
              en: "Send request",
            })}
      </ActionButton>

      {!compact && (
        <p className="type-small text-muted-foreground">
          {localize(locale, {
            fr: "Vous avez déjà un compte ? ",
            en: "Already have an account? ",
          })}
          {onSwitchToSignIn ? (
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="font-semibold text-accent underline underline-offset-2"
            >
              {localize(locale, { fr: "Se connecter", en: "Sign in" })}
            </button>
          ) : (
            <Link
              href="/connexion"
              className="font-semibold text-accent underline underline-offset-2"
            >
              {localize(locale, { fr: "Se connecter", en: "Sign in" })}
            </Link>
          )}
          .
        </p>
      )}

      {compact ? (
        <p className="type-small text-muted-foreground">
          {localize(locale, {
            fr: "Informations utilisées pour instruire la demande et vous joindre — jamais cédées.",
            en: "Information used to review your request and contact you — never shared with third parties.",
          })}
        </p>
      ) : (
        <p className="type-small text-muted-foreground">
          {localize(locale, {
            fr: "Les informations transmises servent à instruire la demande et à vous joindre au sujet de vos dépôts. Elles ne sont ni cédées ni utilisées à d’autres fins.",
            en: "The information you provide is used to review your request and contact you about your submissions. It is never shared or used for other purposes.",
          })}
        </p>
      )}
    </form>
  );
}
