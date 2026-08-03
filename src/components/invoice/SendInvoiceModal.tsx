/**
 * SendInvoiceModal — dialog with recipient/subject/message fields.
 *
 * Uses useSendInvoice internally. Resets all state on close (unmount).
 */
import React, { useEffect } from 'react';
import type { Invoice } from '../../types/invoice';
import { useSendInvoice } from '../../hooks/useSendInvoice';
import { isValidEmail } from '../../utils/validateEmail';

export interface SendInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

/**
 * Modal form for sending an invoice by email via mailto:.
 */
export function SendInvoiceModal({ invoice, onClose }: SendInvoiceModalProps) {
  const {
    recipient,
    subject,
    message,
    isSending,
    isSuccess,
    error,
    recipientError,
    setRecipient,
    setSubject,
    setMessage,
    triggerSend,
    reset,
  } = useSendInvoice(invoice);

  // Reset all local state when the modal unmounts (closed mid-flight).
  useEffect(() => () => reset(), [reset]);

  const canSend = isValidEmail(recipient) && !isSending;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: '1.1rem' }}>
            Send Invoice #{invoice.invoiceNumber}
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            style={closeBtnStyle}
          >
            ✕
          </button>
        </div>

        {/* Success banner */}
        {isSuccess && (
          <div role="status" style={successBannerStyle}>
            ✓ Your mail client has been opened with the invoice pre-filled.
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div role="alert" style={errorBannerStyle}>
            ⚠ {error}
          </div>
        )}

        <label style={labelStyle} htmlFor="recipient">
          Recipient email <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="recipient"
          type="email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="client@example.com"
          style={inputStyle}
          aria-describedby={recipientError ? 'recipient-error' : undefined}
          aria-invalid={recipientError ? true : undefined}
        />
        {recipientError && (
          <span id="recipient-error" role="alert" style={fieldErrorStyle}>
            {recipientError}
          </span>
        )}

        <label style={labelStyle} htmlFor="subject">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={`Invoice #${invoice.invoiceNumber} from ${invoice.companyName}`}
          style={inputStyle}
        />

        <label style={labelStyle} htmlFor="message">
          Message (optional)
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a personal note..."
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        <div style={footerStyle}>
          <button
            type="button"
            onClick={onClose}
            style={cancelBtnStyle}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={triggerSend}
            disabled={!canSend}
            aria-busy={isSending}
            style={{
              ...sendBtnStyle,
              opacity: canSend ? 1 : 0.5,
              cursor: canSend ? 'pointer' : 'not-allowed',
            }}
          >
            {isSending ? 'Opening mail client…' : 'Send Invoice'}
          </button>
        </div>

        <p style={disclaimerStyle}>
          This will open your default mail client with the invoice pre-filled.
          PDF attachments are not supported via this method — upgrade path
          available in the follow-up ticket.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles (inline — no CSS module dependency)
// ---------------------------------------------------------------------------

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#fff', borderRadius: '0.5rem',
  padding: '1.5rem', width: '100%', maxWidth: '480px',
  display: 'flex', flexDirection: 'column', gap: '0.5rem',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '0.5rem',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: '1.1rem',
  cursor: 'pointer', color: '#6b7280',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginTop: '0.25rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db', borderRadius: '0.375rem',
  fontSize: '0.9rem', boxSizing: 'border-box',
};

const fieldErrorStyle: React.CSSProperties = {
  fontSize: '0.8rem', color: '#dc2626',
};

const successBannerStyle: React.CSSProperties = {
  background: '#d1fae5', color: '#065f46',
  padding: '0.6rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem',
};

const errorBannerStyle: React.CSSProperties = {
  background: '#fee2e2', color: '#991b1b',
  padding: '0.6rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem',
};

const footerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem', background: '#f3f4f6',
  border: '1px solid #d1d5db', borderRadius: '0.375rem',
  cursor: 'pointer', fontSize: '0.9rem',
};

const sendBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem', background: '#2563eb',
  color: '#fff', border: 'none', borderRadius: '0.375rem',
  fontSize: '0.9rem', fontWeight: 600,
};

const disclaimerStyle: React.CSSProperties = {
  fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem',
};
