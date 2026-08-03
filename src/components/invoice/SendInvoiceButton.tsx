/**
 * SendInvoiceButton — opens the SendInvoiceModal when clicked.
 */
import React, { useState } from 'react';
import type { Invoice } from '../../types/invoice';
import { SendInvoiceModal } from './SendInvoiceModal';

export interface SendInvoiceButtonProps {
  invoice: Invoice;
}

/**
 * Button that triggers the Send Invoice modal.
 * Accepts the invoice as a prop so it can be used in any context consumer.
 */
export function SendInvoiceButton({ invoice }: SendInvoiceButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        style={buttonStyle}
      >
        ✉ Send Invoice
      </button>

      {isModalOpen && (
        <SendInvoiceModal
          invoice={invoice}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: 600,
};
