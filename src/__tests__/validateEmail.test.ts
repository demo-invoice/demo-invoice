import { describe, it, expect } from 'vitest';
import { validateEmail } from '../utils/validateEmail';

describe('validateEmail', () => {
  it('returns true for a standard valid email', () => {
    expect(validateEmail('client@example.com')).toBe(true);
  });

  it('returns true for email with subdomain', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('returns true for email with plus addressing', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('returns false for string with no @', () => {
    expect(validateEmail('not-an-email')).toBe(false);
  });

  it('returns false for string with @ but no domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('returns false for string with @ but no TLD', () => {
    expect(validateEmail('user@localhost')).toBe(false);
  });

  it('returns false for string exceeding 254 characters', () => {
    const long = 'a'.repeat(245) + '@b.com';
    expect(long.length).toBeGreaterThan(254);
    expect(validateEmail(long)).toBe(false);
  });

  it('trims whitespace before validating', () => {
    expect(validateEmail('  client@example.com  ')).toBe(true);
  });
});
