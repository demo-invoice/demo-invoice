import { useInvoice } from '../context/InvoiceContext';

/** Formats a number as USD currency. Same formatter used for both screen and print (same DOM node). */
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

/**
 * Invoice preview panel — the only element visible during @media print.
 * Renders: logo, sender details, client details, line items table,
 * subtotal / tax / total, and notes.
 */
export function InvoicePreview() {
  const { state } = useInvoice();
  const { sender, client, lineItems, taxRate, notes, logo, invoiceNumber, issueDate, dueDate } = state;

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <section className="invoice-preview" aria-label="Invoice preview">
      {/* Header: logo + invoice meta */}
      <header className="invoice-preview__header">
        {logo && (
          <img
            src={logo}
            alt="Company logo"
            className="invoice-preview__logo"
          />
        )}
        <div className="invoice-preview__meta">
          <h1 className="invoice-preview__number">Invoice {invoiceNumber}</h1>
          {issueDate && <p>Issue Date: {issueDate}</p>}
          {dueDate && <p>Due Date: {dueDate}</p>}
        </div>
      </header>

      {/* Sender / Client */}
      <div className="invoice-preview__parties">
        <div className="invoice-preview__sender">
          <h2>From</h2>
          <p>{sender.name}</p>
          <p>{sender.email}</p>
          <p style={{ whiteSpace: 'pre-line' }}>{sender.address}</p>
        </div>
        <div className="invoice-preview__client">
          <h2>Bill To</h2>
          <p>{client.name}</p>
          <p>{client.email}</p>
          <p style={{ whiteSpace: 'pre-line' }}>{client.address}</p>
        </div>
      </div>

      {/* Line items */}
      <table className="invoice-preview__table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.unitPrice)}</td>
              <td>{formatCurrency(item.quantity * item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="invoice-preview__totals">
        <div className="invoice-preview__totals-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="invoice-preview__totals-row">
          <span>Tax ({taxRate}%)</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="invoice-preview__totals-row invoice-preview__totals-row--total">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="invoice-preview__notes">
          <h2>Notes</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{notes}</p>
        </div>
      )}
    </section>
  );
}
