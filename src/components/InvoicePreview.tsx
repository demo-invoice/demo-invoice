import { useInvoice } from '../context/InvoiceContext';

/**
 * Read-only invoice preview panel.
 * Renders the current InvoiceContext state as a styled invoice document.
 * Shows blank/default values when state has been reset.
 */
export function InvoicePreview() {
  const { state } = useInvoice();

  const total = state.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <section style={styles.section} aria-label="Invoice preview">
      <h2 style={styles.heading}>Preview</h2>
      <div style={styles.document}>
        <div style={styles.topRow}>
          <div>
            <p style={styles.label}>From</p>
            <p style={styles.value}>{state.fromName || '—'}</p>
            <p style={styles.value}>{state.fromEmail || '—'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={styles.invoiceTitle}>INVOICE</p>
            <p style={styles.value}>{state.invoiceNumber || '—'}</p>
          </div>
        </div>

        <div style={styles.topRow}>
          <div>
            <p style={styles.label}>Bill To</p>
            <p style={styles.value}>{state.toName || '—'}</p>
            <p style={styles.value}>{state.toEmail || '—'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={styles.label}>Issue Date</p>
            <p style={styles.value}>{state.issueDate || '—'}</p>
            <p style={styles.label}>Due Date</p>
            <p style={styles.value}>{state.dueDate || '—'}</p>
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Description</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Qty</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Unit Price</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {state.lineItems.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}>{item.description || '—'}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  {item.unitPrice.toFixed(2)}
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  {(item.quantity * item.unitPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                Total
              </td>
              <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                {total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        {state.notes && (
          <div style={styles.notes}>
            <p style={styles.label}>Notes</p>
            <p style={styles.value}>{state.notes}</p>
          </div>
        )}
      </div>
    </section>
  );
}

const styles = {
  section: { padding: '1rem', flex: 1, overflowY: 'auto' as const, background: '#f8fafc' },
  heading: { marginTop: 0, fontSize: '1.1rem', fontWeight: 700 },
  document: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem', maxWidth: '640px' },
  topRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' },
  invoiceTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 },
  label: { margin: '0 0 0.125rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const },
  value: { margin: '0 0 0.25rem', fontSize: '0.875rem', color: '#1e293b' },
  table: { width: '100%', borderCollapse: 'collapse' as const, marginBottom: '1rem' },
  th: { padding: '0.5rem', borderBottom: '2px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, textAlign: 'left' as const, color: '#475569' },
  td: { padding: '0.5rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#1e293b' },
  notes: { borderTop: '1px solid #e2e8f0', paddingTop: '1rem' },
} as const;
