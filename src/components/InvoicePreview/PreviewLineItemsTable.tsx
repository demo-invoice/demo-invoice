import React from 'react';
import { tokens } from '../../tokens';
import { useInvoiceState } from '../../context/InvoiceContext';

/** Formats a numeric value as a USD currency string. */
function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const thStyle: React.CSSProperties = {
  padding: `${tokens.spacing['2']} ${tokens.spacing['3']}`,
  fontSize: tokens.typography.size.xs,
  fontWeight: tokens.typography.weight.semibold,
  color: tokens.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  backgroundColor: tokens.color.tableHeader,
  borderBottom: `1px solid ${tokens.color.border}`,
};

const tdStyle: React.CSSProperties = {
  padding: `${tokens.spacing['2']} ${tokens.spacing['3']}`,
  fontSize: tokens.typography.size.base,
  color: tokens.color.text,
  borderBottom: `1px solid ${tokens.color.border}`,
  verticalAlign: 'top',
};

/**
 * Renders the line-items table.
 * Handles zero rows gracefully with a placeholder row.
 * Applies word-break on the description cell to prevent overflow.
 */
export function PreviewLineItemsTable(): React.JSX.Element {
  const { lineItems } = useInvoiceState();

  return (
    <div style={{ marginBottom: tokens.spacing['6'], overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: tokens.typography.size.base,
        }}
      >
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: 'left', width: '50%' }}>Description</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '15%' }}>Qty</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '17.5%' }}>Unit Price</th>
            <th style={{ ...thStyle, textAlign: 'right', width: '17.5%' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                style={{
                  ...tdStyle,
                  textAlign: 'center',
                  color: tokens.color.textMuted,
                  fontStyle: 'italic',
                }}
              >
                &mdash;
              </td>
            </tr>
          ) : (
            lineItems.map((item) => {
              const qty = Number(item.quantity) || 0;
              const price = Number(item.unitPrice) || 0;
              const amount = qty * price;
              return (
                <tr key={item.id}>
                  <td
                    style={{
                      ...tdStyle,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.description || '\u2014'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{qty}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(price)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(amount)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
