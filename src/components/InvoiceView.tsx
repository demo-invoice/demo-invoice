import { useState } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { SendInvoiceModal } from './SendInvoiceModal';

/**
 * Top-level invoice view. Displays invoice details and provides
 * the "Send Invoice" button that opens the SendInvoiceModal.
 */
export function InvoiceView() {
  const { state } = useInvoice();
  const { invoice } = state;
  const [modalOpen, setModalOpen] = useState(false);

  const total = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 700, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#1a56db' }}>Invoice {invoice.invoiceNumber}</h1>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: '10px 22px', background: '#1a56db', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15,
          }}
        >
          Send Invoice
        </button>
      </div>

      <section style={{ marginTop: 16 }}>
        <p><strong>Issue Date:</strong> {invoice.issueDate}</p>
        <p><strong>Due Date:</strong> {invoice.dueDate || '—'}</p>
        <p><strong>From:</strong> {invoice.fromName} {invoice.fromEmail && `<${invoice.fromEmail}>`}</p>
        <p><strong>To:</strong> {invoice.toName} {invoice.toEmail && `<${invoice.toEmail}>`}</p>
      </section>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'left' }}>Description</th>
            <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>Qty</th>
            <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>Unit Price</th>
            <th style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: 12, textAlign: 'center', color: '#9ca3af' }}>
                No line items
              </td>
            </tr>
          ) : (
            invoice.lineItems.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.description}</td>
                <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}><strong>Total</strong></td>
            <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}><strong>${total.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>

      {invoice.notes && (
        <p style={{ marginTop: 24 }}><strong>Notes:</strong> {invoice.notes}</p>
      )}

      {modalOpen && <SendInvoiceModal onClose={() => setModalOpen(false)} />}
    </main>
  );
}
