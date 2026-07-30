import React from 'react';
import { useInvoice, useInvoiceDispatch } from '../../context/InvoiceContext';
import type { LineItem } from '../../types/invoice';

/** Formats a number as currency string. */
function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Line items table with add / remove / edit support. */
export function LineItems(): React.JSX.Element {
  const { state } = useInvoice();
  const dispatch = useInvoiceDispatch();

  function handleChange(item: LineItem, field: keyof LineItem, raw: string): void {
    const updated: LineItem = {
      ...item,
      [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(raw) || 0 : raw,
    };
    dispatch({ type: 'UPDATE_LINE_ITEM', payload: updated });
  }

  return (
    <div className="line-items-wrapper">
      <h3>Line Items</h3>
      <div className="table-scroll">
        <table className="line-items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th aria-label="Remove" />
            </tr>
          </thead>
          <tbody>
            {state.lineItems.map(item => (
              <tr key={item.id}>
                <td>
                  <input
                    aria-label="Description"
                    type="text"
                    value={item.description}
                    onChange={e => handleChange(item, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label="Quantity"
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={e => handleChange(item, 'quantity', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label="Unit price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={e => handleChange(item, 'unitPrice', e.target.value)}
                  />
                </td>
                <td>{fmt(item.quantity * item.unitPrice)}</td>
                <td>
                  <button
                    type="button"
                    aria-label="Remove line item"
                    onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', payload: item.id })}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
      >
        + Add Line Item
      </button>
    </div>
  );
}
