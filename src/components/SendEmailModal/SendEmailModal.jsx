import React, { useState } from 'react';
import PropTypes from 'prop-types';

/** Simple email format check. */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Modal dialog for sending an invoice by email.
 *
 * States:
 *  - idle   → form visible, buttons enabled
 *  - loading → buttons disabled, Send shows "Sending…"
 *  - success → confirmation message + Close button
 *  - error   → user-facing error message, form stays open
 *
 * @param {{ invoice: object, onClose: () => void }} props
 */
export function SendEmailModal({ invoice, onClose }) {
  const [email, setEmail] = useState(invoice.clientEmail ?? '');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const emailInvalid = touched && !isValidEmail(email);

  /** Handle form submission — validate, call edge function, update state. */
  async function handleSend() {
    setTouched(true);
    if (!isValidEmail(email)) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ?? '';
      const response = await fetch(`${baseUrl}/send-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invoice, recipientEmail: email.trim() }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed with status ${response.status}`);
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  }

  const isLoading = status === 'loading';

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="send-email-modal-title">
      <h2 id="send-email-modal-title">Send Invoice by Email</h2>

      {status === 'success' ? (
        <div>
          <p>Invoice sent successfully to {email.trim()}.</p>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      ) : (
        <div>
          <div>
            <label htmlFor="recipient-email">Recipient email</label>
            <input
              id="recipient-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={emailInvalid ? 'true' : 'false'}
              aria-describedby={emailInvalid ? 'email-error' : undefined}
              disabled={isLoading}
            />
            {emailInvalid && (
              <span id="email-error" role="alert">
                Please enter a valid email address.
              </span>
            )}
          </div>

          {status === 'error' && (
            <p role="alert">{errorMessage}</p>
          )}

          <div>
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading}
            >
              {isLoading ? 'Sending…' : 'Send'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

SendEmailModal.propTypes = {
  invoice: PropTypes.shape({
    invoiceNumber: PropTypes.string,
    invoiceDate: PropTypes.string,
    dueDate: PropTypes.string,
    clientName: PropTypes.string,
    clientEmail: PropTypes.string,
    lineItems: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string,
        quantity: PropTypes.number,
        unitPrice: PropTypes.number,
      })
    ),
    subtotal: PropTypes.number,
    tax: PropTypes.number,
    total: PropTypes.number,
    status: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
