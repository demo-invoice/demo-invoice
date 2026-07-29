import React from 'react';
import { useInvoice } from '../context/InvoiceContext.jsx';

/**
 * Invoice preview panel.
 * Shows a grey placeholder when no logo is set;
 * swaps to an <img> with constrained dimensions when a logo is loaded.
 */
export function InvoicePreview() {
  const { logo } = useInvoice();

  return (
    <section
      aria-label="Invoice preview"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '24px',
        minWidth: '320px',
        backgroundColor: '#ffffff',
      }}
    >
      <h2 style={{ marginTop: 0 }}>Invoice Preview</h2>

      <div style={{ marginBottom: '16px' }}>
        {logo ? (
          <img
            src={logo}
            alt="Business logo"
            style={{
              maxWidth: '160px',
              maxHeight: '80px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        ) : (
          <div
            aria-label="Logo placeholder"
            style={{
              width: '160px',
              height: '80px',
              backgroundColor: '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: '0.75rem',
            }}
          >
            No logo
          </div>
        )}
      </div>

      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        Your invoice details will appear here.
      </p>
    </section>
  );
}
