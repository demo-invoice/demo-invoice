import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(process.cwd(), 'data', 'app.db');

// Ensure the data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

/** Singleton SQLite database connection. */
export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Run the branding migration on startup
const migrationSQL = fs.readFileSync(
  path.resolve(process.cwd(), 'db', 'migrations', '001_user_branding.sql'),
  'utf-8',
);
db.exec(migrationSQL);
