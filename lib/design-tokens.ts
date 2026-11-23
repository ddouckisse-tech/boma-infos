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
  { token: "navy-50", value: "#F4F7FE", label: "navy-50" },
  { token: "navy-100", value: "#E6EDFC", label: "navy-100" },
  { token: "navy-200", value: "#CDDBFA", label: "navy-200" },
  {
    token: "navy-300",
    value: "#ABC0F2",
    label: "navy-300 · marine textuel sur fond nuit",
    note: "10,51:1 sur #050D2B",
  },
  { token: "navy-400", value: "#809CE3", label: "navy-400" },
  { token: "navy-500", value: "#5575CD", label: "navy-500" },
  { token: "navy-600", value: "#3552AE", label: "navy-600" },
  {
    token: "navy-700",
    value: "#1E347F",
    label: "navy-700 · halo de la charte",
    note: "11,33:1 sur blanc",
  },
  { token: "navy-800", value: "#132461", label: "navy-800" },
  {
    token: "navy-900",
    value: "#0B1848",
    label: "navy-900 · marine de marque",
    note: "16,96:1 sur blanc",
  },
  {
    token: "navy-950",
    value: "#030921",
    label: "navy-950 · fond de la charte",
    note: "12,45:1 sur l'or de marque",
  },
];

export const GOLD_RAMP: Swatch[] = [
  { token: "gold-50", value: "#FFFAEF", label: "gold-50" },
  { token: "gold-100", value: "#FFF2D8", label: "gold-100" },
  { token: "gold-200", value: "#FEE5B0", label: "gold-200" },
  { token: "gold-300", value: "#FED57D", label: "gold-300" },
  {
    token: "gold-400",
    value: "#F7C755",
    label: "gold-400 · or de marque",
    note: "12,06:1 sur #050D2B · 1,58:1 sur blanc — jamais de texte sur blanc",
  },
  { token: "gold-500", value: "#E3AE28", label: "gold-500" },
  { token: "gold-600", value: "#BE9011", label: "gold-600 · pictogrammes" },
  { token: "gold-700", value: "#936E01", label: "gold-700" },
  {
    token: "gold-800",
    value: "#735606",
    label: "gold-800 · or textuel sur blanc",
    note: "6,86:1 sur blanc, 6,33:1 sur #F3F6FB",
  },
  { token: "gold-900", value: "#553E00", label: "gold-900" },
  { token: "gold-950", value: "#332400", label: "gold-950" },
];

/** Les couleurs du logo et leurs déclinaisons textuelles. */
export const FLAG_RAMP: Swatch[] = [
  {
    token: "green-400",
    value: "#61C994",
    label: "green-400 · vert textuel sur fond nuit",
    note: "9,36:1 sur #050D2B",
  },
  {
    token: "green-500",
    value: "#38AA75",
    label: "green-500 · vert de la charte",
    note: "2,93:1 sur blanc — filet et pastille, pas de texte",
  },
  {
    token: "green-700",
    value: "#106843",
    label: "green-700 · vert textuel sur blanc",
    note: "6,81:1 sur blanc",
  },
  {
    token: "blue-400",
    value: "#6097F4",
    label: "blue-400 · bleu textuel sur fond nuit",
    note: "6,58:1 sur #050D2B",
  },
  {
    token: "blue-500",
    value: "#1765E6",
    label: "blue-500 · bleu de la charte",
    note: "5,20:1 sur blanc — anneau de focus",
  },
  {
    token: "blue-600",
    value: "#0D54C6",
    label: "blue-600 · bleu des liens",
    note: "6,77:1 sur blanc, 6,25:1 sur #F3F6FB",
  },
];

export const BRAND_SWATCHES: Swatch[] = [
  {
    token: "brand-navy",
    value: "#0B1848",
    label: "Marine",
    note: "bandeau, une, pied de page, action primaire",
  },
  {
    token: "brand-gold",
    value: "#F7C755",
    label: "Or",
    note: "emphase sur le marine, filets et aplats — jamais de texte sur blanc",
  },
  {
    token: "flag-green",
    value: "#38AA75",
    label: "Vert du filet",
    note: "pastille du logo",
  },
  {
    token: "flag-yellow",
    value: "#FCC546",
    label: "Jaune du filet",
    note: "pastille du logo",
  },
  {
    token: "flag-blue",
    value: "#1765E6",
    label: "Bleu du filet",
    note: "pastille du logo et anneau de focus",
  },
  { token: "white", value: "#FFFFFF", label: "Blanc", note: "fond de lecture" },
  {
    token: "ink",
    value: "#0D152A",
    label: "Encre",
    note: "corps de texte — 18,14:1 sur blanc, 16,74:1 sur #F3F6FB",
  },
  {
    token: "night",
    value: "#050D2B",
    label: "Nuit",
    note: "fond sombre — le marine de la charte, à peine relevé",
  },
];

