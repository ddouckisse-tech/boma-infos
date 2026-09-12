"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Ban, CheckCircle2, RotateCcw, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/custom/form-field";
import { Modal } from "@/components/custom/modal";
import { StatsTile } from "@/components/custom/stats-tile";
import { formatDate, humanError } from "@/lib/private";
import { cn } from "@/lib/utils";

type Account = {
  _id: Id<"users">;
  subject: string;
  displayName: string;
  email: string;
  roleSlug: string;
  roleName: string;
  authorSlug?: string;
  sectionSlugs: string[];
  organizationId?: Id<"organizations">;
  organizationName?: string;
  active: boolean;
  createdAt: number;
};

type Role = {
  slug: string;
  name: string;
  description: string;
  requiresTwoFactor: boolean;
  permissions: string[];
};

type Organization = {
  _id: Id<"organizations">;
  name: string;
  slug: string;
  sector: string;
  taxId?: string;
  registrationId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  whatsapp?: string;
  approved: boolean;
  reviewState: string;
  reviewNote?: string;
  createdAt: number;
  submissionCount: number;
};

const REVIEW_STATE_LABEL: Record<string, string> = {
  pending: "En attente",
  approved: "Validée",
  rejected: "Refusée",
  suspended: "Suspendue",
};

const REVIEW_STATE_TONE: Record<string, string> = {
  pending: "text-warning-token",
  approved: "text-success-token",
  rejected: "text-destructive",
  suspended: "text-destructive",
};

/**
 * Comptes et entreprises — CDC §4.3 (comptes, rôles) et §4.4 (validation des
 * entreprises).
 *
 * Rien n'est appliqué depuis cet écran sans que le serveur ne revérifie la
 * même permission (`convex/model/access.ts`) : `setRole`, `setActive`,
 * `approveOrganization` et `rejectOrganization` refusent un éditeur
 * exactement comme ils refuseraient un appel direct depuis la CLI.
 */
