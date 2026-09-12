"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/components/custom/action-button";
import { cn } from "@/lib/utils";

/**
 * Newsletter opt-in schema. Zod is the single source of truth, shared between
 * client and server once the mutation exists (CAHIER-DES-CHARGES.md §5.1).
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Indiquez votre adresse électronique.")
    .refine(
      (value) => z.email().safeParse(value).success,
      "Cette adresse électronique n'est pas valide."
    ),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

/**
 * Newsletter sign-up.
 *
 * Validation is real; submission is deliberately inert in milestone 1 — the
 * double opt-in flow belongs to milestone 2 (CAHIER-DES-CHARGES.md §4.2).
 */
export function NewsletterForm({ className }: { className?: string }) {
  const id = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit = handleSubmit(async () => {
    toast.info("Inscription enregistrée localement", {
      description:
        "Le double opt-in sera branché avec la mise en ligne du journal.",
    });
    reset();
  });

  const errorId = `${id}-erreur`;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("grid gap-2", className)}
    >
      <Label htmlFor={id} className="type-small font-medium">
        Recevoir la lettre hebdomadaire
      </Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="vous@exemple.ga"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? errorId : undefined}
          className="h-11 min-w-0 flex-1 type-body"
          {...register("email")}
        />
        <ActionButton type="submit" disabled={isSubmitting}>
          <Send aria-hidden="true" className="size-4" />
          S&apos;inscrire
        </ActionButton>
      </div>
      {errors.email && (
        <p id={errorId} role="alert" className="type-small text-destructive">
          {errors.email.message}
        </p>
      )}
      <p className="type-small text-muted-foreground">
        Un courriel par semaine. Désinscription en un clic.
      </p>
    </form>
  );
}
