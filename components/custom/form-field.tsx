"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Labelled control for the private areas.
 *
 * `components/ui/input.tsx` is a 32 px shadcn primitive and is never
 * modified (house convention); CDC §3.5 asks for 44 px touch targets, so
 * the height and the body size are raised here by composition — exactly
 * what the public contact form does.
 */

type Common = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

export function TextField({
  label,
  hint,
  error,
  required,
  className,
  ...props
}: Common & React.ComponentProps<"input">) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="type-small font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="h-11 type-body"
        {...props}
      />
      {hint && (
        <p id={`${id}-hint`} className="type-small text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="type-small text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  className,
  ...props
}: Common & React.ComponentProps<"textarea">) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="type-small font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="min-h-28 type-body"
        {...props}
      />
      {hint && (
        <p id={`${id}-hint`} className="type-small text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="type-small text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  options,
  ...props
}: Common & {
  options: readonly { value: string; label: string; disabled?: boolean }[];
} & React.ComponentProps<"select">) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="type-small font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {/* `<select>` natif : sur un téléphone gabonais d'entrée de gamme, le
          sélecteur du système est plus rapide et plus accessible qu'une
          liste reconstruite en JavaScript. */}
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        // `bg-background text-foreground` explicites : un `<select>` natif laissé
        // transparent rend sa liste d'options en blanc sur blanc dans le thème
        // sombre de Windows.
        className="h-11 w-full rounded-lg border border-input bg-background px-2.5 type-body text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="type-small text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="type-small text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
