/**
 * Design token catalogue used by the /design-system gallery.
 *
 * The source of truth is `app/globals.css`; the values are mirrored here only
 * so the gallery can label and display them. Keep both in sync.
 */

export type Swatch = {
  /** CSS custom property name, without the leading dashes. */
  token: string;
  value: string;
  label: string;
  /** Contrast ratio against the surface the swatch is meant to sit on. */
  note?: string;
};

export const NAVY_RAMP: Swatch[] = [
  { token: "navy-50", value: "#F1F6FE", label: "navy-50" },
  { token: "navy-100", value: "#E1EBFD", label: "navy-100 · filets 1 px" },
  { token: "navy-200", value: "#C5D8F9", label: "navy-200" },
  { token: "navy-300", value: "#A2BFF1", label: "navy-300 · primaire sombre" },
  { token: "navy-400", value: "#799FE0", label: "navy-400" },
  { token: "navy-500", value: "#517ECE", label: "navy-500" },
  { token: "navy-600", value: "#3160B8", label: "navy-600" },
  { token: "navy-700", value: "#17479D", label: "navy-700" },
  { token: "navy-800", value: "#07327F", label: "navy-800" },
  {
    token: "navy-900",
    value: "#002060",
    label: "navy-900 · couleur de marque",
    note: "15,27:1 sur blanc",
  },
  { token: "navy-950", value: "#00123F", label: "navy-950" },
];

export const MAGENTA_RAMP: Swatch[] = [
  { token: "magenta-50", value: "#FDF2F8", label: "magenta-50" },
  { token: "magenta-100", value: "#FBE4EF", label: "magenta-100" },
  { token: "magenta-200", value: "#F7CAE1", label: "magenta-200" },
  { token: "magenta-300", value: "#F0A9CE", label: "magenta-300" },
  { token: "magenta-400", value: "#DF78B2", label: "magenta-400" },
  {
    token: "magenta-500",
    value: "#C74794",
    label: "magenta-500 · couleur de marque",
    note: "4,41:1 sur blanc — aplats uniquement",
  },
  {
    token: "magenta-600",
    value: "#AC2E7D",
    label: "magenta-600 · accent textuel",
    note: "6,10:1 sur blanc",
  },
  { token: "magenta-700", value: "#8D1F65", label: "magenta-700" },
  { token: "magenta-800", value: "#711850", label: "magenta-800" },
  { token: "magenta-900", value: "#58123E", label: "magenta-900" },
  { token: "magenta-950", value: "#350924", label: "magenta-950" },
];

export const BRAND_SWATCHES: Swatch[] = [
  {
    token: "brand-navy",
    value: "#002060",
    label: "Primaire",
    note: "titres, barre de navigation, texte fort",
  },
  {
    token: "brand-magenta",
    value: "#C74794",
    label: "Secondaire",
    note: "accents, rubriques, liens actifs, CTA",
  },
  {
    token: "surface-muted-token",
    value: "#E6E7F3",
    label: "Fond doux",
    note: "sections alternées, cartes",
  },
  { token: "white", value: "#FFFFFF", label: "Blanc", note: "fond de lecture" },
  {
    token: "ink",
    value: "#0D1B3E",
    label: "Encre",
    note: "corps de texte — 16,89:1 sur blanc",
  },
  {
    token: "night",
    value: "#0A1430",
    label: "Nuit",
    note: "fond sombre, jamais de noir pur",
  },
  {
    token: "brand-magenta-dark",
    value: "#E06BAD",
    label: "Magenta sombre",
    note: "5,95:1 sur fond nuit",
  },
];

export const FUNCTIONAL_SWATCHES: Swatch[] = [
  { token: "success", value: "#0F7B4F", label: "Succès", note: "5,29:1" },
  { token: "warning", value: "#B45309", label: "Alerte", note: "5,02:1" },
  { token: "danger", value: "#B42318", label: "Erreur", note: "6,57:1" },
  { token: "info", value: "#00509D", label: "Information", note: "7,97:1" },
];

