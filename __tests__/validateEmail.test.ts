import { describe, it, expect } from 'vitest';
import { validateEmail } from '../src/utils/validateEmail';

describe('validateEmail', () => {
  it('accepts a standard valid address', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('accepts addresses with subdomains', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('accepts addresses with plus-addressing', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('rejects a string with no @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('rejects a string with no domain after @', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('rejects a string with no TLD', () => {
    expect(validateEmail('user@example')).toBe(false);
  });

  it('rejects whitespace-only input', () => {
    expect(validateEmail('   ')).toBe(false);
  });

  it('rejects an address with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false);
  });
});
