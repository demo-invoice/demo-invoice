import React, { useState } from 'react';
import { UPDATE_INVOICE_STATUS } from '../../context/InvoiceContext.jsx';

/**
 * @typedef {Object} LineItem
 * @property {string} description
 * @property {number} quantity
 * @property {number} unitPrice
 */

/**
 * @typedef {Object} LiveInvoice
 * @property {string} invoiceNumber
 * @property {string} clientName
 * @property {string} clientEmail
 * @property {LineItem[]} lineItems
 * @property {number} subtotal
 * @property {number} tax
 * @property {number} total
 * @property {string} invoiceDate
 * @property {string} dueDate
 * @property {string} status
 * @property {string|null} logoDataUrl
 */

/** Simple email format check. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * Modal that lets the user send the current invoice by email.
 *
 * @param {{
 *   liveInvoice: LiveInvoice,
 *   dispatch: React.Dispatch<{type: string, value?: unknown}>,
 *   onClose: () => void,
 * }} props
 */
export function SendInvoiceModal({ liveInvoice, dispatch, onClose }) {
  const [recipientEmail, setRecipientEmail] = useState(liveInvoice.clientEmail ?? '');
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [apiError, setApiError] = useState('');

  const emailInvalid = !isValidEmail(recipientEmail);
  const showValidationError = touched && emailInvalid;

  /**
   * Calls the Supabase Edge Function with the full liveInvoice payload.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (emailInvalid) return;

    setSending(true);
    setApiError('');

    try {
      const payload = { ...liveInvoice, recipientEmail };
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/send-invoice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed with status ${res.status}`);
      }

      dispatch({ type: UPDATE_INVOICE_STATUS, value: 'Sent' });
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setSending(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="send-invoice-title">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <h2 id="send-invoice-title">Send Invoice by Email</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="recipient-email">Recipient email</label>
          <input
            id="recipient-email"
            type="email"
            value={recipientEmail}
            onChange={(e) => {
              setRecipientEmail(e.target.value);
              setApiError('');
            }}
            onBlur={() => setTouched(true)}
            aria-invalid={showValidationError ? 'true' : 'false'}
            aria-describedby={showValidationError ? 'email-error' : undefined}
            disabled={sending}
          />

          {showValidationError && (
            <span id="email-error" role="alert">
              Please enter a valid email address.
            </span>
          )}

          {apiError && (
            <span role="alert" data-testid="api-error">
              {apiError}
            </span>
          )}

          <div className="modal__actions">
            <button type="button" onClick={onClose} disabled={sending}>
              Cancel
            </button>
            <button type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
