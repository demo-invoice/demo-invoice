/**
 * InvoiceView
 *
 * Displays the current invoice and provides:
 *  - "Send Invoice" button → opens SendInvoiceModal
 *  - Status badge
 *  - Toast notification after successful send
 */
import React, { useState } from 'react';
import { useInvoice } from '@/context/InvoiceContext';
import { SendInvoiceModal } from './SendInvoiceModal';
import { Toast } from './Toast';

export function InvoiceView() {
  const { invoice } = useInvoice();
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  function handleSuccess() {
    setModalOpen(false);
    setToastMessage(`Invoice #${invoice.number} sent successfully!`);
  }

  const total = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Invoice #{invoice.number}</h1>
        <span style={statusBadge(invoice.status)}>{invoice.status}</span>
      </div>

      <section style={{ marginTop: 24 }}>
        <p><strong>Client:</strong> {invoice.clientName || '—'}</p>
        <p><strong>Email:</strong> {invoice.clientEmail || '—'}</p>
        <p><strong>Issue Date:</strong> {invoice.issueDate || '—'}</p>
        <p><strong>Due Date:</strong> {invoice.dueDate || '—'}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Line Items</h2>
        {invoice.lineItems.length === 0 ? (
          <p style={{ color: '#888' }}>No line items added.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={th}>Description</th>
                <th style={th}>Qty</th>
                <th style={th}>Unit Price</th>
                <th style={th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id}>
                  <td style={td}>{item.description}</td>
                  <td style={td}>{item.quantity}</td>
                  <td style={td}>${item.unitPrice.toFixed(2)}</td>
                  <td style={td}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ textAlign: 'right', fontWeight: 'bold' }}>Total: ${total.toFixed(2)}</p>
      </section>

      {invoice.notes && (
        <section style={{ marginTop: 16 }}>
          <h2>Notes</h2>
          <p>{invoice.notes}</p>
        </section>
      )}

      <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
        <button
          onClick={() => setModalOpen(true)}
          style={primaryBtn}
        >
          Send Invoice
        </button>
      </div>

      {modalOpen && (
        <SendInvoiceModal
          invoice={invoice}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onDismiss={() => setToastMessage('')}
        />
      )}
    </main>
  );
}

function statusBadge(status: string): React.CSSProperties {
  const colors: Record<string, string> = {
    Draft: '#f0ad4e',
    Sent: '#5bc0de',
    Paid: '#5cb85c',
  };
  return {
    background: colors[status] ?? '#ccc',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: 13,
  };
}

const th: React.CSSProperties = { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #ddd' };
const td: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid #eee' };
const primaryBtn: React.CSSProperties = {
  background: '#0070f3', color: '#fff', border: 'none',
  padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 15,
};