export const FUNCTIONAL_SWATCHES: Swatch[] = [
  {
    token: "success",
    value: "#106843",
    label: "Succès",
    note: "6,81:1 sur blanc",
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
    value: "#0D54C6",
    label: "Information",
    note: "6,77:1 sur blanc",
  },
];

/** Neutres : très légèrement teintés marine, pour ne pas jurer à côté de lui. */
export const NEUTRAL_RAMP: Swatch[] = [
  {
    token: "neutral-50",
    value: "#F8FAFE",
    label: "neutral-50 · fond très doux",
  },
  { token: "neutral-100", value: "#F3F6FB", label: "neutral-100 · fond doux" },
  { token: "neutral-200", value: "#E2E6EF", label: "neutral-200 · filets" },
  { token: "neutral-300", value: "#CFD4DF", label: "neutral-300" },
  { token: "neutral-400", value: "#A4ABBB", label: "neutral-400" },
  { token: "neutral-500", value: "#788094", label: "neutral-500" },
  {
    token: "neutral-600",
    value: "#515B71",
    label: "neutral-600 · proche du texte atténué clair",
  },
  { token: "neutral-700", value: "#3B455B", label: "neutral-700" },
  { token: "neutral-800", value: "#222B40", label: "neutral-800" },
  { token: "neutral-900", value: "#121A2E", label: "neutral-900" },
  { token: "neutral-950", value: "#070C1C", label: "neutral-950 · voiles" },
];

export const FUNCTIONAL_SWATCHES_DARK: Swatch[] = [
  {
    token: "success-dark",
    value: "#61C994",
    label: "Succès",
    note: "9,36:1 sur #050D2B",
  },
  {
    token: "warning-dark",
    value: "#F0A742",
    label: "Alerte",
    note: "9,38:1 sur #050D2B",
  },
  {
    token: "danger-dark",
    value: "#F9827A",
    label: "Erreur",
    note: "7,74:1 sur #050D2B",
  },
  {
    token: "info-dark",
    value: "#9DBFF8",
    label: "Information",
    note: "10,23:1 sur #050D2B",
  },
];

/** Semantic tokens, shown side by side in both themes. */
export const SEMANTIC_TOKENS = [
  {
    token: "background",
    label: "Fond de page",
    light: "#FFFFFF",
    dark: "#050D2B",
  },
  { token: "foreground", label: "Texte", light: "#0D152A", dark: "#ECF0F9" },
  { token: "card", label: "Carte", light: "#FFFFFF", dark: "#091436" },
  { token: "popover", label: "Surcouche", light: "#FFFFFF", dark: "#101C41" },
  {
    token: "surface-muted",
    label: "Surface douce",
    light: "#F3F6FB",
    dark: "#101C41",
  },
  {
    token: "surface-subtle",
    label: "Surface très douce",
    light: "#F8FAFE",
    dark: "#091436",
  },
  {
    token: "primary",
    label: "Action primaire",
    light: "#0B1848",
    dark: "#F7C755",
  },
  {
    token: "accent",
    label: "Accent textuel",
    light: "#0D54C6",
    dark: "#F7C755",
  },
  {
    token: "muted-foreground",
    label: "Texte atténué",
    light: "#4B556C",
    dark: "#ACB7D2",
  },
  { token: "border", label: "Filet", light: "#E2E6EF", dark: "#1C294E" },
  {
    token: "border-strong",
    label: "Bordure de contrôle",
    light: "#7D869C",
    dark: "#657498",
  },
  {
    token: "ring",
    label: "Anneau de focus",
    light: "#1765E6",
    dark: "#F7C755",
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
    sample: "Le pari gabonais des parcs nationaux",
  },
  {
    token: "h1",
    className: "type-h1",
    mobile: "28 px",
    desktop: "40 px",
    usage: "Titre d'article",
    sample: "Les députés ouvrent l'examen du budget",
  },
  {
    token: "h2",
    className: "type-h2",
    mobile: "22 px",
    desktop: "28 px",
    usage: "Intertitres",
    sample: "Ce que le texte change pour les communes",
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
