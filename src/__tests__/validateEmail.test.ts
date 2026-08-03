import { describe, it, expect } from 'vitest';
import { isValidEmail } from '../utils/validateEmail';

describe('isValidEmail', () => {
  it('accepts a standard valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('accepts an email with subdomain', () => {
    expect(isValidEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('accepts an email with plus addressing', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects a whitespace-only string', () => {
    expect(isValidEmail('   ')).toBe(false);
  });

  it('rejects an address missing @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects an address missing TLD', () => {
    expect(isValidEmail('user@example')).toBe(false);
  });

  it('rejects an address with only one TLD char', () => {
    expect(isValidEmail('user@example.c')).toBe(false);
  });

  it('rejects an address with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });

  it('rejects an address with no local part', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });
});
