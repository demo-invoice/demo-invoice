import React from 'react';
import { tokens } from '../../tokens';
import { useInvoiceState } from '../../context/InvoiceContext';

/**
 * Renders the notes section at the bottom of the invoice.
 * The entire section is suppressed from the DOM when notes is falsy/empty.
 * No blank gap is emitted.
 */
export function PreviewNotes(): React.JSX.Element | null {
  const { notes } = useInvoiceState();

  if (!notes || !notes.trim()) return null;

  return (
    <div
      style={{
        borderTop: `1px solid ${tokens.color.border}`,
        paddingTop: tokens.spacing['4'],
        marginTop: tokens.spacing['4'],
      }}
    >
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
        Notes
      </div>
      <p
        style={{
          fontSize: tokens.typography.size.base,
          color: tokens.color.text,
          lineHeight: tokens.typography.lineHeight.normal,
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}
      >
        {notes}
      </p>
    </div>
  );
}
