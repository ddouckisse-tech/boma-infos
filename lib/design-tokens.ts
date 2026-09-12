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
  { token: "navy-50", value: "#F3F7FF", label: "navy-50" },
  { token: "navy-100", value: "#E1EBFD", label: "navy-100" },
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
    note: "4,41:1 sur blanc, 4,05:1 sur #F5F5F5 — non textuel",
  },
  {
    token: "magenta-600",
    value: "#B83D85",
    label: "magenta-600 · magenta textuel",
    note: "5,19:1 sur blanc, 4,76:1 sur #F5F5F5",
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
    note: "accents, filets, aplats — jamais de texte courant",
  },
  {
    token: "brand-magenta-600",
    value: "#B83D85",
    label: "Secondaire, texte",
    note: "le magenta dès qu'il porte du texte — 5,19:1 sur blanc",
  },
  {
    token: "surface-muted-token",
    value: "#F5F5F5",
    label: "Fond doux",
    note: "sections alternées, cartes",
  },
  { token: "white", value: "#FFFFFF", label: "Blanc", note: "fond de lecture" },
  {
    token: "ink",
    value: "#1A1A1A",
    label: "Encre",
    note: "corps de texte — 17,40:1 sur blanc, 15,96:1 sur #F5F5F5",
  },
  {
    token: "night",
    value: "#121212",
    label: "Nuit",
    note: "fond sombre — noir neutre, jamais un noir pur",
  },
  {
    token: "brand-magenta-dark",
    value: "#E06BAD",
    label: "Magenta sombre",
    note: "6,13:1 sur le fond nuit",
  },
];

export const FUNCTIONAL_SWATCHES: Swatch[] = [
  {
    token: "success",
    value: "#0F7B4F",
    label: "Succès",
    note: "5,29:1 sur blanc",
  },
  {
    token: "warning",
    value: "#B45309",
    label: "Alerte",
    note: "5,02:1 sur blanc",
  },
  {
    token: "danger",
    value: "#B42318",
    label: "Erreur",
    note: "6,57:1 sur blanc",
  },
  {
    token: "info",
    value: "#00509D",
    label: "Information",
    note: "7,97:1 sur blanc",
  },
];

/** Neutres : ils portent tous les fonds depuis la v1.1 du cahier des charges. */
export const NEUTRAL_RAMP: Swatch[] = [
  {
    token: "neutral-50",
    value: "#FAFAFA",
    label: "neutral-50 · fond très doux",
  },
  { token: "neutral-100", value: "#F5F5F5", label: "neutral-100 · fond doux" },
  { token: "neutral-200", value: "#E5E5E5", label: "neutral-200 · filets" },
  { token: "neutral-300", value: "#D4D4D4", label: "neutral-300" },
  {
    token: "neutral-400",
    value: "#A3A3A3",
    label: "neutral-400 · texte atténué sombre",
  },
  { token: "neutral-500", value: "#737373", label: "neutral-500" },
  {
    token: "neutral-600",
    value: "#525252",
    label: "neutral-600 · texte atténué clair",
  },
  { token: "neutral-700", value: "#404040", label: "neutral-700" },
  {
    token: "neutral-800",
    value: "#262626",
    label: "neutral-800 · filets sombres",
  },
  {
    token: "neutral-900",
    value: "#171717",
    label: "neutral-900 · carte sombre",
  },
  { token: "neutral-950", value: "#0A0A0A", label: "neutral-950" },
];

export const FUNCTIONAL_SWATCHES_DARK: Swatch[] = [
  {
    token: "success-dark",
    value: "#4ADE9E",
    label: "Succès",
    note: "10,91:1 sur #121212",
  },
  {
    token: "warning-dark",
    value: "#F0A742",
    label: "Alerte",
    note: "9,20:1 sur #121212",
  },
  {
    token: "danger-dark",
    value: "#F9827A",
    label: "Erreur",
    note: "7,58:1 sur #121212",
  },
  {
    token: "info-dark",
    value: "#7FB3F0",
    label: "Information",
    note: "8,57:1 sur #121212",
  },
];

/** Semantic tokens, shown side by side in both themes. */
export const SEMANTIC_TOKENS = [
  {
    token: "background",
    label: "Fond de page",
    light: "#FFFFFF",
    dark: "#121212",
  },
  { token: "foreground", label: "Texte", light: "#1A1A1A", dark: "#EDEDED" },
  { token: "card", label: "Carte", light: "#FFFFFF", dark: "#171717" },
  { token: "popover", label: "Surcouche", light: "#FFFFFF", dark: "#1F1F1F" },
  {
    token: "surface-muted",
    label: "Surface douce",
    light: "#F5F5F5",
    dark: "#1F1F1F",
  },
  {
    token: "surface-subtle",
    label: "Surface très douce",
    light: "#FAFAFA",
    dark: "#171717",
  },
  {
    token: "primary",
    label: "Action primaire",
    light: "#002060",
    dark: "#A2BFF1",
  },
  {
    token: "accent",
    label: "Accent textuel",
    light: "#B83D85",
    dark: "#E06BAD",
  },
  {
    token: "muted-foreground",
    label: "Texte atténué",
    light: "#525252",
    dark: "#A3A3A3",
  },
  { token: "border", label: "Filet", light: "#E5E5E5", dark: "#262626" },
  {
    token: "border-strong",
    label: "Bordure de contrôle",
    light: "#8C8C8C",
    dark: "#6B6B6B",
  },
  {
    token: "ring",
    label: "Anneau de focus",
    light: "#B83D85",
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
