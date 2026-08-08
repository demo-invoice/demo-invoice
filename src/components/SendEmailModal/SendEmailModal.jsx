import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useInvoice, UPDATE_INVOICE_STATUS } from '../../context/InvoiceContext.jsx';

/** Simple RFC-5322-ish email regex — good enough for UX validation. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate an email address string.
 * @param {string} value
 * @returns {string} Error message, or empty string when valid.
 */
function validateEmail(value) {
  if (!value || !value.trim()) return 'Email address is required.';
  if (!EMAIL_RE.test(value.trim())) return 'Please enter a valid email address.';
  return '';
}

/**
 * Modal that lets the user send the current invoice by email.
 * Calls the Supabase Edge Function at VITE_SUPABASE_FUNCTIONS_URL.
 * Dispatches UPDATE_INVOICE_STATUS('Sent') on success.
 *
 * @param {{ invoice: InvoiceShape, onClose: () => void }} props
 */
export function SendEmailModal({ invoice, onClose }) {
  const { dispatch } = useInvoice();

  const [email, setEmail] = useState(invoice.clientEmail || '');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const emailInvalid = emailError !== '';

  /** Reset all local state and close the modal. */
  const handleClose = useCallback(() => {
    setEmail('');
    setEmailError('');
    setLoading(false);
    setApiError('');
    onClose();
  }, [onClose]);

  /**
   * Handle form submission: validate, call Edge Function, handle result.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const validationError = validateEmail(email);
      if (validationError) {
        setEmailError(validationError);
        return;
      }

      setEmailError('');
      setApiError('');

      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
      if (!functionsUrl) {
        setApiError(
          'Email service is not configured. Please contact support.'
        );
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `${functionsUrl}/send-invoice`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: email.trim(), invoice }),
          }
        );

        if (!response.ok) {
          let message = `Request failed (${response.status}).`;
          try {
            const body = await response.json();
            if (body && typeof body.error === 'string') {
              message = body.error;
            }
          } catch {
            // Body wasn't JSON — keep the status-based message.
          }
          setApiError(message);
          setLoading(false);
          return;
        }

        // Success path
        dispatch({ type: UPDATE_INVOICE_STATUS, payload: 'Sent' });
        handleClose();
      } catch (err) {
        setApiError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.'
        );
        setLoading(false);
      }
    },
    [email, invoice, dispatch, handleClose]
  );

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="send-email-title">
      <div>
        <h2 id="send-email-title">Send Invoice by Email</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="send-email-input">Recipient email</label>
          <input
            id="send-email-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(validateEmail(e.target.value));
            }}
            aria-invalid={emailInvalid ? 'true' : 'false'}
            aria-describedby={emailInvalid ? 'send-email-error' : undefined}
            disabled={loading}
          />

          {emailInvalid && (
            <span id="send-email-error" role="alert">
              {emailError}
            </span>
          )}

          {apiError && (
            <span role="alert">
              {apiError}
            </span>
          )}

          <div>
            <button type="button" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const lineItemShape = PropTypes.shape({
  description: PropTypes.string,
  quantity: PropTypes.number,
  rate: PropTypes.number,
  amount: PropTypes.number,
});

SendEmailModal.propTypes = {
  invoice: PropTypes.shape({
    invoiceNumber: PropTypes.string,
    invoiceDate: PropTypes.string,
    dueDate: PropTypes.string,
    clientName: PropTypes.string,
    clientEmail: PropTypes.string,
    lineItems: PropTypes.arrayOf(lineItemShape),
    subtotal: PropTypes.number,
    tax: PropTypes.number,
    total: PropTypes.number,
    status: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
