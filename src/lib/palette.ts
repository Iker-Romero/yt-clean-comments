/**
 * Background colours for generated letter avatars.
 *
 * Constraints, in order of importance:
 *  - Muted. A bright disc is more eye-catching than the photo it replaced,
 *    which would defeat the point of replacing it.
 *  - Contrast ratio of at least 4.5:1 against white text, so the letter stays
 *    legible without a shadow or outline.
 *  - Readable on both the light and dark YouTube themes.
 */
export const AVATAR_PALETTE = [
  '#5b6b7a', // slate
  '#6b6257', // stone
  '#4f6b63', // muted teal
  '#5d5f7d', // muted indigo
  '#7a5f63', // muted rose
  '#61705a', // olive
  '#7a6a4f', // clay
  '#566b78', // steel
  '#6e5b72', // muted plum
  '#4f6577', // deep slate
  '#6b6b5a', // moss
  '#735f55', // umber
] as const;
