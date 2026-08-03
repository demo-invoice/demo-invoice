import { validateEmail } from '../utils/validateEmail';

describe('validateEmail', () => {
  it('returns true for a valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('returns true for a valid email with subdomains', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('returns true for a valid email with plus addressing', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('returns false for a string without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('returns false for a string without a domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('returns false for a string without a TLD', () => {
    expect(validateEmail('user@example')).toBe(false);
  });

  it('returns false for a string with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false);
  });

  it('returns false for string exceeding 254 characters', () => {
    const long = 'a'.repeat(249) + '@b.com';
    expect(long.length).toBeGreaterThan(254);
    expect(validateEmail(long)).toBe(false);
  });
});
