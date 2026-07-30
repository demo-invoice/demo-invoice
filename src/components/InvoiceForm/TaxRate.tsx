import React from 'react';
import { useInvoice, useInvoiceDispatch } from '../../context/InvoiceContext';

/** Tax rate input and subtotal / tax / total summary. */
export function TaxRate(): React.JSX.Element {
  const { state } = useInvoice();
  const dispatch = useInvoiceDispatch();

  const subtotal = state.lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPrice,
    0,
  );
  const taxAmount = subtotal * (state.taxRate / 100);
  const total = subtotal + taxAmount;

  function fmt(n: number): string {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="tax-summary">
      <label htmlFor="taxRate">Tax Rate (%)</label>
      <input
        id="taxRate"
        type="number"
        min={0}
        max={100}
        step={0.1}
        value={state.taxRate}
        onChange={e =>
          dispatch({ type: 'SET_TAX_RATE', payload: parseFloat(e.target.value) || 0 })
        }
      />
      <dl className="totals">
        <dt>Subtotal</dt><dd>{fmt(subtotal)}</dd>
        <dt>Tax ({state.taxRate}%)</dt><dd>{fmt(taxAmount)}</dd>
        <dt className="total-label">Total</dt><dd className="total-value">{fmt(total)}</dd>
      </dl>
    </div>
  );
}
