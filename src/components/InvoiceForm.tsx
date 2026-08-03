/**
 * Main invoice form wired to InvoiceContext.
 */
import React, { useEffect } from 'react';
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
        <label htmlFor="invoiceNumber">Invoice Number</label><br />
        <input
          id="invoiceNumber"
          type="text"
          value={state.invoiceNumber}
          onChange={(e) => dispatch({ type: 'SET_INVOICE_NUMBER', payload: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="issueDate">Issue Date</label><br />
        <input
          id="issueDate"
          type="date"
          value={state.issueDate}
          onChange={(e) => dispatch({ type: 'SET_ISSUE_DATE', payload: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="dueDate">Due Date</label><br />
        <input
          id="dueDate"
          type="date"
          value={state.dueDate}
          onChange={(e) => dispatch({ type: 'SET_DUE_DATE', payload: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="from">From</label><br />
        <textarea
          id="from"
          value={state.from}
          onChange={(e) => dispatch({ type: 'SET_FROM', payload: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="to">To</label><br />
        <textarea
          id="to"
          value={state.to}
          onChange={(e) => dispatch({ type: 'SET_TO', payload: e.target.value })}
        />
      </div>

      <h3>Line Items</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {state.lineItems.map((li) => (
            <tr key={li.id}>
              <td>
                <input
                  type="text"
                  value={li.description}
                  onChange={(e) => handleLineItemChange(li.id, 'description', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={li.quantity}
                  onChange={(e) => handleLineItemChange(li.id, 'quantity', Number(e.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={li.unitPrice}
                  onChange={(e) => handleLineItemChange(li.id, 'unitPrice', Number(e.target.value))}
                />
              </td>
              <td>
                <button type="button" onClick={() => handleRemoveLineItem(li.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={handleAddLineItem}>Add Line Item</button>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <SaveInvoiceButton onSaved={onSaved} />
        <button type="button" onClick={handleNewInvoice}>New Invoice</button>
      </div>
    </form>
  );
}
