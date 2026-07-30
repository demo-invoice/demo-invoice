/**
 * InvoicePreview — live preview panel.
 *
 * Reads currency state from InvoiceContext and renders all monetary values
 * using formatCurrency. Updates immediately on currency change without
 * requiring a save or submit action.
 */
import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { formatCurrency } from '../utils/formatCurrency';

interface PreviewLineItem {
  description: string;
  amount: number;
}

const PREVIEW_ITEMS: PreviewLineItem[] = [
  { description: 'Consulting services', amount: 1200 },
  { description: 'Design work', amount: 800 },
];

/** Live invoice preview — re-renders on every currency state change. */
export function InvoicePreview() {
  const { state } = useInvoice();

  function fmt(value: number): string {
    return formatCurrency(value, state.currency, state.customCurrencySymbol);
  }

  const subtotal = PREVIEW_ITEMS.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <aside className="invoice-preview" aria-label="Invoice preview">
      <h2>Preview</h2>
      <ul>
        {PREVIEW_ITEMS.map((item) => (
          <li key={item.description}>
            <span>{item.description}</span>
            <span>{fmt(item.amount)}</span>
          </li>
        ))}
      </ul>
      <dl className="preview-totals">
        <dt>Subtotal</dt>
        <dd data-testid="preview-subtotal">{fmt(subtotal)}</dd>
        <dt>Tax (10%)</dt>
        <dd data-testid="preview-tax">{fmt(tax)}</dd>
        <dt>Total</dt>
        <dd data-testid="preview-total">{fmt(total)}</dd>
      </dl>
    </aside>
  );
}
