import React, { useState, useEffect, useRef } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address string.
 * @param {string} email
 * @returns {string} Error message, or empty string if valid.
 */
function validateEmail(email) {
  if (!email || email.trim() === '') return 'Email address is required.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
  return '';
}

/**
 * Modal dialog for sending the current invoice by email.
 * POSTs to the Supabase Edge Function at VITE_SUPABASE_FUNCTIONS_URL/send-invoice.
 *
 * @param {{ invoice: object, onClose: () => void }} props
 */
export function SendEmailModal({ invoice, onClose }) {
  const { dispatch } = useInvoice();
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [apiError, setApiError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Handles form submission: validates email then calls the Edge Function.
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
    setApiError('');
    setStatus('loading');

    const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
    if (!functionsUrl) {
      if (mountedRef.current) {
        setApiError('Email service is not configured. Please contact support.');
        setStatus('error');
      }
      return;
    }

    try {
      const response = await fetch(`${functionsUrl}/send-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), invoice }),
      });

      if (!mountedRef.current) return;

      if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        try {
          const body = await response.json();
          if (body && body.error) message = body.error;
        } catch {
          // use default message
        }
        setApiError(message);
        setStatus('error');
        return;
      }

      setStatus('success');
      dispatch({ type: 'UPDATE_INVOICE_STATUS', payload: 'sent' });
    } catch (err) {
      if (!mountedRef.current) return;
      setApiError('Network error — please check your connection and try again.');
      setStatus('error');
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
    if (validationError) setValidationError('');
  }

  const isLoading = status === 'loading';

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="send-email-modal-title" className="send-email-modal__overlay">
      <div className="send-email-modal__box">
        <h2 id="send-email-modal-title">Send Invoice by Email</h2>

        {status === 'success' ? (
          <div className="send-email-modal__success">
            <p>Invoice sent successfully to <strong>{email.trim()}</strong>.</p>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="send-email-modal__field">
              <label htmlFor="send-email-input">Recipient email address</label>
              <input
                id="send-email-input"
                type="email"
                value={email}
                onChange={handleEmailChange}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? 'send-email-error' : undefined}
                disabled={isLoading}
                autoComplete="email"
              />
              {validationError && (
                <span id="send-email-error" role="alert" className="send-email-modal__field-error">
                  {validationError}
                </span>
              )}
            </div>

            {apiError && (
              <p role="alert" className="send-email-modal__api-error">{apiError}</p>
            )}

            <div className="send-email-modal__actions">
              <button type="button" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
