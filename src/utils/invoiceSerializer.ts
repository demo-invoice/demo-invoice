import type { Invoice } from '../types/invoice';

/**
 * Formats a currency amount as USD.
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Serializes an Invoice object into a self-contained HTML string
 * suitable for use as an email body.
 *
 * Handles empty line-item arrays gracefully (renders an empty table body).
 *
 * @param invoice - The invoice to serialize.
 * @returns An HTML string representing the invoice.
 */
export function serializeInvoiceToHtml(invoice: Invoice): string {
  const total = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const rows = invoice.lineItems
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd">${escapeHtml(item.description)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.unitPrice)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.quantity * item.unitPrice)}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title></head>
<body style="font-family:sans-serif;color:#333;max-width:700px;margin:auto">
  <h1 style="color:#1a56db">Invoice ${escapeHtml(invoice.invoiceNumber)}</h1>
  <p><strong>Issue Date:</strong> ${escapeHtml(invoice.issueDate)}</p>
  <p><strong>Due Date:</strong> ${escapeHtml(invoice.dueDate)}</p>
  <hr/>
  <h2>From</h2>
  <p>${escapeHtml(invoice.fromName)} &lt;${escapeHtml(invoice.fromEmail)}&gt;</p>
  <h2>To</h2>
  <p>${escapeHtml(invoice.toName)} &lt;${escapeHtml(invoice.toEmail)}&gt;</p>
  <hr/>
  <table style="width:100%;border-collapse:collapse;margin-top:16px">
    <thead>
      <tr style="background:#f3f4f6">
        <th style="padding:8px;border:1px solid #ddd;text-align:left">Description</th>
        <th style="padding:8px;border:1px solid #ddd;text-align:right">Qty</th>
        <th style="padding:8px;border:1px solid #ddd;text-align:right">Unit Price</th>
        <th style="padding:8px;border:1px solid #ddd;text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right"><strong>Total</strong></td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right"><strong>${formatCurrency(total)}</strong></td>
      </tr>
    </tfoot>
  </table>
  ${invoice.notes ? `<p style="margin-top:24px"><strong>Notes:</strong> ${escapeHtml(invoice.notes)}</p>` : ''}
</body>
</html>`;
}

/** Escapes HTML special characters to prevent injection. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
