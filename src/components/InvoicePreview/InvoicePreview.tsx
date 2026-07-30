import { useInvoice } from '../../context/InvoiceContext';

/**
 * Read-only preview panel that reflects InvoiceContext state immediately,
 * including after a RESET_INVOICE dispatch.
 */
export function InvoicePreview() {
  const { state } = useInvoice();

  const total = state.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <section className="invoice-preview" aria-label="Invoice preview">
      <h2>Preview</h2>

      <dl className="invoice-preview__meta">
        <dt>Invoice Number</dt>
        <dd data-testid="preview-invoiceNumber">{state.invoiceNumber}</dd>

        <dt>Issue Date</dt>
        <dd data-testid="preview-issueDate">{state.issueDate}</dd>

        <dt>From</dt>
        <dd data-testid="preview-fromName">{state.fromName || '—'}</dd>

        <dt>Bill To</dt>
        <dd data-testid="preview-toName">{state.toName || '—'}</dd>
      </dl>

      {state.lineItems.length > 0 && (
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
            {state.lineItems.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{item.unitPrice.toFixed(2)}</td>
                <td>{(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><strong>Total</strong></td>
              <td data-testid="preview-total"><strong>{total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      )}

      {state.notes && (
        <p className="invoice-preview__notes" data-testid="preview-notes">
          {state.notes}
        </p>
      )}
    </section>
  );
}
