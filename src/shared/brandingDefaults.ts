/**
 * Single source of truth for branding defaults and the approved font list.
 * Imported by the service layer, invoice renderer, and frontend components.
 */

/** The 7 PO-approved font families (T25). No other values are accepted. */
export const APPROVED_FONTS = [
  'Inter',
  'Roboto',
  'Lato',
  'Merriweather',
  'OpenSans',
  'PlayfairDisplay',
  'Montserrat',
] as const;

export type ApprovedFont = (typeof APPROVED_FONTS)[number];

/** Branding record shape used throughout the application. */
export interface BrandingRecord {
  primary_color: string;
  secondary_color: string;
  font_family: ApprovedFont;
}

/**
 * Default branding applied when a user has never saved custom branding.
 * Ensures the invoice renderer never receives undefined/null values.
 */
export const BRANDING_DEFAULTS: BrandingRecord = {
  primary_color: '#2563EB',
  secondary_color: '#64748B',
  font_family: 'Inter',
};
