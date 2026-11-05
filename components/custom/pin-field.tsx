"use client";

import { useId, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ACCESS_CODE_DIGITS, ACCESS_CODE_LENGTH } from "@/convex/model/password";
import { cn } from "@/lib/utils";

/**
 * Seven boxes for six digits followed by one case-sensitive ASCII letter.
 *
 * The boxes behave as one field: typing advances, Backspace retreats and a
 * pasted complete code fills the row. Case is kept exactly as entered.
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
  const code = value.slice(0, ACCESS_CODE_LENGTH);

  const focusCell = (index: number) => {
    const target = cells.current[
      Math.max(0, Math.min(ACCESS_CODE_LENGTH - 1, index))
    ];
    target?.focus();
    target?.select();
  };

  /** Replace occupied cells, without stripping or changing the final letter. */
  const write = (index: number, input: string) => {
    if (index > code.length) {
      focusCell(code.length);
      return;
    }
    if (input === "") {
      onChange(code.slice(0, index));
      focusCell(index);
      return;
    }
    const next = code.slice(0, index) + input + code.slice(index + input.length);
    // A partially entered code is digits only until all six digits exist.
    // Invalid pasted text is rejected rather than silently becoming a new secret.
    if (!/^(?:\d{0,6}|\d{6}[A-Za-z])$/.test(next)) return;
    onChange(next);
    focusCell(Math.min(index + input.length, ACCESS_CODE_LENGTH - 1));
  };

  /** Clears from this box, or from the preceding box if this one is empty. */
  const erase = (index: number) => {
    const at = code[index] !== undefined ? index : index - 1;
    if (at < 0) return;
    onChange(code.slice(0, at));
    focusCell(at);
  };

  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <fieldset
      className={cn("grid w-full min-w-0 max-w-sm gap-2", className)}
      disabled={disabled}
      aria-describedby={describedBy}
    >
      <legend className="type-small font-medium">{label}</legend>
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="grid w-full min-w-0 max-w-sm grid-cols-7 gap-1 sm:gap-2"
          onPaste={(event) => {
            event.preventDefault();
            write(0, event.clipboardData.getData("text").trim());
          }}
        >
          {Array.from({ length: ACCESS_CODE_LENGTH }, (_, index) => (
            <input
              key={index}
              ref={(node) => {
                cells.current[index] = node;
              }}
              type={visible ? "text" : "password"}
              inputMode={index < ACCESS_CODE_DIGITS ? "numeric" : "text"}
              pattern={index < ACCESS_CODE_DIGITS ? "[0-9]" : "[A-Za-z]"}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus={autoFocus && index === 0}
              aria-label={
                index < ACCESS_CODE_DIGITS
                  ? `${label}, chiffre ${index + 1} sur ${ACCESS_CODE_DIGITS}`
                  : `${label}, lettre finale, majuscule ou minuscule`
              }
              aria-invalid={error ? true : undefined}
              value={code[index] ?? ""}
              onChange={(event) => write(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace") {
                  event.preventDefault();
                  erase(index);
                } else if (event.key === "Delete") {
                  event.preventDefault();
                  onChange(code.slice(0, index));
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
                "h-11 w-full min-w-0 rounded-md border bg-background text-center font-mono type-h3 text-foreground transition-colors outline-none sm:h-12",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                error
                  ? "border-destructive"
                  : code[index] !== undefined
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

/** Uniform cryptographic sampling; avoids modulo bias for digits and letters. */
function randomBelow(limit: number): number {
  const bytes = new Uint8Array(1);
  const ceiling = 256 - (256 % limit);
  do {
    crypto.getRandomValues(bytes);
  } while (bytes[0] >= ceiling);
  return bytes[0] % limit;
}

/** Six random digits and one ASCII letter, for a provisional staff code. */
export function randomPin(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return Array.from({ length: ACCESS_CODE_DIGITS }, () => String(randomBelow(10)))
    .join("") + letters[randomBelow(letters.length)];
}
