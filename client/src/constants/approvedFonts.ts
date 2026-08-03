/**
 * Frontend mirror of src/constants/approvedFonts.ts.
 * Keys are standard CSS font-family names used in @font-face and inline styles.
 * Values are human-readable display labels for the font selector dropdown.
 *
 * Keep in sync with src/constants/approvedFonts.ts on the backend.
 */
export const APPROVED_FONTS: Record<string, string> = {
  'Inter': 'Inter',
  'Roboto': 'Roboto',
  'Lato': 'Lato',
  'Open Sans': 'Open Sans',
  'Merriweather': 'Merriweather',
  'Playfair Display': 'Playfair Display',
  'Source Sans Pro': 'Source Sans Pro',
} as const;

export type ApprovedFontName = keyof typeof APPROVED_FONTS;
