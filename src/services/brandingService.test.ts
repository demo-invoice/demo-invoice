import { describe, it, expect, vi } from 'vitest';
import type Database from 'better-sqlite3';
import { getBranding, upsertBranding } from './brandingService.js';

const USER_ID = 'user-1';

function makeDb(row: unknown = undefined): Database.Database {
  const get = vi.fn().mockReturnValue(row);
  const run = vi.fn();
  const prepare = vi.fn().mockReturnValue({ get, run });
  return { prepare } as unknown as Database.Database;
}

describe('getBranding', () => {
  it('returns defaults when no record exists in the database', () => {
    const db = makeDb(undefined);
    const result = getBranding(db, USER_ID);

    expect(result.user_id).toBe(USER_ID);
    expect(result.primary_color).toBe('#000000');
    expect(result.secondary_color).toBe('#FFFFFF');
    expect(result.font_family).toBe('Inter');
    expect(result.updated_at).toBeDefined();
  });

  it('returns the stored record when one exists', () => {
    const stored = {
      user_id: USER_ID,
      primary_color: '#AABBCC',
      secondary_color: '#112233',
      font_family: 'Roboto',
      updated_at: '2024-06-01T00:00:00.000Z',
    };
    const db = makeDb(stored);
    const result = getBranding(db, USER_ID);

    expect(result).toEqual(stored);
  });

  it('calls prepare with the correct SELECT query', () => {
    const db = makeDb(undefined);
    getBranding(db, USER_ID);
    expect(db.prepare).toHaveBeenCalledWith(
      'SELECT * FROM user_branding WHERE user_id = ?'
    );
  });
});

describe('upsertBranding', () => {
  it('calls run with userId and branding fields, then returns the record', () => {
    const data = {
      primary_color: '#AABBCC',
      secondary_color: '#112233',
      font_family: 'Lato',
    };
    const stored = {
      user_id: USER_ID,
      ...data,
      updated_at: '2024-06-01T00:00:00.000Z',
    };

    // First prepare call → upsert (run), second → SELECT (get)
    const run = vi.fn();
    const get = vi.fn().mockReturnValue(stored);
    const prepare = vi.fn()
      .mockReturnValueOnce({ run })
      .mockReturnValueOnce({ get });
    const db = { prepare } as unknown as Database.Database;

    const result = upsertBranding(db, USER_ID, data);

    expect(run).toHaveBeenCalledWith(
      USER_ID,
      data.primary_color,
      data.secondary_color,
      data.font_family
    );
    expect(result).toEqual(stored);
  });

  it('returns defaults when no record is found after upsert', () => {
    const data = {
      primary_color: '#000000',
      secondary_color: '#FFFFFF',
      font_family: 'Inter',
    };

    const run = vi.fn();
    const get = vi.fn().mockReturnValue(undefined);
    const prepare = vi.fn()
      .mockReturnValueOnce({ run })
      .mockReturnValueOnce({ get });
    const db = { prepare } as unknown as Database.Database;

    const result = upsertBranding(db, USER_ID, data);

    expect(result.primary_color).toBe('#000000');
    expect(result.secondary_color).toBe('#FFFFFF');
    expect(result.font_family).toBe('Inter');
  });
});
