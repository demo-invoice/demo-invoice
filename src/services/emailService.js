/**
 * emailService.js
 *
 * Thin wrapper around @emailjs/browser for sending invoice emails.
 *
 * Required environment variables (set in .env.local):
 *   VITE_EMAILJS_SERVICE_ID   — EmailJS service ID (e.g. "service_abc123")
 *   VITE_EMAILJS_TEMPLATE_ID  — EmailJS template ID (e.g. "template_xyz789")
 *   VITE_EMAILJS_PUBLIC_KEY   — EmailJS public key from your account dashboard
 *
 * To swap for a backend API: replace the body of sendInvoiceEmail with a
 * fetch() call to your own endpoint and remove the @emailjs/browser import.
 * The function signature stays the same so callers need no changes.
 */
import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * @typedef {Object} InvoiceData
 * @property {string} [invoiceNumber] - Invoice number, may be absent.
 * @property {string} [invoiceDate]   - Invoice date string.
 * @property {Array<{description: string, amount: number}>} lineItems
 * @property {number} subtotal
 * @property {number} tax
 * @property {number} total
 */

/**
 * Send an invoice by email using EmailJS.
 *
 * @param {InvoiceData} invoiceData - Invoice fields to include in the email.
 * @param {string}      recipient   - Recipient email address.
 * @param {string}      [message]   - Optional personal message to include.
 * @returns {Promise<void>} Resolves on success, rejects with an Error on failure.
 */
export async function sendInvoiceEmail(invoiceData, recipient, message = '') {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error(
      'Email configuration missing — check environment variables ' +
      '(VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY).'
    );
  }

  const templateParams = {
    to_email:       recipient,
    invoice_number: invoiceData.invoiceNumber || 'N/A',
    invoice_date:   invoiceData.invoiceDate   || 'N/A',
    subtotal:       invoiceData.subtotal.toFixed(2),
    tax:            invoiceData.tax.toFixed(2),
    total:          invoiceData.total.toFixed(2),
    message:        message,
    line_items:     (invoiceData.lineItems || [])
      .map((item) => `${item.description}: $${Number(item.amount).toFixed(2)}`)
      .join('\n'),
  };

  // emailjs.send returns a response object; we only care about success/failure.
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}
