import { db } from '../db';
import { BRANDING_DEFAULTS, BrandingRecord, ApprovedFont } from '../shared/brandingDefaults';
import { brandingSchema, BrandingPayload } from '../shared/brandingSchema';

interface UserBrandingRow {
  user_id: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches the branding record for a user.
 * If no record exists, returns BRANDING_DEFAULTS.
 * Merges field-by-field so a partial record never produces undefined values.
 */
export function getBranding(userId: string): BrandingRecord {
  const row = db
    .prepare('SELECT * FROM user_branding WHERE user_id = ?')
    .get(userId) as UserBrandingRow | undefined;

  if (!row) {
    return { ...BRANDING_DEFAULTS };
  }

  return {
    primary_color: row.primary_color ?? BRANDING_DEFAULTS.primary_color,
    secondary_color: row.secondary_color ?? BRANDING_DEFAULTS.secondary_color,
    font_family: (row.font_family as ApprovedFont) ?? BRANDING_DEFAULTS.font_family,
  };
}

/**
 * Validates and upserts a branding record for a user.
 * Uses ON CONFLICT(user_id) DO UPDATE for atomic concurrent writes.
 * Throws a ZodError if the payload is invalid.
 */
export function upsertBranding(userId: string, payload: BrandingPayload): BrandingRecord {
  // Validate — throws ZodError on failure (caller handles 400 response)
  const validated = brandingSchema.parse(payload);

  db.prepare(`
    INSERT INTO user_branding (user_id, primary_color, secondary_color, font_family, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      primary_color   = excluded.primary_color,
      secondary_color = excluded.secondary_color,
      font_family     = excluded.font_family,
      updated_at      = excluded.updated_at
  `).run(userId, validated.primary_color, validated.secondary_color, validated.font_family);

  return getBranding(userId);
}

/**
 * Returns the default branding constant.
 * Used by the invoice renderer as a fallback when no branding is provided.
 */
export function getDefaultBranding(): BrandingRecord {
  return { ...BRANDING_DEFAULTS };
}
