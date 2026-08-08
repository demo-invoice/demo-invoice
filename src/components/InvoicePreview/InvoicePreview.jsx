import React from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';
import './InvoicePreview.css';

/**
 * InvoicePreview component.
 * Displays the uploaded business logo if one exists, otherwise shows a grey
 * placeholder box in the logo position of the invoice.
 *
 * @param {{ onSendEmail?: () => void }} props
 */
export function InvoicePreview({ onSendEmail }) {
  const { logoDataUrl } = useInvoice();

  return (
    <section className="invoice-preview" aria-label="Invoice preview">
      <div className="invoice-preview__logo-area">
        {logoDataUrl ? (
          <div className="logo-container">
            <img
              src={logoDataUrl}
              alt="Business logo"
              style={{
                maxWidth: '200px',
                maxHeight: '100px',
                objectFit: 'contain',
              }}
            />
          </div>
        ) : (
          <div className="logo-placeholder" aria-label="Logo placeholder" />
        )}
      </div>

      <div className="invoice-preview__body">
        <h2 className="invoice-preview__title">Invoice</h2>
        <p className="invoice-preview__hint">
          Your invoice details will appear here.
        </p>
      </div>

      {onSendEmail && (
        <div className="invoice-preview__actions">
          <button type="button" onClick={onSendEmail}>
            Send by Email
          </button>
        </div>
      )}
    </section>
  );
}
