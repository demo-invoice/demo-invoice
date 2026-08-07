import React, { useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';
import { SendEmailModal } from '../SendEmailModal/SendEmailModal.jsx';

/**
 * Displays a preview of the invoice, including the uploaded logo (if any),
 * invoice details, and an action to send by email.
 */
export function InvoicePreview({ invoiceData }) {
  const { logoDataUrl } = useInvoice();
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <section aria-label="Invoice preview" className="invoice-preview">
      <div className="invoice-preview__logo-area">
        {logoDataUrl ? (
          <img
            src={logoDataUrl}
            alt="Business logo"
            style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
          />
        ) : (
          <div
            aria-label="Logo placeholder"
            className="logo-placeholder"
          />
        )}
      </div>

      <div className="invoice-preview__body">
        <h2 className="invoice-preview__title">Invoice</h2>
        <p className="invoice-preview__hint">Your invoice details will appear here.</p>
      </div>

      <div className="invoice-preview__actions">
        <button type="button" onClick={() => setShowEmailModal(true)}>
          Send by Email
        </button>
      </div>

      {showEmailModal && (
        <SendEmailModal
          onClose={() => setShowEmailModal(false)}
          invoiceData={invoiceData}
        />
      )}
    </section>
  );
}
