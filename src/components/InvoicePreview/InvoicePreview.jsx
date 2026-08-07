import React, { useRef, useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';
import { SendEmailModal } from '../SendEmailModal/SendEmailModal.jsx';
import './InvoicePreview.css';

/**
 * InvoicePreview component.
 * Displays the uploaded business logo if one exists, otherwise shows a grey
 * placeholder box in the logo position of the invoice.
 *
 * Provides a "Send by Email" button that opens the SendEmailModal, passing a
 * ref to the invoice DOM node so html2pdf.js can render it to a PDF.
 */
export function InvoicePreview() {
  const { logoDataUrl } = useInvoice();

  /** @type {React.RefObject<HTMLElement>} */
  const invoiceRef = useRef(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  return (
    <>
      <section
        className="invoice-preview"
        aria-label="Invoice preview"
        ref={invoiceRef}
      >
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
      </section>

      <div className="invoice-preview__toolbar">
        <button
          type="button"
          className="invoice-preview__send-btn"
          onClick={() => setIsSendModalOpen(true)}
        >
          Send by Email
        </button>
      </div>

      <SendEmailModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        invoiceRef={invoiceRef}
      />
    </>
  );
}
