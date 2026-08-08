import React, { useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';
import { SendInvoiceModal } from './SendInvoiceModal.jsx';
import './InvoicePreview.css';

/**
 * InvoicePreview component.
 *
 * Displays the uploaded business logo (or a grey placeholder), the invoice
 * body, and a "Send Invoice by Email" button that opens the SendInvoiceModal.
 * On a successful send the modal closes and a success banner is shown here.
 */
export function InvoicePreview() {
  const { logoDataUrl } = useInvoice();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /** Opens the send-email modal and clears any previous success banner. */
  function handleOpenModal() {
    setSuccessMessage('');
    setIsModalOpen(true);
  }

  /** Closes the modal without triggering a success message. */
  function handleCloseModal() {
    setIsModalOpen(false);
  }

  /** Called by SendInvoiceModal when the server confirms the email was sent. */
  function handleSendSuccess() {
    setIsModalOpen(false);
    setSuccessMessage('Invoice sent successfully!');
  }

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

      {successMessage && (
        <p className="modal-success" role="status">
          {successMessage}
        </p>
      )}

      <button
        type="button"
        className="send-invoice-btn"
        onClick={handleOpenModal}
      >
        Send Invoice by Email
      </button>

      <SendInvoiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSendSuccess}
        invoiceId={undefined}
      />
    </section>
  );
}
