import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UPDATE_INVOICE_STATUS } from '../../context/InvoiceContext.jsx';

/**
 * Validate an email address string.
 * Returns an error message string, or null if valid.
 * @param {string} email
 * @returns {string|null}
 */
function validateEmail(email) {
  if (!email || email.trim() === '') return 'Email address is required.';
  if (!email.includes('@')) return 'Please enter a valid email address.';
  return null;
}

/**
 * Modal for sending the current invoice by email.
 * POSTs the full invoice payload to the Supabase Edge Function.
 *
 * @param {{ invoice: object, dispatch: function, onClose: function }} props
 */
export function SendEmailModal({ invoice, dispatch, onClose }) {
  const [recipientEmail, setRecipientEmail] = useState(
    invoice.clientEmail || ''
  );
  const [validationError, setValidationError] = useState(null);
  const [uiState, setUiState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [apiError, setApiError] = useState(null);

  const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

  /** @param {React.FormEvent} e */
  async function handleSubmit(e) {
    e.preventDefault();

    const error = validateEmail(recipientEmail);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setUiState('loading');
    setApiError(null);

    try {
      const response = await fetch(
        `${functionsUrl}/send-invoice`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...invoice, recipientEmail }),
        }
      );

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error');
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      dispatch({ type: UPDATE_INVOICE_STATUS, payload: 'sent' });
      setUiState('success');
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
      setUiState('error');
    }
  }

  const isLoading = uiState === 'loading';

  if (uiState === 'success') {
    return (
      <div role="dialog" aria-modal="true" aria-labelledby="send-email-title">
        <h2 id="send-email-title">Send Invoice by Email</h2>
        <p>Invoice sent successfully to {recipientEmail}.</p>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="send-email-title">
      <h2 id="send-email-title">Send Invoice by Email</h2>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="recipient-email">Recipient email</label>
        <input
          id="recipient-email"
          type="email"
          value={recipientEmail}
          onChange={(e) => {
            setRecipientEmail(e.target.value);
            if (validationError) setValidationError(null);
          }}
          aria-invalid={!!validationError}
          aria-describedby={validationError ? 'email-error' : undefined}
          disabled={isLoading}
        />

        {validationError && (
          <p id="email-error" role="alert">
            {validationError}
          </p>
        )}

        {uiState === 'error' && apiError && (
          <p role="alert">{apiError}</p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending…' : 'Send'}
        </button>
        <button type="button" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
      </form>
    </div>
  );
}

SendEmailModal.propTypes = {
  invoice: PropTypes.shape({
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
    invoiceNumber: PropTypes.string,
    invoiceDate: PropTypes.string,
    dueDate: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
