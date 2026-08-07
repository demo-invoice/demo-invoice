import React, { useState, useCallback, useEffect } from 'react';
import { sendInvoiceEmail } from '../../services/emailService.js';
import './SendEmailModal.css';

/** @typedef {'idle'|'loading'|'success'|'error'} SendStatus */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate an email string.
 * @param {string} email
 * @returns {string} Error message, or empty string if valid.
 */
function validateEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) return 'Email address is required.';
  if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address.';
  return '';
}

/**
 * Modal for sending the current invoice by email.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   invoiceRef: React.RefObject<HTMLElement>
 * }} props
 */
export function SendEmailModal({ isOpen, onClose, invoiceRef }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  /** @type {[SendStatus, React.Dispatch<React.SetStateAction<SendStatus>>]} */
  const [status, setStatus] = useState(/** @type {SendStatus} */ ('idle'));
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setEmailError('');
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  // Close on Escape key — but not while loading
  useEffect(() => {
    if (!isOpen) return;
    /** @param {KeyboardEvent} e */
    function handleKeyDown(e) {
      if (e.key === 'Escape' && status !== 'loading') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, status, onClose]);

  const handleSubmit = useCallback(
    async (/** @type {React.FormEvent<HTMLFormElement>} */ e) => {
      e.preventDefault();
      const trimmedEmail = email.trim();
      const validationError = validateEmail(trimmedEmail);
      if (validationError) {
        setEmailError(validationError);
        return;
      }
      setEmailError('');
      setStatus('loading');
      setErrorMessage('');

      try {
        await sendInvoiceEmail(trimmedEmail, invoiceRef.current);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
        );
      }
    },
    [email, invoiceRef]
  );

  const handleClose = useCallback(() => {
    if (status === 'loading') return; // block close during send
    onClose();
  }, [status, onClose]);

  if (!isOpen) return null;

  const isLoading = status === 'loading';

  return (
    <div
      className="send-email-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-email-modal-title"
    >
      <div className="send-email-modal__dialog">
        <h2 id="send-email-modal-title" className="send-email-modal__title">
          Send Invoice by Email
        </h2>

        {status === 'success' ? (
          <div className="send-email-modal__success" role="status">
            <p>Invoice sent successfully!</p>
            <button
              type="button"
              className="send-email-modal__btn send-email-modal__btn--primary"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="send-email-modal__field">
              <label
                htmlFor="send-email-input"
                className="send-email-modal__label"
              >
                Recipient email address
              </label>
              <input
                id="send-email-input"
                type="email"
                className={`send-email-modal__input${
                  emailError ? ' send-email-modal__input--error' : ''
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                disabled={isLoading}
                aria-describedby={emailError ? 'send-email-error' : undefined}
                autoComplete="email"
              />
              {emailError && (
                <span
                  id="send-email-error"
                  className="send-email-modal__field-error"
                  role="alert"
                >
                  {emailError}
                </span>
              )}
            </div>

            {status === 'error' && (
              <p className="send-email-modal__send-error" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="send-email-modal__actions">
              <button
                type="button"
                className="send-email-modal__btn send-email-modal__btn--secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="send-email-modal__btn send-email-modal__btn--primary"
                disabled={isLoading}
              >
                {isLoading ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
