import { z } from "zod";

/**
 * Zod schemas shared by the browser and the server (CDC §5.1).
 *
 * The same object validates the form as the reader types and the payload the
 * server action receives — the browser side is a courtesy, the server side is
 * the control (§5.3).
 */

const email = z
  .string()
  .trim()
  .min(1, "Indiquez votre adresse électronique.")
  .max(254, "Cette adresse est trop longue.")
  .refine(
    (value) => z.email().safeParse(value).success,
    "Cette adresse électronique n'est pas valide."
  );

export const newsletterSchema = z.object({ email });
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Indiquez votre nom.")
    .max(120, "Ce nom est trop long."),
  email,
  organization: z
    .string()
    .trim()
    .max(160, "Ce nom d'organisation est trop long.")
    .optional(),
  subject: z
    .string()
    .trim()
    .min(3, "Indiquez l'objet de votre message.")
    .max(160, "Cet objet est trop long."),
  message: z
    .string()
    .trim()
    .min(20, "Votre message doit compter au moins vingt caractères.")
    .max(4000, "Votre message dépasse quatre mille caractères."),
  consent: z.literal(true, {
    error: "Vous devez accepter le traitement de vos données pour envoyer.",
  }),
});

export type ContactInput = z.infer<typeof contactSchema>;
