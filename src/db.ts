import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'app.db');

let _db: Database.Database | null = null;

/**
 * Returns the lazily-initialized SQLite database singleton.
 * No connection is opened until the first call — safe to import in tests.
 */
export function getDb(): Database.Database {
  if (_db === null) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    runMigrations(_db);
  }
  return _db;
}

/** Closes and resets the singleton — useful in tests. */
export function closeDb(): void {
  if (_db !== null) {
    _db.close();
    _db = null;
  }
}

function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_branding (
      user_id    TEXT PRIMARY KEY,
      primary_color    TEXT NOT NULL DEFAULT '#000000',
      secondary_color  TEXT NOT NULL DEFAULT '#FFFFFF',
      font_family      TEXT NOT NULL DEFAULT 'Inter',
      updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
