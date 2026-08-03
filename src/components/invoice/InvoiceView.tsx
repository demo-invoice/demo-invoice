/**
 * InvoiceView — top-level invoice view component.
 *
 * Reads invoice state from InvoiceContext and renders invoice details
 * plus the SendInvoiceButton. Acts as the integration point for T24.
 */
import React from 'react';
import { useInvoiceContext } from '../../context/InvoiceContext';
import { SendInvoiceButton } from './SendInvoiceButton';

/**
 * Renders the full invoice and the Send Invoice action button.
 */
export function InvoiceView() {
  const { state } = useInvoiceContext();
  const { invoice } = state;

  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const tax = subtotal * invoice.taxRate;
  const total = subtotal + tax;

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div style={containerStyle}>
      <div style={topBarStyle}>
        <h1 style={{ margin: 0 }}>Invoice #{invoice.invoiceNumber}</h1>
        <SendInvoiceButton invoice={invoice} />
      </div>

      <div style={metaStyle}>
        <span><strong>From:</strong> {invoice.companyName}</span>
        <span><strong>To:</strong> {invoice.clientName || '—'}</span>
        <span><strong>Issued:</strong> {invoice.issuedAt}</span>
        {invoice.dueAt && <span><strong>Due:</strong> {invoice.dueAt}</span>}
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Unit Price</th>
            <th style={thStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ ...tdStyle, color: '#9ca3af', textAlign: 'center' }}>
                No line items
              </td>
            </tr>
          ) : (
            invoice.lineItems.map((item) => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.description}</td>
                <td style={tdStyle}>{item.quantity}</td>
                <td style={tdStyle}>{fmt(item.unitPrice)}</td>
                <td style={tdStyle}>{fmt(item.quantity * item.unitPrice)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={totalsStyle}>
        <div style={totalRowStyle}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div style={totalRowStyle}>
          <span>Tax ({(invoice.taxRate * 100).toFixed(0)}%)</span>
          <span>{fmt(tax)}</span>
        </div>
        <div style={{ ...totalRowStyle, fontWeight: 700, fontSize: '1.05rem' }}>
          <span>Total</span><span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  maxWidth: '720px', margin: '2rem auto', padding: '1.5rem',
  fontFamily: 'system-ui, sans-serif', color: '#111827',
};

const topBarStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', marginBottom: '1.25rem',
};

const metaStyle: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: '1rem',
  fontSize: '0.9rem', marginBottom: '1.5rem', color: '#374151',
};

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', marginBottom: '1rem',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '0.5rem 0.75rem',
  borderBottom: '2px solid #e5e7eb', fontSize: '0.85rem',
  color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '0.6rem 0.75rem', borderBottom: '1px solid #f3f4f6',
};

const totalsStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
  gap: '0.35rem', marginTop: '0.5rem',
};

const totalRowStyle: React.CSSProperties = {
  display: 'flex', gap: '2rem', fontSize: '0.95rem',
};
