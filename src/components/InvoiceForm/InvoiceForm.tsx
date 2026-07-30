import { useInvoice } from '../../context/InvoiceContext';
import type { InvoiceState, LineItem } from '../../context/InvoiceContext';

type ScalarField = keyof Omit<InvoiceState, 'lineItems'>;

/**
 * Form for editing all invoice fields and line items.
 * Dispatches UPDATE_FIELD and line item actions to InvoiceContext.
 */
export function InvoiceForm() {
  const { state, dispatch } = useInvoice();

  function handleFieldChange(field: ScalarField, value: string) {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }

  function handleAddLineItem() {
    const item: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    dispatch({ type: 'ADD_LINE_ITEM', item });
  }

  function handleRemoveLineItem(id: string) {
    dispatch({ type: 'REMOVE_LINE_ITEM', id });
  }

  function handleLineItemChange(
    item: LineItem,
    field: keyof LineItem,
    value: string,
  ) {
    const updated: LineItem = {
      ...item,
      [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value,
    };
    dispatch({ type: 'UPDATE_LINE_ITEM', item: updated });
  }

  return (
    <section className="invoice-form" aria-label="Invoice form">
      <div className="invoice-form__field">
        <label htmlFor="invoiceNumber">Invoice Number</label>
        <input
          id="invoiceNumber"
          type="text"
          value={state.invoiceNumber}
          onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
        />
      </div>

      <div className="invoice-form__field">
        <label htmlFor="issueDate">Issue Date</label>
        <input
          id="issueDate"
          type="date"
          value={state.issueDate}
          onChange={(e) => handleFieldChange('issueDate', e.target.value)}
        />
      </div>

      <div className="invoice-form__field">
        <label htmlFor="fromName">From</label>
        <input
          id="fromName"
          type="text"
          value={state.fromName}
          placeholder="Your name or company"
          onChange={(e) => handleFieldChange('fromName', e.target.value)}
        />
      </div>

      <div className="invoice-form__field">
        <label htmlFor="toName">Bill To</label>
        <input
          id="toName"
          type="text"
          value={state.toName}
          placeholder="Client name or company"
          onChange={(e) => handleFieldChange('toName', e.target.value)}
        />
      </div>

      <div className="invoice-form__field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={state.notes}
          rows={3}
          placeholder="Payment terms, thank-you note…"
          onChange={(e) => handleFieldChange('notes', e.target.value)}
        />
      </div>

      <section aria-label="Line items">
        <h2>Line Items</h2>
        {state.lineItems.map((item) => (
          <div key={item.id} className="invoice-form__line-item">
            <input
              aria-label="Description"
              type="text"
              value={item.description}
              placeholder="Description"
              onChange={(e) => handleLineItemChange(item, 'description', e.target.value)}
            />
            <input
              aria-label="Quantity"
              type="number"
              value={item.quantity}
              min={0}
              onChange={(e) => handleLineItemChange(item, 'quantity', e.target.value)}
            />
            <input
              aria-label="Unit price"
              type="number"
              value={item.unitPrice}
              min={0}
              step="0.01"
              onChange={(e) => handleLineItemChange(item, 'unitPrice', e.target.value)}
            />
            <button
              type="button"
              aria-label={`Remove line item ${item.description || item.id}`}
              onClick={() => handleRemoveLineItem(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddLineItem}>
          + Add Line Item
        </button>
      </section>
    </section>
  );
}
