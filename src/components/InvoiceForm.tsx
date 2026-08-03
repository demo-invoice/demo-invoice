/**
 * Main invoice form wired to InvoiceContext.
 */
import { useEffect } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { saveActiveInvoice } from '../services/invoiceStorage';
import { SaveInvoiceButton } from './SaveInvoiceButton';
import type { LineItem } from '../types/invoice';

interface InvoiceFormProps {
  onSaved: () => void;
}

/**
 * Renders all invoice fields and action buttons.
 * Persists state to localStorage on every change.
 */
export function InvoiceForm({ onSaved }: InvoiceFormProps) {
  const { state, dispatch } = useInvoice();

  // Persist active invoice on every state change.
  useEffect(() => {
    saveActiveInvoice(state);
  }, [state]);

  function handleNewInvoice() {
    dispatch({ type: 'NEW_INVOICE' });
  }

  function handleAddLineItem() {
    const newItem: LineItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    dispatch({ type: 'SET_LINE_ITEMS', payload: [...state.lineItems, newItem] });
  }

  function handleLineItemChange(
    id: string,
    field: keyof Omit<LineItem, 'id'>,
    value: string | number,
  ) {
    const updated = state.lineItems.map((li) =>
      li.id === id ? { ...li, [field]: value } : li,
    );
    dispatch({ type: 'SET_LINE_ITEMS', payload: updated });
  }

  function handleRemoveLineItem(id: string) {
    dispatch({
      type: 'SET_LINE_ITEMS',
      payload: state.lineItems.filter((li) => li.id !== id),
    });
  }

  return (
    <form style={{ flex: 1 }} onSubmit={(e) => e.preventDefault()}>
      <h2>Invoice</h2>

      <div>
        <label>
          Invoice Number
          <input
            value={state.invoiceNumber}
            onChange={(e) => dispatch({ type: 'SET_INVOICE_NUMBER', payload: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label>
          Issue Date
          <input
            type="date"
            value={state.issueDate}
            onChange={(e) => dispatch({ type: 'SET_ISSUE_DATE', payload: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label>
          Due Date
          <input
            type="date"
            value={state.dueDate}
            onChange={(e) => dispatch({ type: 'SET_DUE_DATE', payload: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label>
          From
          <textarea
            value={state.from}
            onChange={(e) => dispatch({ type: 'SET_FROM', payload: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label>
          To
          <textarea
            value={state.to}
            onChange={(e) => dispatch({ type: 'SET_TO', payload: e.target.value })}
          />
        </label>
      </div>

      <h3>Line Items</h3>
      {state.lineItems.map((li) => (
        <div key={li.id} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <input
            placeholder="Description"
            value={li.description}
            onChange={(e) => handleLineItemChange(li.id, 'description', e.target.value)}
          />
          <input
            type="number"
            placeholder="Qty"
            value={li.quantity}
            onChange={(e) => handleLineItemChange(li.id, 'quantity', Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Unit Price"
            value={li.unitPrice}
            onChange={(e) => handleLineItemChange(li.id, 'unitPrice', Number(e.target.value))}
          />
          <button type="button" onClick={() => handleRemoveLineItem(li.id)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={handleAddLineItem}>Add Line Item</button>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <SaveInvoiceButton onSaved={onSaved} />
        <button type="button" onClick={handleNewInvoice}>New Invoice</button>
      </div>
    </form>
  );
}
