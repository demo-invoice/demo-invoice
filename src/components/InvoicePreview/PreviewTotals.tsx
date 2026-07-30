import React from 'react';
import { tokens } from '../../tokens';
import { useInvoiceState } from '../../context/InvoiceContext';

/** Formats a numeric value as a USD currency string. */
function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

/**
 * Derives and renders subtotal / tax / grand-total from raw line items + taxRate.
 * No separate totals field is read from state — all values are computed inline.
 */
export function PreviewTotals(): React.JSX.Element {
  const { lineItems, taxRate } = useInvoiceState();

  const subtotal = lineItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const rate = Number(taxRate) || 0;
  const tax = subtotal * (rate / 100);
  const grandTotal = subtotal + tax;

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: tokens.typography.size.base,
    color: tokens.color.text,
    padding: `${tokens.spacing['1']} 0`,
  };

  const labelStyle: React.CSSProperties = {
    color: tokens.color.textMuted,
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: tokens.spacing['8'],
      }}
    >
      <div style={{ minWidth: '220px' }}>
        <div style={rowStyle}>
          <span style={labelStyle}>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Tax ({rate}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div
          style={{
            ...rowStyle,
            borderTop: `2px solid ${tokens.color.border}`,
            marginTop: tokens.spacing['2'],
            paddingTop: tokens.spacing['2'],
            fontWeight: tokens.typography.weight.bold,
            fontSize: tokens.typography.size.md,
          }}
        >
          <span>Total</span>
          <span style={{ color: tokens.color.accent }}>{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
