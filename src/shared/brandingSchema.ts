import { z } from 'zod';
import { APPROVED_FONTS } from './brandingDefaults';

/** Regex: exactly `#` followed by 6 hex characters. Rejects shorthand, named colors, missing `#`. */
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

const hexColor = z
  .string()
  .regex(hexColorRegex, 'Must be a valid 6-digit hex color (e.g. #2563EB)');

/**
 * Shared Zod schema for branding payloads.
 * Imported by both the Express route handler and the frontend validation hook
 * so validation rules are never duplicated.
 */
export const brandingSchema = z.object({
  primary_color: hexColor,
  secondary_color: hexColor,
  font_family: z.enum(APPROVED_FONTS, {
    errorMap: () => ({
      message: `Font must be one of: ${APPROVED_FONTS.join(', ')}`,
    }),
  }),
});

/** TypeScript type inferred from the Zod schema. */
export type BrandingPayload = z.infer<typeof brandingSchema>;
