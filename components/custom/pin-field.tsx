"use client";

import { useId, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PIN_LENGTH } from "@/convex/model/password";
import { cn } from "@/lib/utils";

/**
 * Six boxes for a six-digit access code — the newsroom's password since the
 * client's decision of 12/09/2026.
 *
 * One `<input>` per digit, because that is what the person sees: a code,
 * not a password field. The boxes behave as one field — typing advances,
 * Backspace retreats, a paste of six digits fills the row — and expose one
 * value to the form: a string of up to six digits. Masked by default (it is
 * a secret), with a single toggle for the row. `autoComplete="off"`: a
 * password manager has nothing sensible to do with six separate boxes.
 */
export function PinField({
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
  autoFocus,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const cells = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.replace(/\D/g, "").slice(0, PIN_LENGTH);

  const focusCell = (index: number) => {
    const target = cells.current[Math.max(0, Math.min(PIN_LENGTH - 1, index))];
    target?.focus();
    target?.select();
  };

  /** Writes `input` from `index` on, overwriting what follows. */
  const write = (index: number, input: string) => {
    const incoming = input.replace(/\D/g, "");
    if (incoming === "") return;
    const next = (digits.slice(0, index) + incoming).slice(0, PIN_LENGTH);
    onChange(next);
    focusCell(next.length < PIN_LENGTH ? next.length : PIN_LENGTH - 1);
  };

  /** Clears the digit of the box, or the previous one if the box is empty. */
  const erase = (index: number) => {
    const at = digits[index] !== undefined ? index : index - 1;
    if (at < 0) return;
    onChange(digits.slice(0, at));
    focusCell(at);
  };

  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <fieldset
      className={cn("grid gap-2", className)}
      disabled={disabled}
      aria-describedby={describedBy}
    >
      <legend className="type-small font-medium">{label}</legend>
      <div className="flex items-center gap-2">
        <div
          className="flex gap-1.5 sm:gap-2"
          onPaste={(event) => {
            event.preventDefault();
            write(0, event.clipboardData.getData("text"));
          }}
        >
          {Array.from({ length: PIN_LENGTH }, (_, index) => (
            <input
              key={index}
              ref={(node) => {
                cells.current[index] = node;
              }}
              type={visible ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              autoFocus={autoFocus && index === 0}
              aria-label={`${label}, chiffre ${index + 1} sur ${PIN_LENGTH}`}
              aria-invalid={error ? true : undefined}
              value={digits[index] ?? ""}
              onChange={(event) => write(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace") {
                  event.preventDefault();
                  erase(index);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  focusCell(index - 1);
                } else if (event.key === "ArrowRight") {
                  event.preventDefault();
                  focusCell(index + 1);
                }
              }}
              onFocus={(event) => event.target.select()}
              className={cn(
                "size-11 rounded-md border bg-background text-center font-mono type-h3 text-foreground transition-colors outline-none sm:size-12",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                error
                  ? "border-destructive"
                  : digits[index] !== undefined
                    ? "border-foreground/50"
                    : "border-input"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-label={visible ? "Masquer le code" : "Afficher le code"}
          title={visible ? "Masquer le code" : "Afficher le code"}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
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
    </fieldset>
  );
}

/** A random six-digit code, for an administrator creating an account. */
export function randomPin(): string {
  const bytes = new Uint32Array(PIN_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => String(n % 10)).join("");
}
