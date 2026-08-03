/**
 * RFC-5322-lite email validation regex.
 * Covers the vast majority of real-world addresses without the full
 * RFC-5322 complexity. Pair with HTML5 `type="email"` for double-guard.
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Returns `true` when the supplied string is a plausible email address.
 *
 * @param email - Raw string from user input.
 */
export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email.trim());
}
