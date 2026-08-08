import React, { useState } from 'react';
import { SEND_INVOICE_EMAIL_URL } from '../../config/emailConfig.js';

/** Simple email regex — rejects missing @ and missing domain segment. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email string.
 * @param {string} raw - Raw value from the input.
 * @returns {string} Empty string when valid; human-readable error message otherwise.
 */
function validateEmail(raw) {
  const trimmed = raw.trim();
  if (trimmed === '') return 'Email is required';
  if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address';
  return '';
}

/**
 * SendInvoiceModal
 *
 * Renders a modal dialog that lets the user send the current invoice to an
 * email address. Performs client-side validation before making any network
 * request. Calls onSuccess when the server responds with response.ok; keeps
 * the modal open and shows an inline error on failure.
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen    - Whether the modal is visible.
 * @param {Function} props.onClose   - Called when the user dismisses the modal.
 * @param {Function} props.onSuccess - Called with no arguments on a successful send.
 * @param {string}   [props.invoiceId] - Optional invoice identifier sent to the API.
 */
export function SendInvoiceModal({ isOpen, onClose, onSuccess, invoiceId }) {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  /** Reset transient state and call onClose. */
  function handleClose() {
    setEmail('');
    setValidationError('');
    setServerError('');
    setLoading(false);
    onClose();
  }

  /**
   * Handles form submission: validates, then POSTs to the configured endpoint.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const error = validateEmail(email);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setServerError('');
    setLoading(true);

    try {
      const response = await fetch(SEND_INVOICE_EMAIL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), invoiceId }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      // Success — let InvoicePreview handle the success banner.
      setEmail('');
      setLoading(false);
      onSuccess();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to send invoice. Please try again.'
      );
      setLoading(false);
    }
  }

  const displayError = validationError || serverError;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
      <div className="modal-dialog">
        <h2 className="modal-heading" id="modal-heading">
          Send Invoice by Email
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="modal-email-input" className="modal-label">
            Recipient email address
          </label>
          <input
            id="modal-email-input"
            className="modal-email-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="you@example.com"
            disabled={loading}
            aria-describedby={displayError ? 'modal-error-msg' : undefined}
            aria-invalid={displayError ? 'true' : 'false'}
          />

          {displayError && (
            <p className="modal-error" id="modal-error-msg" role="alert">
              {displayError}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
