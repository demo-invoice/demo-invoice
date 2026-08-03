import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import type { SavedInvoice } from '../types/invoice';

/**
 * Displays the list of saved invoices.
 *
 * - Empty state renders the exact required message.
 * - Each entry shows invoiceNumber, clientName, issueDate and a Load button.
 * - Load button dispatches LOAD_SAVED_INVOICE with the selected snapshot.
 */
export function InvoiceHistory(): React.JSX.Element {
  const { state, dispatch } = useInvoice();
  const { savedInvoices } = state;

  /** Load a saved invoice snapshot into the active form. */
  function handleLoad(invoice: SavedInvoice): void {
    dispatch({ type: 'LOAD_SAVED_INVOICE', payload: invoice });
  }

  if (savedInvoices.length === 0) {
    return (
      <section aria-label="Invoice history">
        <h2>Saved Invoices</h2>
        <p>No saved invoices yet. Click &quot;Save Invoice&quot; to save the current invoice.</p>
      </section>
    );
  }

  return (
    <section aria-label="Invoice history">
      <h2>Saved Invoices</h2>
      <ul>
        {savedInvoices.map((invoice, index) => (
          <li key={`${invoice.invoiceNumber}-${invoice.savedAt}-${index}`}>
            <span>
              <strong>{invoice.invoiceNumber}</strong> &mdash; {invoice.clientName} &mdash;{' '}
              {invoice.issueDate}
            </span>
            <button
              type="button"
              onClick={() => handleLoad(invoice)}
              aria-label={`Load invoice ${invoice.invoiceNumber}`}
            >
              Load
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