export default function AccountsPage() {
  const accounts = useQuery(api.accounts.directory, {});
  const roles = useQuery(api.accounts.roles, {});
  const organizations = useQuery(api.accounts.organizations, {});

  const setRole = useMutation(api.accounts.setRole);
  const setActive = useMutation(api.accounts.setActive);
  const approveOrganization = useMutation(api.accounts.approveOrganization);

  const [busyAccountId, setBusyAccountId] = useState<Id<"users"> | null>(
    null
  );
  const [approvingId, setApprovingId] = useState<Id<"organizations"> | null>(
    null
  );
  const [rejectingId, setRejectingId] = useState<Id<"organizations"> | null>(
    null
  );

  const accountRows = accounts ?? [];
  const roleRows = roles ?? [];
  const organizationRows = organizations ?? [];

  const pendingOrganizations = organizationRows.filter(
    (organization) => organization.reviewState === "pending"
  );
  const approvedCount = organizationRows.filter(
    (organization) => organization.reviewState === "approved"
  ).length;
  const activeAccountsCount = accountRows.filter(
    (account) => account.active
  ).length;
  const rejectingOrganization =
    organizationRows.find((organization) => organization._id === rejectingId) ??
    null;

  const handleApprove = async (id: Id<"organizations">) => {
    setApprovingId(id);
    try {
      await approveOrganization({ id });
      toast.success("Entreprise validée.");
    } catch (error) {
      toast.error(humanError(error));
    }
    setApprovingId(null);
  };

  const handleRoleChange = async (account: Account, roleSlug: string) => {
    setBusyAccountId(account._id);
    try {
      await setRole({ id: account._id, roleSlug });
      toast.success("Rôle mis à jour.");
    } catch (error) {
      toast.error(humanError(error));
    }
    setBusyAccountId(null);
  };

  const handleToggleActive = async (account: Account) => {
    setBusyAccountId(account._id);
    try {
      await setActive({ id: account._id, active: !account.active });
      toast.success(account.active ? "Compte révoqué." : "Compte réactivé.");
    } catch (error) {
      toast.error(humanError(error));
    }
    setBusyAccountId(null);
  };

  return (
    <>
      <h1 className="font-serif type-h1">Comptes et entreprises</h1>
      <p className="mt-2 max-w-reading type-body text-muted-foreground">
        Écran réservé à l&apos;administrateur&nbsp;: le serveur refuse les
        mêmes appels à un éditeur, y compris depuis l&apos;API.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatsTile
          label="Comptes actifs"
          value={accounts === undefined ? "…" : activeAccountsCount}
        />
        <StatsTile
          label="Entreprises en attente"
          value={
            organizations === undefined ? "…" : pendingOrganizations.length
          }
          tone={pendingOrganizations.length > 0 ? "warning" : "default"}
        />
        <StatsTile
          label="Entreprises validées"
          value={organizations === undefined ? "…" : approvedCount}
          tone="success"
        />
      </div>

      <section className="mt-10">
        <h2 className="font-serif type-h2">Entreprises à valider</h2>
        {organizations === undefined ? (
          <p className="mt-3 type-body text-muted-foreground">
            Chargement des entreprises…
          </p>
        ) : pendingOrganizations.length === 0 ? (
          <p className="mt-3 rounded-md border border-border bg-card p-6 type-body text-muted-foreground">
            Aucune demande en attente.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {pendingOrganizations.map((organization) => (
              <li key={organization._id}>
                <PendingOrganizationCard
                  organization={organization}
                  busy={approvingId === organization._id}
                  onApprove={() => handleApprove(organization._id)}
                  onReject={() => setRejectingId(organization._id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif type-h2">Toutes les entreprises</h2>
        {organizations === undefined ? (
          <p className="mt-3 type-body text-muted-foreground">
            Chargement des entreprises…
          </p>
        ) : organizationRows.length === 0 ? (
          <p className="mt-3 rounded-md border border-border bg-card p-6 type-body text-muted-foreground">
            Aucune entreprise enregistrée.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full min-w-[40rem] border-collapse">
              <caption className="sr-only">
                Entreprises enregistrées, de la plus récente à la plus
                ancienne
              </caption>
              <thead>
                <tr className="border-b border-border text-start">
                  <th scope="col" className="p-3 text-start type-small">
                    Entreprise
                  </th>
                  <th scope="col" className="p-3 text-start type-small">
                    Secteur
                  </th>
                  <th scope="col" className="p-3 text-start type-small">
                    État
                  </th>
                  <th scope="col" className="p-3 text-start type-small">
                    Dépôts
                  </th>
                  <th scope="col" className="p-3 text-start type-small">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {organizationRows.map((organization) => (
                  <tr
                    key={organization._id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-3">
                      <p className="type-body font-medium">
                        {organization.name}
                      </p>
                      {organization.reviewState === "rejected" &&
                        organization.reviewNote && (
                          <p className="mt-1 type-small text-destructive">
                            Motif&nbsp;: {organization.reviewNote}
                          </p>
                        )}
                    </td>
                    <td className="p-3 type-small">{organization.sector}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "type-small font-semibold",
                          REVIEW_STATE_TONE[organization.reviewState] ??
                            "text-foreground"
                        )}
                      >
                        {REVIEW_STATE_LABEL[organization.reviewState] ??
                          organization.reviewState}
                      </span>
                    </td>
                    <td className="p-3 type-small">
                      {organization.submissionCount}
                    </td>
                    <td className="p-3 type-small whitespace-nowrap text-muted-foreground">
                      {formatDate(organization.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif type-h2">Comptes</h2>
        {accounts === undefined || roles === undefined ? (
          <p className="mt-3 type-body text-muted-foreground">
            Chargement des comptes…
          </p>
        ) : accountRows.length === 0 ? (
          <p className="mt-3 rounded-md border border-border bg-card p-6 type-body text-muted-foreground">
            Aucun compte enregistré.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {accountRows.map((account) => (
              <li key={account._id}>
                <AccountRow
                  account={account}
                  roles={roleRows}
                  busy={busyAccountId === account._id}
                  onRoleChange={(roleSlug) =>
                    handleRoleChange(account, roleSlug)
                  }
                  onToggleActive={() => handleToggleActive(account)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 rounded-md border border-border bg-card p-4 sm:p-6">
        <h2 className="font-serif type-h2">Créer un compte</h2>
        {roles === undefined ? (
          <p className="mt-3 type-body text-muted-foreground">
            Chargement des rôles…
          </p>
        ) : (
          <CreateStaffForm roles={roleRows} />
        )}
      </section>

      <Modal
        open={rejectingOrganization !== null}
        onClose={() => setRejectingId(null)}
        label={
          rejectingOrganization
            ? `Refuser ${rejectingOrganization.name}`
            : "Refuser la demande"
        }
        variant="panel"
      >
        {rejectingOrganization && (
          <RejectOrganizationForm
            key={rejectingOrganization._id}
            organization={rejectingOrganization}
            onClose={() => setRejectingId(null)}
          />
        )}
      </Modal>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="type-small text-muted-foreground">{label}</dt>
      <dd className="type-body break-words">{value}</dd>
    </div>
  );
}

function PendingOrganizationCard({
  organization,
  busy,
  onApprove,
  onReject,
}: {
  organization: Organization;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="rounded-md border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="type-body font-semibold">{organization.name}</p>
          <p className="type-small text-muted-foreground">
            {organization.sector}
          </p>
        </div>
        <p className="type-small text-muted-foreground">
          Demande du {formatDate(organization.createdAt)}
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {organization.taxId && (
          <DetailRow label="NIF" value={organization.taxId} />
        )}
        {organization.registrationId && (
          <DetailRow label="RCCM" value={organization.registrationId} />
        )}
        <DetailRow label="Contact" value={organization.contactName} />
        <DetailRow label="Courriel" value={organization.contactEmail} />
        {organization.contactPhone && (
          <DetailRow label="Téléphone" value={organization.contactPhone} />
        )}
        {organization.whatsapp && (
          <DetailRow label="WhatsApp" value={organization.whatsapp} />
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-3">
        <ActionButton type="button" onClick={onApprove} disabled={busy}>
          <CheckCircle2 aria-hidden="true" className="size-4" />
          Valider le compte
        </ActionButton>
        <ActionButton
          type="button"
          variant="outline"
          onClick={onReject}
          disabled={busy}
          className="text-destructive"
        >
          <Ban aria-hidden="true" className="size-4" />
          Refuser
        </ActionButton>
      </div>
    </article>
  );
}

function AccountRow({
  account,
  roles,
  busy,
  onRoleChange,
  onToggleActive,
}: {
  account: Account;
  roles: Role[];
  busy: boolean;
  onRoleChange: (roleSlug: string) => void;
  onToggleActive: () => void;
}) {
  const currentRole = roles.find((role) => role.slug === account.roleSlug);

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 type-body font-semibold">
            {account.displayName}
            {!account.active && (
              <span className="rounded-xs border border-border px-1.5 py-0.5 type-small font-semibold text-destructive">
                Révoqué
              </span>
            )}
          </p>
          <p className="type-small break-words text-muted-foreground">
            {account.email}
          </p>
          {account.organizationName && (
            <p className="type-small text-muted-foreground">
              Entreprise&nbsp;: {account.organizationName}
            </p>
          )}
        </div>
        <ActionButton
          type="button"
          variant="outline"
          onClick={onToggleActive}
          disabled={busy}
          className={account.active ? "text-destructive" : undefined}
        >
          {account.active ? (
            <>
              <Ban aria-hidden="true" className="size-4" />
              Révoquer
            </>
          ) : (
            <>
              <RotateCcw aria-hidden="true" className="size-4" />
              Réactiver
            </>
          )}
        </ActionButton>
      </div>

      <div className="mt-3 max-w-xs">
        <SelectField
          label="Rôle"
          value={account.roleSlug}
          onChange={(event) => onRoleChange(event.target.value)}
          disabled={busy}
          options={roles.map((role) => ({
            value: role.slug,
            label: role.name,
          }))}
        />
        {currentRole?.requiresTwoFactor && (
          <p className="mt-1 type-small text-muted-foreground">
            Double authentification obligatoire
          </p>
        )}
      </div>
    </div>
  );
}

function CreateStaffForm({ roles }: { roles: Role[] }) {
  const createStaff = useAction(api.accounts.createStaff);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [roleSlug, setRoleSlug] = useState(roles[0]?.slug ?? "");
  const [authorSlug, setAuthorSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    try {
      const result = await createStaff({
        email: email.trim(),
        displayName: displayName.trim(),
        password,
        roleSlug,
        authorSlug: authorSlug.trim() || undefined,
      });
      if (result.status === "created") {
        toast.success(result.message);
        setEmail("");
        setDisplayName("");
        setPassword("");
        setAuthorSlug("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(humanError(error));
    }
    setCreating(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:max-w-xl">
      <TextField
        label="Courriel"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <TextField
        label="Nom affiché"
        required
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
      />
      <TextField
        label="Mot de passe"
        type="password"
        required
        minLength={12}
        hint="Douze caractères au minimum, communiqué hors ligne à la personne"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <SelectField
        label="Rôle"
        value={roleSlug}
        onChange={(event) => setRoleSlug(event.target.value)}
        options={roles.map((role) => ({
          value: role.slug,
          label: role.name,
        }))}
      />
      <TextField
        label="Slug de signature"
        hint="Facultatif : identifie la personne comme auteure d'articles"
        value={authorSlug}
        onChange={(event) => setAuthorSlug(event.target.value)}
      />
      <ActionButton
        type="submit"
        disabled={
          creating ||
          email.trim() === "" ||
          displayName.trim() === "" ||
          password.length < 12 ||
          roleSlug === ""
        }
        className="justify-self-start"
      >
        <UserPlus aria-hidden="true" className="size-4" />
        Créer le compte
      </ActionButton>
    </form>
  );
}

function RejectOrganizationForm({
  organization,
  onClose,
}: {
  organization: Organization;
  onClose: () => void;
}) {
  const rejectOrganization = useMutation(api.accounts.rejectOrganization);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await rejectOrganization({
        id: organization._id,
        reason: reason.trim(),
      });
      toast.success("Demande refusée.");
      onClose();
    } catch (error) {
      toast.error(humanError(error));
    }
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-5">
      <div>
        <p className="font-serif type-h3">Refuser la demande</p>
        <p className="mt-1 type-small text-muted-foreground">
          {organization.name}
        </p>
      </div>
      <TextAreaField
        label="Motif du refus"
        required
        minLength={10}
        hint="Dix caractères au minimum : ce motif est communiqué à l'entreprise."
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <ActionButton
          type="submit"
          disabled={busy || reason.trim().length < 10}
          className="text-destructive"
        >
          <Ban aria-hidden="true" className="size-4" />
          Refuser la demande
        </ActionButton>
        <ActionButton
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={busy}
        >
          Annuler
        </ActionButton>
      </div>
    </form>
  );
}
