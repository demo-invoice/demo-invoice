/**
 * Panel displaying the list of saved invoice history entries.
 */
import type { SavedInvoiceEntry } from '../types/invoice';

interface InvoiceHistoryProps {
  savedInvoices: SavedInvoiceEntry[];
  onLoad: (entry: SavedInvoiceEntry) => void;
}

/**
 * Renders saved invoice entries with a Load button per entry.
 * Shows an empty-state message when the list is empty.
 */
export function InvoiceHistory({ savedInvoices, onLoad }: InvoiceHistoryProps) {
  return (
    <aside style={{ minWidth: 280, maxHeight: '80vh', overflowY: 'auto', borderLeft: '1px solid #ccc', paddingLeft: 16 }}>
      <h2>Invoice History</h2>
      {savedInvoices.length === 0 ? (
        <p>No saved invoices yet. Click "Save Invoice" to save the current invoice.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {savedInvoices.map((entry) => (
            <li key={entry.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
              <div><strong>{entry.label}</strong></div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>
                Saved: {new Date(entry.savedAt).toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => onLoad(entry)}
                style={{ marginTop: 4 }}
              >
                Load
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
