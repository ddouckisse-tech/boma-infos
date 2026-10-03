/**
 * The BOMA Infos wordmark; the SVG artwork lives outside the JS bundle.
 *
 * `width` and `height` are the frame of the vector master
 * (`assets/brand/boma-infos.svg`); `scripts/make-brand.ts` refuses to export
 * if they drift from `assets/brand/dimensions.json`.
 */
export const BRAND_LOGO = {
  width: 5194,
  height: 1194,
  sprite: "/brand/boma-infos.v1.svg",
  light: "/brand/boma-infos-light.v1.svg",
  dark: "/brand/boma-infos-dark.v1.svg",
  social: "/brand/boma-infos-light.v1.png",
  socialWidth: 1120,
  socialHeight: 257,
} as const;
