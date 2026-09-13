"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { CheckCircle2, ImagePlus, Loader2, TriangleAlert } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { humanError } from "@/lib/private";
import { cn } from "@/lib/utils";

/**
 * The widths the journal serves, ascending; a picture only gets the ones it
 * can fill. 240 is the list thumbnail (96 px on a phone, 160 px beyond).
 */
const WIDTHS = [240, 320, 640, 960, 1280] as const;
const QUALITY = 0.82;
const MAX_FILES = 12;

type Job = {
  name: string;
  state: "pending" | "encoding" | "uploading" | "done" | "failed";
  detail?: string;
  id?: Id<"media">;
};

/**
 * Picture upload — the client's request of 12/09/2026: an administrator
 * adds images from the screen.
 *
 * The browser does the work the offline script used to do. The picture is
 * decoded, drawn at up to five widths and encoded in WebP by the canvas
 * (AVIF is not something browsers write); each rendition goes to Convex
 * file storage through a short-lived upload URL, and one mutation records
 * the row. Nothing is resized on the server, and nothing native is needed
 * there. The alternative text is asked next, in the editing panel — it is
 * mandatory (§3.5) before the picture is placed in an article.
 */
export function MediaUploader({
  onUploaded,
  compact = false,
  autoOpen = false,
  className,
}: {
  /** Called once per picture, with the new row. */
  onUploaded?: (id: Id<"media">, key: string) => void;
  compact?: boolean;
  /** Open the file dialog as soon as the component mounts (deep link). */
  autoOpen?: boolean;
  className?: string;
}) {
  const generateUploadUrl = useMutation(api.library.generateUploadUrl);
  const createUploaded = useMutation(api.library.createUploaded);
  const input = useRef<HTMLInputElement | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragging, setDragging] = useState(false);
  const [credit, setCredit] = useState("");
  const [opened, setOpened] = useState(false);

  // Ouverture automatique au montage, sans effet : le sélecteur natif ne
  // peut s'ouvrir que dans un geste utilisateur — on affiche donc un bouton
  // mis en avant plutôt que de forcer une boîte que le navigateur bloquerait.
  if (autoOpen && !opened) setOpened(true);

  const busy = jobs.some(
    (job) => job.state === "encoding" || job.state === "uploading"
  );

  const patch = (index: number, change: Partial<Job>) =>
    setJobs((current) =>
      current.map((job, i) => (i === index ? { ...job, ...change } : job))
    );

  const process = async (files: File[]) => {
    const accepted = files
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_FILES);
    if (accepted.length === 0) return;
    const offset = jobs.length;
    setJobs((current) => [
      ...current,
      ...accepted.map((file) => ({
        name: file.name,
        state: "pending" as const,
      })),
    ]);

    for (let i = 0; i < accepted.length; i += 1) {
      const index = offset + i;
      const file = accepted[i];
      try {
        patch(index, { state: "encoding", detail: "Préparation des tailles…" });
        const bitmap = await decode(file);
        const widths = WIDTHS.filter((w) => w <= bitmap.width);
        const targets = widths.length > 0 ? widths : [bitmap.width];
        const renditions: {
          format: "webp";
          w: number;
          h: number;
          bytes: number;
          storageId: Id<"_storage">;
        }[] = [];
        for (let step = 0; step < targets.length; step += 1) {
          patch(index, {
            state: "uploading",
            detail: `Envoi ${step + 1} sur ${targets.length}…`,
          });
          const { blob, w, h } = await encode(bitmap, targets[step]);
          const url = await generateUploadUrl({});
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": blob.type },
            body: blob,
          });
          if (!response.ok) throw new Error("Le stockage a refusé le fichier.");
          const { storageId } = (await response.json()) as {
            storageId: Id<"_storage">;
          };
          renditions.push({
            format: "webp",
            w,
            h,
            bytes: blob.size,
            storageId,
          });
        }
        const largest = renditions[renditions.length - 1];
        const created = await createUploaded({
          key: keyFrom(file.name),
          alt: "",
          caption: "",
          credit: credit.trim(),
          width: largest.w,
          height: largest.h,
          color: dominantColor(bitmap),
          renditions,
        });
        bitmap.close();
        patch(index, { state: "done", detail: created.key, id: created.id });
        onUploaded?.(created.id, created.key);
      } catch (error) {
        patch(index, {
          state: "failed",
          detail: error instanceof Error ? error.message : humanError(error),
        });
      }
    }
  };

  const pick = () => input.current?.click();

  return (
    <div className={cn("grid gap-3", className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void process(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          "grid place-items-center gap-3 rounded-xl border-2 border-dashed text-center transition-colors",
          compact ? "p-4" : "p-6 sm:p-10",
          dragging
            ? "border-accent bg-accent-surface"
            : "border-border-strong bg-surface-subtle"
        )}
      >
        <ImagePlus
          aria-hidden="true"
          className={cn("text-accent", compact ? "size-6" : "size-8")}
        />
        <div>
          <p className="type-body font-semibold">
            {compact ? "Ajouter des images" : "Déposez vos images ici"}
          </p>
          <p className="mt-1 type-small text-muted-foreground">
            JPEG, PNG ou WebP, jusqu&apos;à {MAX_FILES} à la fois. Elles sont
            redimensionnées et allégées dans votre navigateur avant
            l&apos;envoi.
          </p>
        </div>
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md px-4 type-small font-semibold transition-opacity touch-target disabled:opacity-60",
            autoOpen
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "border border-border-strong bg-background hover:bg-surface-muted"
          )}
        >
          {busy ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ImagePlus aria-hidden="true" className="size-4" />
          )}
          {busy ? "Envoi en cours…" : "Choisir des images"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Choisir des images"
          onChange={(event) => {
            void process(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>

      {!compact && (
        <label className="grid gap-1 type-small">
          <span className="font-medium">Crédit (facultatif)</span>
          <input
            value={credit}
            onChange={(event) => setCredit(event.target.value)}
            placeholder="Photographe ou source, appliqué aux prochains envois"
            className="h-11 w-full rounded-lg border border-input bg-background px-2.5 type-body text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
      )}

      {jobs.length > 0 && (
        <ul className="grid gap-1.5" aria-live="polite">
          {jobs.map((job, index) => (
            <li
              key={`${job.name}-${index}`}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 type-small"
            >
              {job.state === "done" ? (
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 shrink-0 text-success-token"
                />
              ) : job.state === "failed" ? (
                <TriangleAlert
                  aria-hidden="true"
                  className="size-4 shrink-0 text-destructive"
                />
              ) : (
                <Loader2
                  aria-hidden="true"
                  className="size-4 shrink-0 animate-spin text-muted-foreground"
                />
              )}
              <span className="min-w-0 flex-1 truncate">{job.name}</span>
              <span
                className={cn(
                  "shrink-0",
                  job.state === "failed"
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {job.state === "done"
                  ? "Ajoutée"
                  : job.state === "pending"
                    ? "En attente"
                    : job.detail}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error(
      "Format non lu par le navigateur (HEIC ?). Convertissez l'image en JPEG ou PNG."
    );
  }
}

async function encode(
  bitmap: ImageBitmap,
  width: number
): Promise<{ blob: Blob; w: number; h: number }> {
  const scale = Math.min(1, width / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Le navigateur ne fournit pas de canevas.");
  context.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY)
  );
  if (!blob || blob.type !== "image/webp") {
    throw new Error("Ce navigateur ne sait pas encoder en WebP.");
  }
  return { blob, w, h };
}

/** Average colour of the picture, painted under it while it loads. */
function dominantColor(bitmap: ImageBitmap): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "#e5e5e5";
  context.drawImage(bitmap, 0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** `Conseil des ministres (1).JPG` → `conseil-des-ministres-1-k3x9`. */
function keyFrom(name: string): string {
  const stem = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${stem || "image"}-${suffix}`;
}
