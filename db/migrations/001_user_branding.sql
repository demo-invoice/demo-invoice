-- Migration: 001_user_branding
-- Creates the user_branding table with sensible defaults so invoices render
-- correctly even when a user has never configured their branding.

CREATE TABLE IF NOT EXISTS user_branding (
  user_id        TEXT    NOT NULL PRIMARY KEY,
  primary_color  TEXT    NOT NULL DEFAULT '#2563EB',
  secondary_color TEXT   NOT NULL DEFAULT '#64748B',
  font_family    TEXT    NOT NULL DEFAULT 'Inter',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Upsert example (used by the service layer):
-- INSERT INTO user_branding (user_id, primary_color, secondary_color, font_family, updated_at)
-- VALUES (?, ?, ?, ?, datetime('now'))
-- ON CONFLICT(user_id) DO UPDATE SET
--   primary_color   = excluded.primary_color,
--   secondary_color = excluded.secondary_color,
--   font_family     = excluded.font_family,
--   updated_at      = excluded.updated_at;
