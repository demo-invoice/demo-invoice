import React, { useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';
import { EmailInvoiceModal } from '../EmailInvoiceModal/EmailInvoiceModal.jsx';
import './InvoicePreview.css';

/**
 * Derive a simple invoice data object from the preview props.
 * In the current app the invoice fields live in the preview itself;
 * this object is passed to the email modal.
 *
 * @param {string|undefined} invoiceNumber
 * @param {string|undefined} invoiceDate
 * @param {Array<{description: string, amount: number}>} lineItems
 * @param {number} subtotal
 * @param {number} tax
 * @param {number} total
 */
function buildInvoiceData(invoiceNumber, invoiceDate, lineItems, subtotal, tax, total) {
  return { invoiceNumber, invoiceDate, lineItems, subtotal, tax, total };
}

/**
 * InvoicePreview component.
 * Displays the uploaded business logo if one exists, otherwise shows a grey
 * placeholder box in the logo position of the invoice.
 *
 * Shows a "Send by Email" button only when the invoice has at least one line
 * item and a positive total (AC#1).
 */
export function InvoicePreview({
  invoiceNumber,
  invoiceDate,
  lineItems = [],
  subtotal = 0,
  tax = 0,
  total = 0,
}) {
  const { logoDataUrl, invoiceStatus, dispatchInvoice } = useInvoice();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AC#1: button only visible when there is ≥1 line item and total > 0.
  const canSendEmail = lineItems.length > 0 && total > 0;

  const invoiceData = buildInvoiceData(
    invoiceNumber,
    invoiceDate,
    lineItems,
    subtotal,
    tax,
    total
  );

  const handleSent = () => {
    // Dispatch only after confirmed successful send (not optimistically).
    dispatchInvoice({ type: 'MARK_AS_SENT' });
    setIsModalOpen(false);
  };

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

        {invoiceStatus === 'Sent' && (
          <span className="invoice-preview__status-badge">Sent</span>
        )}

        {canSendEmail && (
          <button
            className="invoice-preview__send-btn"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            Send by Email
          </button>
        )}
      </div>

      <EmailInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSent={handleSent}
        invoiceData={invoiceData}
      />
    </section>
  );
}
