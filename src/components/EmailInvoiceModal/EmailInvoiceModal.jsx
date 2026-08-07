import React, { useState, useEffect, useCallback } from 'react';
import { sendInvoiceEmail } from '../../services/emailService.js';
import './EmailInvoiceModal.css';

/** Simple email format regex — catches missing @ and missing TLD. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @typedef {Object} InvoiceData
 * @property {string}  [invoiceNumber]
 * @property {string}  [invoiceDate]
 * @property {Array<{description: string, amount: number}>} lineItems
 * @property {number}  subtotal
 * @property {number}  tax
 * @property {number}  total
 */

/**
 * @typedef {Object} EmailInvoiceModalProps
 * @property {boolean}     isOpen       - Whether the modal is visible.
 * @property {() => void}  onClose      - Called when the modal should close.
 * @property {() => void}  onSent       - Called after a confirmed successful send.
 * @property {InvoiceData} invoiceData  - Invoice data to include in the email.
 */

/**
 * Modal for sending an invoice by email.
 * Validates input client-side, calls emailService, and reports success/error.
 * Dismissing via Cancel or backdrop resets the form without side effects.
 *
 * @param {EmailInvoiceModalProps} props
 */
export function EmailInvoiceModal({ isOpen, onClose, onSent, invoiceData }) {
  const [recipient, setRecipient] = useState('');
  const [subject,   setSubject]   = useState('');
  const [message,   setMessage]   = useState('');
  const [emailError, setEmailError] = useState('');
  const [status, setStatus] = useState(/** @type {'idle'|'sending'|'success'|'error'} */ ('idle'));
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form whenever the modal opens.
  useEffect(() => {
    if (isOpen) {
      setRecipient('');
      setSubject('');
      setMessage('');
      setEmailError('');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  const validate = useCallback(() => {
    if (!recipient.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(recipient.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  }, [recipient]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    setErrorMsg('');

    try {
      await sendInvoiceEmail(invoiceData, recipient.trim(), message.trim());
      setStatus('success');
      // Notify parent only after confirmed success.
      onSent();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg.includes('configuration missing')
          ? msg
          : 'Failed to send email. Please try again.'
      );
      setStatus('error');
    }
  }, [validate, invoiceData, recipient, message, onSent]);

  const handleClose = useCallback(() => {
    // No dispatch, no email sent — just close. Form resets on next open via useEffect.
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="email-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="email-modal">
        <h2 id="email-modal-title" className="email-modal__title">Send Invoice by Email</h2>

        {status === 'success' ? (
          <div className="email-modal__success" role="status">
            <p>Invoice sent successfully!</p>
            <button className="email-modal__btn email-modal__btn--primary" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="email-modal__field">
              <label htmlFor="email-recipient" className="email-modal__label">
                Recipient Email <span aria-hidden="true">*</span>
              </label>
              <input
                id="email-recipient"
                type="email"
                className={`email-modal__input${emailError ? ' email-modal__input--error' : ''}`}
                value={recipient}
                onChange={(e) => { setRecipient(e.target.value); setEmailError(''); }}
                aria-describedby={emailError ? 'email-error' : undefined}
                autoComplete="email"
                disabled={status === 'sending'}
              />
              {emailError && (
                <span id="email-error" className="email-modal__error" role="alert">
                  {emailError}
                </span>
              )}
            </div>

            <div className="email-modal__field">
              <label htmlFor="email-subject" className="email-modal__label">Subject (optional)</label>
              <input
                id="email-subject"
                type="text"
                className="email-modal__input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={status === 'sending'}
              />
            </div>

            <div className="email-modal__field">
              <label htmlFor="email-message" className="email-modal__label">Message (optional)</label>
              <textarea
                id="email-message"
                className="email-modal__textarea"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={status === 'sending'}
              />
            </div>

            {status === 'error' && (
              <p className="email-modal__error email-modal__error--block" role="alert">
                {errorMsg}
              </p>
            )}

            <div className="email-modal__actions">
              <button
                type="button"
                className="email-modal__btn email-modal__btn--secondary"
                onClick={handleClose}
                disabled={status === 'sending'}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="email-modal__btn email-modal__btn--primary"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Send Invoice'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