export const FUNCTIONAL_SWATCHES_DARK: Swatch[] = [
  { token: "success-dark", value: "#4ADE9E", label: "Succès", note: "10,59:1" },
  { token: "warning-dark", value: "#F0A742", label: "Alerte", note: "8,92:1" },
  { token: "danger-dark", value: "#F9827A", label: "Erreur", note: "7,36:1" },
  {
    token: "info-dark",
    value: "#7FB3F0",
    label: "Information",
    note: "8,31:1",
  },
];

/** Semantic tokens, shown side by side in both themes. */
export const SEMANTIC_TOKENS = [
  {
    token: "background",
    label: "Fond de page",
    light: "#FFFFFF",
    dark: "#0A1430",
  },
  { token: "foreground", label: "Texte", light: "#0D1B3E", dark: "#E8EAF5" },
  { token: "card", label: "Carte", light: "#FFFFFF", dark: "#101B3C" },
  { token: "popover", label: "Surcouche", light: "#FFFFFF", dark: "#16224A" },
  {
    token: "surface-muted",
    label: "Surface douce",
    light: "#E6E7F3",
    dark: "#16224A",
  },
  {
    token: "primary",
    label: "Action primaire",
    light: "#002060",
    dark: "#A2BFF1",
  },
  { token: "accent", label: "Accent", light: "#AC2E7D", dark: "#E06BAD" },
  {
    token: "muted-foreground",
    label: "Texte atténué",
    light: "#4E5878",
    dark: "#A3ADD1",
  },
  { token: "border", label: "Filet", light: "#E1EBFD", dark: "#27335E" },
  {
    token: "border-strong",
    label: "Bordure de contrôle",
    light: "#7F89AE",
    dark: "#616EA2",
  },
  {
    token: "ring",
    label: "Anneau de focus",
    light: "#AC2E7D",
    dark: "#E06BAD",
  },
  {
    token: "destructive",
    label: "Destructif",
    light: "#B42318",
    dark: "#F9827A",
  },
] as const;

export const TYPE_SCALE = [
  {
    token: "display",
    className: "type-display",
    mobile: "32 px",
    desktop: "56 px",
    usage: "Titre de la une",
    sample: "Le pétrole gabonais à l'heure des choix",
  },
  {
    token: "h1",
    className: "type-h1",
    mobile: "28 px",
    desktop: "40 px",
    usage: "Titre d'article",
    sample: "La CEMAC rouvre le dossier de la convertibilité",
  },
  {
    token: "h2",
    className: "type-h2",
    mobile: "22 px",
    desktop: "28 px",
    usage: "Intertitres",
    sample: "Un marché intérieur encore étroit",
  },
  {
    token: "h3",
    className: "type-h3",
    mobile: "19 px",
    desktop: "22 px",
    usage: "Sous-sections",
    sample: "Ce que dit le rapport",
  },
  {
    token: "body",
    className: "type-body font-sans",
    mobile: "17 px",
    desktop: "19 px",
    usage: "Corps d'article",
    sample:
      "Le corps de texte ne descend jamais sous 17 px sur mobile et conserve un interligne de 1,7.",
  },
  {
    token: "small",
    className: "type-small font-sans",
    mobile: "14 px",
    desktop: "15 px",
    usage: "Légendes, signatures, dates",
    sample: "Libreville · 12 septembre 2026 · 4 min de lecture",
  },
] as const;

export const SPACING_SCALE = [
  { token: "1", px: 4 },
  { token: "2", px: 8 },
  { token: "3", px: 12 },
  { token: "4", px: 16 },
  { token: "6", px: 24 },
  { token: "8", px: 32 },
  { token: "12", px: 48 },
  { token: "16", px: 64 },
  { token: "24", px: 96 },
] as const;

export const RADII = [
  { token: "rounded-xs / rounded-sm", px: 4, usage: "Contrôles" },
  { token: "rounded-md / rounded-lg", px: 8, usage: "Cartes" },
  { token: "rounded-xl → rounded-4xl", px: 16, usage: "Modales — plafond" },
] as const;

export const BREAKPOINTS = [
  { token: "sm", px: 640 },
  { token: "md", px: 768 },
  { token: "lg", px: 1024 },
  { token: "xl", px: 1280 },
  { token: "2xl", px: 1536 },
] as const;
