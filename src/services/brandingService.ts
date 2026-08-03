import type Database from 'better-sqlite3';

export interface BrandingRecord {
  user_id: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  updated_at: string;
}

export interface BrandingDefaults {
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

const DEFAULTS: BrandingDefaults = {
  primary_color: '#000000',
  secondary_color: '#FFFFFF',
  font_family: 'Inter',
};

/**
 * Retrieves branding for a user. Returns defaults when no record exists.
 * Accepts a db instance for dependency injection (avoids module-level side effects).
 */
export function getBranding(
  db: Database.Database,
  userId: string
): BrandingRecord {
  const row = db
    .prepare('SELECT * FROM user_branding WHERE user_id = ?')
    .get(userId) as BrandingRecord | undefined;

  if (!row) {
    return {
      user_id: userId,
      updated_at: new Date().toISOString(),
      ...DEFAULTS,
    };
  }
  return row;
}

/**
 * Upserts branding for a user. Returns the saved record.
 */
export function upsertBranding(
  db: Database.Database,
  userId: string,
  data: BrandingDefaults
): BrandingRecord {
  db.prepare(`
    INSERT INTO user_branding (user_id, primary_color, secondary_color, font_family, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      primary_color   = excluded.primary_color,
      secondary_color = excluded.secondary_color,
      font_family     = excluded.font_family,
      updated_at      = excluded.updated_at
  `).run(userId, data.primary_color, data.secondary_color, data.font_family);

  return getBranding(db, userId);
}
