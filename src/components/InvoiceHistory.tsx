import { useInvoice } from '../context/InvoiceContext';
import type { SavedInvoice } from '../types/invoice';

/** Empty-state message shown when no invoices have been saved. */
export const EMPTY_STATE_MESSAGE =
  'No saved invoices yet. Click "Save Invoice" to save the current invoice.';

/**
 * Renders the list of saved invoices.
 * Each entry shows key fields and a Load button to restore the invoice.
 */
export function InvoiceHistory() {
  const { state, dispatch } = useInvoice();
  const { history } = state;

  if (history.length === 0) {
    return <p>{EMPTY_STATE_MESSAGE}</p>;
  }

  return (
    <ul aria-label="Invoice history">
      {history.map((invoice: SavedInvoice) => (
        <li key={invoice.savedAt}>
          <span>{invoice.invoiceNumber}</span>
          {' — '}
          <span>{invoice.clientName}</span>
          {' — '}
          <span>{invoice.issueDate}</span>
          <button
            type="button"
            onClick={() =>
              dispatch({ type: 'LOAD_SAVED_INVOICE', invoice })
            }
          >
            Load
          </button>
        </li>
      ))}
    </ul>
  );
}
