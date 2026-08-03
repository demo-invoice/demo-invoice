/**
 * validateEmail
 *
 * Returns true if the provided string is a plausible email address.
 * Uses a standard RFC-5321-inspired regex — intentionally not exhaustive
 * (full RFC compliance is impractical client-side) but catches the common
 * error cases: missing @, missing domain, missing TLD.
 *
 * @param email - The string to validate.
 * @returns boolean
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim().length === 0) return false;
  // local@domain.tld — domain must have at least one dot after @
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}
