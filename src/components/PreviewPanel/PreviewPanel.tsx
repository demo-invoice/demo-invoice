import './PreviewPanel.css';
import { useInvoice } from '../../context/InvoiceContext';
import type { LineItem } from '../../context/InvoiceContext';

/** Format a number as USD currency string. */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function lineTotal(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

/**
 * PreviewPanel
 *
 * Renders a read-only styled invoice preview that mirrors the form state.
 * The container enforces `max-width: 100%; overflow-x: hidden` via CSS
 * to prevent wide invoice content from causing horizontal scroll on mobile.
 */
export function PreviewPanel(): JSX.Element {
  const { state } = useInvoice();

  const subtotal = state.lineItems.reduce(
    (sum, item) => sum + lineTotal(item),
    0,
  );

  return (
    <div className="preview-panel">
      <h2 className="preview-panel__heading">Preview</h2>

      <div className="preview-container">
        {/* Invoice header */}
        <div className="preview-invoice__header">
          <div className="preview-invoice__title">INVOICE</div>
          <div className="preview-invoice__meta">
            <div className="preview-invoice__meta-row">
              <span className="preview-invoice__meta-label">Invoice #</span>
              <span className="preview-invoice__meta-value">
                {state.invoiceNumber || '—'}
              </span>
            </div>
            <div className="preview-invoice__meta-row">
              <span className="preview-invoice__meta-label">Issue Date</span>
              <span className="preview-invoice__meta-value">
                {state.issueDate || '—'}
              </span>
            </div>
            <div className="preview-invoice__meta-row">
              <span className="preview-invoice__meta-label">Due Date</span>
              <span className="preview-invoice__meta-value">
                {state.dueDate || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Bill to */}
        <div className="preview-invoice__bill-to">
          <div className="preview-invoice__section-label">Bill To</div>
          <div className="preview-invoice__client-name">
            {state.clientName || <em className="preview-invoice__placeholder">Client name</em>}
          </div>
          <div className="preview-invoice__client-email">
            {state.clientEmail || <em className="preview-invoice__placeholder">client@email.com</em>}
          </div>
        </div>

        {/* Line items */}
        <table className="preview-invoice__table">
          <thead>
            <tr>
              <th className="preview-invoice__th preview-invoice__th--desc">Description</th>
              <th className="preview-invoice__th preview-invoice__th--num">Qty</th>
              <th className="preview-invoice__th preview-invoice__th--num">Unit Price</th>
              <th className="preview-invoice__th preview-invoice__th--num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {state.lineItems.map((item) => (
              <tr key={item.id} className="preview-invoice__tr">
                <td className="preview-invoice__td">
                  {item.description || <em className="preview-invoice__placeholder">—</em>}
                </td>
                <td className="preview-invoice__td preview-invoice__td--num">{item.quantity}</td>
                <td className="preview-invoice__td preview-invoice__td--num">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="preview-invoice__td preview-invoice__td--num">
                  {formatCurrency(lineTotal(item))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="preview-invoice__td preview-invoice__td--total-label">
                Total
              </td>
              <td className="preview-invoice__td preview-invoice__td--total-value">
                {formatCurrency(subtotal)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Notes */}
        {state.notes && (
          <div className="preview-invoice__notes">
            <div className="preview-invoice__section-label">Notes</div>
            <p className="preview-invoice__notes-text">{state.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
