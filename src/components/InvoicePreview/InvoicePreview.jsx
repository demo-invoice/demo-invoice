import React, { useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';
import { SendEmailModal } from '../SendEmailModal/SendEmailModal.jsx';
import './InvoicePreview.css';

/**
 * InvoicePreview component.
 * Displays the uploaded business logo if one exists, otherwise shows a grey
 * placeholder box in the logo position of the invoice.
 * Provides a "Send by Email" button to open the SendEmailModal.
 */
export function InvoicePreview() {
  const { logoDataUrl } = useInvoice();
  const [showEmailModal, setShowEmailModal] = useState(false);

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

      <div className="invoice-preview__actions">
        <button
          type="button"
          onClick={() => setShowEmailModal(true)}
        >
          Send by Email
        </button>
      </div>

      {showEmailModal && (
        <SendEmailModal
          onClose={() => setShowEmailModal(false)}
          invoiceData={{ logoDataUrl }}
        />
      )}
    </section>
  );
}
