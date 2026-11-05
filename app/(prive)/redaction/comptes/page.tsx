"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  Ban,
  Building2,
  CheckCircle2,
  Copy,
  List,
  RotateCcw,
  Shuffle,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import { DataTable, type DataColumn } from "@/components/custom/data-table";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/custom/form-field";
import { Modal } from "@/components/custom/modal";
import { OfficeHeader, OfficeSection } from "@/components/custom/office-header";
import { PinField, randomPin } from "@/components/custom/pin-field";
import { StatsTile } from "@/components/custom/stats-tile";
import { isAccessCode } from "@/convex/model/password";
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

type OrganizationRow = NonNullable<
  ReturnType<typeof useQuery<typeof api.accounts.organizations>>
>[number];

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
 *
 * Un compte créé ici reçoit un code provisoire à six chiffres suivis d'une
 * lettre (décision du client du 05/11/2026), que son titulaire remplace lui-même depuis « Mon
 * compte » — il n'existe plus de rôle à double authentification obligatoire
 * (voir `convex/model/access.ts`).
 */
export default function AccountsPage() {
  const accounts = useQuery(api.accounts.directory, {});
  const roles = useQuery(api.accounts.roles, {});
  const organizations = useQuery(api.accounts.organizations, {});
  const categories = useQuery(api.taxonomy.list, {});

  const setRole = useMutation(api.accounts.setRole);
  const setActive = useMutation(api.accounts.setActive);
  const approveOrganization = useMutation(api.accounts.approveOrganization);

  const [busyAccountId, setBusyAccountId] = useState<Id<"users"> | null>(null);
  const [approvingId, setApprovingId] = useState<Id<"organizations"> | null>(
    null
  );
  const [rejectingId, setRejectingId] = useState<Id<"organizations"> | null>(
    null
  );

  const accountRows = accounts ?? [];
  const roleRows = roles ?? [];
  const organizationRows = organizations ?? [];
  const sections = (categories ?? []).filter((row) => !row.parentSlug);

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

  /** Périmètre d'un Éditeur (CDC §4.3 : « ses rubriques autorisées »). */
  const handleSectionsChange = async (
    account: Account,
    sectionSlugs: string[]
  ) => {
    setBusyAccountId(account._id);
    try {
      await setRole({
        id: account._id,
        roleSlug: account.roleSlug,
        sectionSlugs,
      });
      toast.success(
        sectionSlugs.length === 0
          ? "Périmètre ouvert à toutes les rubriques."
          : "Périmètre mis à jour."
      );
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

  const organizationColumns: DataColumn<OrganizationRow>[] = [
    {
      key: "name",
      header: "Entreprise",
      primary: true,
      cell: (organization) => (
        <>
          <p className="type-body font-medium">{organization.name}</p>
          {organization.reviewState === "rejected" &&
            organization.reviewNote && (
              <p className="mt-1 type-small text-destructive">
                Motif&nbsp;: {organization.reviewNote}
              </p>
            )}
        </>
      ),
    },
    {
      key: "sector",
      header: "Secteur",
      cell: (organization) => organization.sector,
    },
    {
      key: "state",
      header: "État",
      cell: (organization) => (
        <span
          className={cn(
            "type-small font-semibold",
            REVIEW_STATE_TONE[organization.reviewState] ?? "text-foreground"
          )}
        >
          {REVIEW_STATE_LABEL[organization.reviewState] ??
            organization.reviewState}
        </span>
      ),
    },
    {
      key: "submissions",
      header: "Dépôts",
      cell: (organization) => organization.submissionCount,
    },
    {
      key: "date",
      header: "Date",
      className: "whitespace-nowrap",
      cell: (organization) => formatDate(organization.createdAt),
    },
  ];

  return (
    <>
      <OfficeHeader
        icon={UserCog}
        title="Comptes et entreprises"
        description="Écran réservé à l'administrateur : le serveur refuse les mêmes appels à un éditeur, y compris depuis l'API."
      />

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

      <OfficeSection
        icon={Building2}
        title="Entreprises à valider"
        tone={pendingOrganizations.length > 0 ? "warning" : "default"}
        className="mt-10"
      >
        {organizations === undefined ? (
          <p className="type-body text-muted-foreground" role="status">
            Chargement des entreprises…
          </p>
        ) : pendingOrganizations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong p-6 text-center type-small text-muted-foreground">
            Aucune demande en attente.
          </p>
        ) : (
          <ul className="grid gap-4">
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
      </OfficeSection>

      <OfficeSection
        icon={List}
        title="Toutes les entreprises"
        className="mt-10"
      >
        {organizations === undefined ? (
          <p className="type-body text-muted-foreground" role="status">
            Chargement des entreprises…
          </p>
        ) : (
          <DataTable
            columns={organizationColumns}
            rows={organizationRows}
            rowKey={(organization) => organization._id}
            caption="Entreprises enregistrées, de la plus récente à la plus ancienne"
            empty="Aucune entreprise enregistrée."
            minWidth="40rem"
          />
        )}
      </OfficeSection>

      <OfficeSection icon={Users} title="Comptes" className="mt-10">
        {accounts === undefined || roles === undefined ? (
          <p className="type-body text-muted-foreground" role="status">
            Chargement des comptes…
          </p>
        ) : accountRows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong p-6 text-center type-small text-muted-foreground">
            Aucun compte enregistré.
          </p>
        ) : (
          <ul className="grid gap-3">
            {accountRows.map((account) => (
              <li key={account._id}>
                <AccountRow
                  account={account}
                  roles={roleRows}
                  sections={sections}
                  busy={busyAccountId === account._id}
                  onRoleChange={(roleSlug) =>
                    handleRoleChange(account, roleSlug)
                  }
                  onSectionsChange={(slugs) =>
                    handleSectionsChange(account, slugs)
                  }
                  onToggleActive={() => handleToggleActive(account)}
                />
              </li>
            ))}
          </ul>
        )}
      </OfficeSection>

      <OfficeSection icon={UserPlus} title="Créer un compte" className="mt-10">
        {roles === undefined ? (
          <p className="type-body text-muted-foreground" role="status">
            Chargement des rôles…
          </p>
        ) : (
          <CreateStaffForm roles={roleRows} />
        )}
      </OfficeSection>

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
  organization: OrganizationRow;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
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
  sections,
  onRoleChange,
  onSectionsChange,
  onToggleActive,
}: {
  account: Account;
  roles: Role[];
  sections: { slug: string; name: string }[];
  busy: boolean;
  onRoleChange: (roleSlug: string) => void;
  onSectionsChange: (sectionSlugs: string[]) => void;
  onToggleActive: () => void;
}) {
  const scoped = account.sectionSlugs;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
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
        <div className="flex flex-wrap gap-2">
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
      </div>

      {account.roleSlug === "editeur" && sections.length > 0 && (
        <fieldset className="mt-4 rounded-md border border-border p-3">
          <legend className="px-1 type-small font-medium">
            Rubriques autorisées
          </legend>
          <p className="type-small text-muted-foreground">
            Aucune case cochée&nbsp;: toutes les rubriques. Sinon, le serveur
            refuse toute écriture hors de cette liste — y compris par
            l&apos;API.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {sections.map((section) => (
              <label
                key={section.slug}
                className="flex items-center gap-2 type-small touch-target"
              >
                <input
                  type="checkbox"
                  className="size-4"
                  disabled={busy}
                  checked={scoped.includes(section.slug)}
                  onChange={(event) =>
                    onSectionsChange(
                      event.target.checked
                        ? [...scoped, section.slug]
                        : scoped.filter((slug) => slug !== section.slug)
                    )
                  }
                />
                {section.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
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

  /** Recopie le code provisoire, pour le transmettre hors ligne à la personne. */
  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Code copié.");
    } catch {
      toast.error("Impossible de copier le code.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
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
      <div className="grid gap-3 sm:col-span-2">
        <div className="flex flex-wrap items-center gap-3">
          <PinField
            label="Code d'accès provisoire"
            value={password}
            onChange={setPassword}
            hint="Six chiffres suivis d’une lettre, sensible à la casse, remis à la personne hors ligne. Elle le remplacera depuis « Mon compte »."
          />
          <ActionButton
            type="button"
            variant="outline"
            onClick={() => setPassword(randomPin())}
          >
            <Shuffle aria-hidden="true" className="size-4" />
            Générer un code
          </ActionButton>
        </div>
        {password !== "" && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono type-h3 tracking-[0.3em]">{password}</p>
            <ActionButton
              type="button"
              variant="outline"
              onClick={() => handleCopyPin()}
            >
              <Copy aria-hidden="true" className="size-4" />
              Copier
            </ActionButton>
          </div>
        )}
      </div>
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
          !isAccessCode(password) ||
          roleSlug === ""
        }
        className="justify-self-start sm:col-span-2"
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
  organization: OrganizationRow;
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
        <p className="font-display type-h3">Refuser la demande</p>
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
