import React, { useState } from 'react';
import { sendInvoiceEmail } from '../../services/emailService.js';
import { useInvoiceContext } from '../../context/InvoiceContext.jsx';

/**
 * @typedef {Object} SendEmailModalProps
 * @property {() => void} onClose - Callback to close the modal.
 * @property {Record<string, unknown>} [invoiceData] - Invoice data passed to the email service.
 */

/** Basic email format validation. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Modal for sending an invoice by email.
 * Renders a recipient email input, optional message textarea,
 * and Send / Cancel buttons. Dispatches SEND_EMAIL on success.
 *
 * @param {SendEmailModalProps} props
 */
export function SendEmailModal({ onClose, invoiceData }) {
  const { dispatch } = useInvoiceContext();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [status, setStatus] = useState(/** @type {'idle'|'loading'|'success'|'error'} */ ('idle'));
  const [errorMessage, setErrorMessage] = useState('');

  const hasInvoiceData = invoiceData != null;

  /**
   * Validates inputs and sends the invoice email.
   * Dispatches { type: 'SEND_EMAIL' } only on success.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError('');
    setErrorMessage('');

    if (!recipientEmail.trim()) {
      setValidationError('Recipient email is required.');
      return;
    }
    if (!isValidEmail(recipientEmail.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!hasInvoiceData) {
      setValidationError('No invoice data available to send.');
      return;
    }

    setStatus('loading');

    try {
      await sendInvoiceEmail({
        recipientEmail: recipientEmail.trim(),
        message,
        invoiceData,
      });
      dispatch({ type: 'SEND_EMAIL' });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to send email. Please try again.'
      );
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="send-email-heading">
      <h2 id="send-email-heading">Send Invoice by Email</h2>

      {status === 'success' ? (
        <div>
          <p>Invoice sent successfully!</p>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="recipient-email">Recipient Email</label>
            <input
              id="recipient-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              disabled={status === 'loading'}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="email-message">Message (optional)</label>
            <textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              disabled={status === 'loading'}
              rows={4}
            />
          </div>

          {validationError && (
            <p role="alert">{validationError}</p>
          )}

          {status === 'error' && (
            <p role="alert">{errorMessage}</p>
          )}

          {!hasInvoiceData && (
            <p role="alert">No invoice data available.</p>
          )}

          <div>
            <button
              type="submit"
              disabled={status === 'loading' || !hasInvoiceData}
            >
              {status === 'loading' ? 'Sending…' : 'Send'}
            </button>
            <button type="button" onClick={onClose} disabled={status === 'loading'}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
