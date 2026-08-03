/**
 * Email validation utility.
 */

/**
 * Returns true if the given string is a plausibly valid email address.
 *
 * Uses an RFC-5321-friendly regex: requires local-part, @, domain, and TLD.
 * Intentionally conservative — rejects whitespace-only, missing @, missing TLD.
 *
 * @param email - The string to validate.
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim().length === 0) return false;
  // Regex breakdown:
  //   ^[^\s@]+      — one or more non-whitespace, non-@ chars (local part)
  //   @             — literal @
  //   [^\s@]+       — domain name (at least one segment)
  //   \.            — literal dot
  //   [^\s@]{2,}$   — TLD of at least 2 chars
  const RFC_FRIENDLY = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return RFC_FRIENDLY.test(email.trim());
}
