import './PreviewPanel.css';
import { useInvoice } from '../../context/InvoiceContext';
import type { LineItem } from '../../context/InvoiceContext';

/** Formats a number as USD currency string. */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Renders a read-only preview of the invoice.
 * The .preview-container clips horizontal overflow.
 * At < 768px the table reflows to a block/card layout (AC #8).
 */
export function PreviewPanel(): JSX.Element {
  const { state } = useInvoice();

  const total = state.lineItems.reduce(
    (sum: number, item: LineItem) => sum + item.qty * item.unitPrice,
    0,
  );

  return (
    <div className="preview-container">
      <h2 className="preview__title">Preview</h2>
      <div className="preview-invoice">
        <div className="preview-invoice__header">
          <p className="preview-invoice__field">
            <strong>Client:</strong> {state.clientName || '—'}
          </p>
          <p className="preview-invoice__field">
            <strong>Email:</strong> {state.clientEmail || '—'}
          </p>
          <p className="preview-invoice__field">
            <strong>Invoice #:</strong> {state.invoiceNumber || '—'}
          </p>
          <p className="preview-invoice__field">
            <strong>Issue Date:</strong> {state.issueDate || '—'}
          </p>
          <p className="preview-invoice__field">
            <strong>Due Date:</strong> {state.dueDate || '—'}
          </p>
        </div>

        <table className="preview-invoice__table">
          <thead>
            <tr>
              <th className="preview-invoice__th">Description</th>
              <th className="preview-invoice__th">Qty</th>
              <th className="preview-invoice__th">Unit Price</th>
              <th className="preview-invoice__th">Amount</th>
            </tr>
          </thead>
          <tbody>
            {state.lineItems.length === 0 && (
              <tr>
                <td className="preview-invoice__td" colSpan={4}>
                  No items.
                </td>
              </tr>
            )}
            {state.lineItems.map((item: LineItem) => (
              <tr key={item.id}>
                <td className="preview-invoice__td" data-label="Description">
                  {item.description}
                </td>
                <td className="preview-invoice__td" data-label="Qty">
                  {item.qty}
                </td>
                <td className="preview-invoice__td" data-label="Unit Price">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="preview-invoice__td" data-label="Amount">
                  {formatCurrency(item.qty * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="preview-invoice__td preview-invoice__total-label"
                colSpan={3}
              >
                Total
              </td>
              <td className="preview-invoice__td preview-invoice__total-value">
                {formatCurrency(total)}
              </td>
            </tr>
          </tfoot>
        </table>

        {state.notes && (
          <p className="preview-invoice__notes">
            <strong>Notes:</strong> {state.notes}
          </p>
        )}
      </div>
    </div>
  );
}
