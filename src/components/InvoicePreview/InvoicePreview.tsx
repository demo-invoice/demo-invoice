import React from 'react';
import { tokens } from '../../tokens';
import { PreviewHeader } from './PreviewHeader';
import { PreviewBillTo } from './PreviewBillTo';
import { PreviewLineItemsTable } from './PreviewLineItemsTable';
import { PreviewTotals } from './PreviewTotals';
import { PreviewNotes } from './PreviewNotes';

/**
 * Top-level invoice preview component.
 *
 * - Reads state exclusively via child components (each calls `useInvoiceState`).
 * - Zero useState, zero useReducer, zero event handlers.
 * - A4 aspect ratio (210:297) with overflow-y: auto for smaller screens.
 * - Purely presentational — exports no callbacks.
 */
export function InvoicePreview(): React.JSX.Element {
  return (
    <div
      style={{
        backgroundColor: tokens.color.background,
        padding: tokens.spacing['4'],
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <div
        style={{
          aspectRatio: '210 / 297',
          backgroundColor: tokens.color.surface,
          borderRadius: tokens.radii.md,
          padding: tokens.spacing['10'],
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          fontFamily: tokens.typography.fontFamily,
          color: tokens.color.text,
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <PreviewHeader />
        <PreviewBillTo />
        <PreviewLineItemsTable />
        <PreviewTotals />
        <PreviewNotes />
      </div>
    </div>
  );
}
