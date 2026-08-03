import { useInvoice } from '../../context/InvoiceContext';
import type { SavedInvoice } from '../../types/invoice';

/**
 * Displays the list of saved invoices.
 * Each entry has a Load button that restores the invoice into the active form.
 */
export function InvoiceHistory() {
  const { savedInvoices, dispatch } = useInvoice();

  /** Dispatches LOAD_SAVED_INVOICE with the full saved entry as payload. */
  function handleLoad(entry: SavedInvoice) {
    dispatch({ type: 'LOAD_SAVED_INVOICE', payload: entry });
  }

  return (
    <div style={{ minWidth: '280px' }}>
      <h2>Saved Invoices</h2>
      {savedInvoices.length === 0 ? (
        <p>No saved invoices</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {savedInvoices.map((entry, index) => (
            <li
              key={`${entry.invoiceNumber}-${index}`}
              style={{ marginBottom: '0.75rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}
            >
              <div>
                <strong>#{entry.invoiceNumber}</strong> — {entry.clientName}
              </div>
              <div>
                {entry.issueDate} | Total: {entry.total}
              </div>
              <button type="button" onClick={() => handleLoad(entry)}>
                Load
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
