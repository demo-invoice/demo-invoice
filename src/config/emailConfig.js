/**
 * emailConfig.js
 *
 * Centralised email-related configuration.
 * T27 must set VITE_SEND_INVOICE_EMAIL_URL in the project's .env file before
 * production use. If the variable is absent the constant is an empty string,
 * which will cause fetch() to fail gracefully and show an error inside the
 * modal — no silent data loss.
 */

/** @type {string} POST endpoint that accepts { email, invoiceId } and sends the invoice email. */
export const SEND_INVOICE_EMAIL_URL =
  // eslint-disable-next-line no-undef -- import.meta.env is injected by Vite at build time
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SEND_INVOICE_EMAIL_URL) || '';
