/**
 * Single source of truth for approved font families on the backend.
 * Keys are standard CSS font-family names; values are the expected TTF filenames
 * in assets/fonts/.
 *
 * Keep in sync with client/src/constants/approvedFonts.ts.
 */
export const APPROVED_FONTS: Record<string, string> = {
  'Inter': 'Inter-Regular.ttf',
  'Roboto': 'Roboto-Regular.ttf',
  'Lato': 'Lato-Regular.ttf',
  'Open Sans': 'OpenSans-Regular.ttf',
  'Merriweather': 'Merriweather-Regular.ttf',
  'Playfair Display': 'PlayfairDisplay-Regular.ttf',
  'Source Sans Pro': 'SourceSansPro-Regular.ttf',
} as const;

export type ApprovedFontName = keyof typeof APPROVED_FONTS;
