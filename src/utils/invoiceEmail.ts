/**
 * Utilities for building mailto: URIs containing inline invoice content.
 *
 * NOTE: mailto: links cannot carry file attachments (RFC 6068 §2).
 * The invoice content is therefore inlined as plain text in the email body.
 *
 * TODO (follow-up ticket): Replace mailto: with a Next.js API route +
 * transactional email provider (e.g. Resend / SendGrid) to support PDF
 * attachments, delivery tracking, and server-side rendering of the invoice.
 * See Sara's decision log — current approach confidence: 0.4.
 */
import type { Invoice } from '../types/invoice';

/** Maximum safe mailto URI length (conservative browser limit). */
const MAX_URI_LENGTH = 2000;

const TRUNCATION_NOTICE =
  '\n\n[Invoice details truncated — please open the full invoice in the app]';

/**
 * Formats a currency amount as a locale string.
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

/**
 * Builds the plain-text invoice body for inclusion in the email.
 */
export function buildInvoiceBody(invoice: Invoice, customMessage: string): string {
  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const tax = subtotal * invoice.taxRate;
  const total = subtotal + tax;

  const lineItemsText =
    invoice.lineItems.length === 0
      ? '  (No line items)'
      : invoice.lineItems
          .map(
            (item) =>
              `  • ${item.description} — ${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.quantity * item.unitPrice)}`,
          )
          .join('\n');

  const header = customMessage ? `${customMessage}\n\n` : '';

  return (
    `${header}` +
    `Invoice #${invoice.invoiceNumber}\n` +
    `From: ${invoice.companyName}\n` +
    `To: ${invoice.clientName}\n` +
    `Issued: ${invoice.issuedAt}${invoice.dueAt ? `  |  Due: ${invoice.dueAt}` : ''}\n` +
    `\nLine Items:\n${lineItemsText}\n` +
    `\nSubtotal: ${formatCurrency(subtotal)}\n` +
    `Tax (${(invoice.taxRate * 100).toFixed(0)}%): ${formatCurrency(tax)}\n` +
    `Total: ${formatCurrency(total)}`
  );
}

/**
 * Constructs a mailto: URI encoding the recipient, subject, and invoice body.
 *
 * If the resulting URI would exceed MAX_URI_LENGTH characters, the body is
 * truncated and a notice is appended so the recipient knows to open the app.
 *
 * @param invoice   - The invoice to summarise.
 * @param recipient - The destination email address.
 * @param subject   - Email subject (defaults to a meaningful fallback).
 * @param message   - Optional personal message prepended to the invoice body.
 * @returns A fully-encoded mailto: URI string.
 */
export function buildMailtoUri(
  invoice: Invoice,
  recipient: string,
  subject: string,
  message: string,
): string {
  const resolvedSubject =
    subject.trim() ||
    `Invoice #${invoice.invoiceNumber} from ${invoice.companyName}`;

  const fullBody = buildInvoiceBody(invoice, message);

  const baseUri = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(resolvedSubject)}&body=`;

  const fullUri = baseUri + encodeURIComponent(fullBody);

  if (fullUri.length <= MAX_URI_LENGTH) {
    return fullUri;
  }

  // Truncate body to fit within the limit, leaving room for the notice.
  const encodedNotice = encodeURIComponent(TRUNCATION_NOTICE);
  const availableBodyLength = MAX_URI_LENGTH - baseUri.length - encodedNotice.length;

  // Encode the full body then slice to the available length.
  // Slice at a safe boundary to avoid cutting a %-encoded sequence.
  let encodedBody = encodeURIComponent(fullBody).slice(0, availableBodyLength);
  // Trim any trailing incomplete percent-encoding (e.g. "%2" at the cut point).
  encodedBody = encodedBody.replace(/%[0-9A-Fa-f]?$/, '');

  return baseUri + encodedBody + encodedNotice;
}
