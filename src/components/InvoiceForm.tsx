/**
 * InvoiceForm — invoice form shell.
 *
 * Renders the CurrencySelector in the totals section and displays
 * monetary totals formatted via formatCurrency from InvoiceContext state.
 */
import React, { useState } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { formatCurrency } from '../utils/formatCurrency';
import { CurrencySelector } from './CurrencySelector';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

/** Main invoice form with currency-aware totals. */
export function InvoiceForm() {
  const { state } = useInvoice();

  const [lineItems] = useState<LineItem[]>([
    { description: 'Consulting services', quantity: 8, unitPrice: 150 },
    { description: 'Design work', quantity: 4, unitPrice: 200 },
  ]);

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const taxRate = 0.1;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  function fmt(value: number): string {
    return formatCurrency(value, state.currency, state.customCurrencySymbol);
  }

  return (
    <form className="invoice-form" aria-label="Invoice form">
      <h2>Invoice</h2>

      <section className="line-items" aria-label="Line items">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={idx}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{fmt(item.unitPrice)}</td>
                <td>{fmt(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="totals" aria-label="Totals">
        <CurrencySelector />
        <div className="totals-row">
          <span>Subtotal</span>
          <span data-testid="subtotal">{fmt(subtotal)}</span>
        </div>
        <div className="totals-row">
          <span>Tax (10%)</span>
          <span data-testid="tax">{fmt(tax)}</span>
        </div>
        <div className="totals-row totals-row--total">
          <span>Total</span>
          <span data-testid="total">{fmt(total)}</span>
        </div>
      </section>
    </form>
  );
}
