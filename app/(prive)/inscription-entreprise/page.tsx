"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAction } from "convex/react";
import { Building2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ActionButton } from "@/components/custom/action-button";
import {
  AuthShell,
  FormError,
  FormNotice,
} from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { antiRobot } from "@/lib/anti-robot";

const SECTORS = [
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
];

const MINIMUM = 12;

/**
 * Company registration — CDC §4.4 step 1.
 *
 * The account is **not** opened by this form. The request is recorded, an
 * administrator validates it by hand, and only then does the portal unlock.
 * That is the whole point of §4.4: "pas d'ouverture automatique".
 *
 * The screen always says the same thing when it is done, whether or not the
 * address was already known (§5.3 — no account enumeration), and carries the
 * same honeypot-plus-dwell-time anti-robot as the public contact form rather
 * than a CAPTCHA that would tax every real visitor.
 */
export default function CompanyRegistrationPage() {
  const register = useAction(api.accounts.registerCompany);
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
      setError("Indiquez la raison sociale.");
      return;
    }
    if (form.password.length < MINIMUM) {
      setError(`Le mot de passe doit compter au moins ${MINIMUM} caractères.`);
      return;
    }
    if (form.password !== form.confirmation) {
      setError("Les deux saisies du mot de passe diffèrent.");
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
    } catch {
      setError(
        "La demande n'a pas pu être transmise. Réessayez dans un instant."
      );
    }
    setPending(false);
  };

  if (done) {
    return (
      <AuthShell title="Demande enregistrée">
        <FormNotice>
          Votre demande d&apos;espace entreprise a été transmise à la rédaction.
          Un administrateur la valide à la main&nbsp;: vous recevrez un message
          dès l&apos;ouverture du compte. Aucun dépôt n&apos;est possible avant
          cette validation.
        </FormNotice>
        <p className="mt-4 type-small text-muted-foreground">
          <Link href="/" className="underline underline-offset-2">
            Retour au journal
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Ouvrir un espace entreprise"
      intro="Déposez vos communiqués, nominations, résultats et annonces d'événements. La rédaction garde la main éditoriale : tout contenu partenaire est publié avec la mention « Contenu partenaire »."
      footer={
        <p>
          Vous avez déjà un compte&nbsp;?{" "}
          <Link
            href="/connexion"
            className="font-semibold text-accent underline underline-offset-2"
          >
            Se connecter
          </Link>
          .
        </p>
      }
    >
      <form onSubmit={submit} className="grid gap-5">
        <FormError>{error}</FormError>

        <div aria-hidden="true" className="sr-only">
          <label htmlFor="site_web">Ne pas remplir</label>
          <input
            id="site_web"
            name={antiRobot.honeypotField}
            tabIndex={-1}
            autoComplete="off"
            value={form.honeypot}
            onChange={set("honeypot")}
          />
        </div>

        <TextField
          label="Raison sociale"
          required
          autoComplete="organization"
          value={form.name}
          onChange={set("name")}
        />

        <div className="grid gap-2">
          <label htmlFor="secteur" className="type-small font-medium">
            Secteur d&apos;activité<span className="text-destructive">*</span>
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
                {sector}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="NIF"
            hint="Numéro d'identification fiscale."
            value={form.taxId}
            onChange={set("taxId")}
          />
          <TextField
            label="RCCM"
            hint="Registre du commerce."
            value={form.registrationId}
            onChange={set("registrationId")}
          />
        </div>

        <TextField
          label="Contact — nom et prénom"
          required
          autoComplete="name"
          value={form.contactName}
          onChange={set("contactName")}
        />

        <TextField
          label="Adresse électronique du contact"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          hint="C'est aussi l'identifiant de connexion."
          value={form.contactEmail}
          onChange={set("contactEmail")}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Téléphone"
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
            hint="Renseigné, il reçoit aussi les changements de statut."
            value={form.whatsapp}
            onChange={set("whatsapp")}
          />
        </div>

        <TextField
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          required
          minLength={MINIMUM}
          hint="Douze caractères au minimum."
          value={form.password}
          onChange={set("password")}
        />

        <TextField
          label="Confirmation du mot de passe"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirmation}
          onChange={set("confirmation")}
        />

        <ActionButton type="submit" disabled={pending} className="w-full">
          <Building2 aria-hidden="true" className="size-4" />
          {pending ? "Envoi…" : "Transmettre la demande"}
        </ActionButton>

        <p className="type-small text-muted-foreground">
          Les informations transmises servent à instruire la demande et à vous
          joindre au sujet de vos dépôts. Elles ne sont ni cédées ni utilisées à
          d&apos;autres fins.
        </p>
      </form>
    </AuthShell>
  );
}
