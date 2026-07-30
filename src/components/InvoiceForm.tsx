import { useInvoice } from '../context/InvoiceContext';
import type { LineItem } from '../types/invoice';

/**
 * Invoice data-entry form.
 * All fields are controlled via InvoiceContext.
 */
export function InvoiceForm() {
  const { state, dispatch } = useInvoice();

  function handleLineItemChange(
    id: string,
    field: keyof Omit<LineItem, 'id'>,
    value: string,
  ) {
    const item = state.lineItems.find((li) => li.id === id);
    if (!item) return;
    const updated: LineItem = {
      ...item,
      [field]: field === 'description' ? value : Number(value),
    };
    dispatch({ type: 'UPDATE_LINE_ITEM', payload: updated });
  }

  return (
    <section style={styles.section} aria-label="Invoice form">
      <h2 style={styles.heading}>Invoice Details</h2>

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>From</legend>
        <label style={styles.label}>
          Name
          <input
            style={styles.input}
            value={state.fromName}
            onChange={(e) => dispatch({ type: 'SET_FROM_NAME', payload: e.target.value })}
            placeholder="Your name or company"
          />
        </label>
        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            type="email"
            value={state.fromEmail}
            onChange={(e) => dispatch({ type: 'SET_FROM_EMAIL', payload: e.target.value })}
            placeholder="you@example.com"
          />
        </label>
      </fieldset>

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>To</legend>
        <label style={styles.label}>
          Name
          <input
            style={styles.input}
            value={state.toName}
            onChange={(e) => dispatch({ type: 'SET_TO_NAME', payload: e.target.value })}
            placeholder="Client name or company"
          />
        </label>
        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            type="email"
            value={state.toEmail}
            onChange={(e) => dispatch({ type: 'SET_TO_EMAIL', payload: e.target.value })}
            placeholder="client@example.com"
          />
        </label>
      </fieldset>

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>Invoice Info</legend>
        <label style={styles.label}>
          Invoice Number
          <input
            style={styles.input}
            value={state.invoiceNumber}
            onChange={(e) => dispatch({ type: 'SET_INVOICE_NUMBER', payload: e.target.value })}
            placeholder="INV-001"
          />
        </label>
        <label style={styles.label}>
          Issue Date
          <input
            style={styles.input}
            type="date"
            value={state.issueDate}
            onChange={(e) => dispatch({ type: 'SET_ISSUE_DATE', payload: e.target.value })}
          />
        </label>
        <label style={styles.label}>
          Due Date
          <input
            style={styles.input}
            type="date"
            value={state.dueDate}
            onChange={(e) => dispatch({ type: 'SET_DUE_DATE', payload: e.target.value })}
          />
        </label>
      </fieldset>

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>Line Items</legend>
        {state.lineItems.map((item) => (
          <div key={item.id} style={styles.lineItem}>
            <input
              style={{ ...styles.input, flex: 3 }}
              value={item.description}
              onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
              placeholder="Description"
              aria-label="Line item description"
            />
            <input
              style={{ ...styles.input, flex: 1 }}
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)}
              aria-label="Quantity"
            />
            <input
              style={{ ...styles.input, flex: 1 }}
              type="number"
              min={0}
              step={0.01}
              value={item.unitPrice}
              onChange={(e) => handleLineItemChange(item.id, 'unitPrice', e.target.value)}
              aria-label="Unit price"
            />
            <button
              type="button"
              onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', payload: item.id })}
              style={styles.removeBtn}
              aria-label="Remove line item"
              disabled={state.lineItems.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
          style={styles.addBtn}
        >
          + Add Line Item
        </button>
      </fieldset>

      <label style={styles.label}>
        Notes
        <textarea
          style={{ ...styles.input, height: '5rem', resize: 'vertical' }}
          value={state.notes}
          onChange={(e) => dispatch({ type: 'SET_NOTES', payload: e.target.value })}
          placeholder="Payment terms, thank-you note, etc."
        />
      </label>
    </section>
  );
}

const styles = {
  section: { padding: '1rem', overflowY: 'auto' as const, flex: 1 },
  heading: { marginTop: 0, fontSize: '1.1rem', fontWeight: 700 },
  fieldset: { border: '1px solid #e2e8f0', borderRadius: '0.375rem', marginBottom: '1rem', padding: '0.75rem' },
  legend: { fontWeight: 600, fontSize: '0.875rem', color: '#475569' },
  label: { display: 'flex', flexDirection: 'column' as const, gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 },
  input: { padding: '0.375rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' as const },
  lineItem: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' },
  removeBtn: { background: '#fee2e2', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', padding: '0.25rem 0.5rem', color: '#dc2626' },
  addBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.25rem', cursor: 'pointer', padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
} as const;
