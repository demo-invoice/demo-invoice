import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * @typedef {Object} SendInvoiceEmailParams
 * @property {string} recipientEmail - The recipient's email address.
 * @property {string} [message] - Optional message to include with the invoice.
 * @property {Record<string, unknown>} [invoiceData] - Invoice data to include in the template.
 */

/**
 * Sends an invoice by email using EmailJS.
 * Rejects with a descriptive error if environment variables are not configured.
 *
 * @param {SendInvoiceEmailParams} params
 * @returns {Promise<void>}
 */
export async function sendInvoiceEmail({ recipientEmail, message = '', invoiceData = {} }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    return Promise.reject(
      new Error(
        'Email service is not configured. Please set VITE_EMAILJS_SERVICE_ID, ' +
        'VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY environment variables.'
      )
    );
  }

  if (!recipientEmail) {
    return Promise.reject(new Error('Recipient email is required.'));
  }

  const templateParams = {
    to_email: recipientEmail,
    message,
    ...invoiceData,
  };

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}
