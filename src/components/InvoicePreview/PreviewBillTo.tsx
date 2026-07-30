import React from 'react';
import { tokens } from '../../tokens';
import { useInvoiceState } from '../../context/InvoiceContext';

/**
 * Renders the "Bill To" block.
 * Suppresses individual optional fields when falsy.
 * Suppresses the entire block when billToName is empty.
 */
export function PreviewBillTo(): React.JSX.Element | null {
  const {
    billToName,
    billToEmail,
    billToPhone,
    billToAddress1,
    billToAddress2,
  } = useInvoiceState();

  // Suppress entire block if no recipient name
  if (!billToName) return null;

  return (
    <div style={{ marginBottom: tokens.spacing['8'] }}>
      <div
        style={{
          fontSize: tokens.typography.size.xs,
          fontWeight: tokens.typography.weight.semibold,
          color: tokens.color.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: tokens.spacing['2'],
        }}
      >
        Bill To
      </div>
      <div
        style={{
          fontSize: tokens.typography.size.base,
          color: tokens.color.text,
          lineHeight: tokens.typography.lineHeight.normal,
        }}
      >
        <div style={{ fontWeight: tokens.typography.weight.semibold }}>{billToName}</div>
        {billToEmail && <div>{billToEmail}</div>}
        {billToPhone && <div>{billToPhone}</div>}
        {billToAddress1 && <div>{billToAddress1}</div>}
        {billToAddress2 && <div>{billToAddress2}</div>}
      </div>
    </div>
  );
}
