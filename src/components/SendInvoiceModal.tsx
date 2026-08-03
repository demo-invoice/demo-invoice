import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { sendInvoice } from '../services/emailService';
import { validateEmail } from '../utils/validateEmail';
import { Toast } from './Toast';

interface SendInvoiceModalProps {
  onClose: () => void;
}

/**
 * Modal dialog for sending the current invoice by email.
 *
 * Features:
 * - RFC-5322-lite + HTML5 double-guard email validation
 * - Button disabled + loading state while request is in-flight
 * - AbortController cancels fetch when modal is closed mid-flight
 * - Success / error toast feedback
 */
export function SendInvoiceModal({ onClose }: SendInvoiceModalProps) {
  const { state, dispatch } = useInvoice();
  const [recipient, setRecipient] = useState('');
  const [validationError, setValidationError] = useState('');
  const [toast, setToast] = useState<{ variant: 'success' | 'error'; message: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isLoading = state.sendStatus === 'loading';

  // Cancel any in-flight request when the modal unmounts
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        dispatch({ type: 'SET_SEND_STATUS', payload: 'idle' });
      }
    };
  }, [dispatch]);

  function handleRecipientChange(value: string) {
    setRecipient(value);
    if (validationError) setValidationError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = recipient.trim();
    if (!validateEmail(trimmed)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setValidationError('');
    setToast(null);

    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'SET_SEND_STATUS', payload: 'loading' });

    const result = await sendInvoice(state.invoice, trimmed, controller.signal);

    abortRef.current = null;

    if (result.message === 'Request cancelled.') {
      // Modal was closed mid-flight; state already reset in cleanup
      return;
    }

    dispatch({
      type: 'SET_SEND_STATUS',
      payload: result.ok ? 'success' : 'error',
    });

    setToast({ variant: result.ok ? 'success' : 'error', message: result.message });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-modal-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 8, padding: 28,
          width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        <h2 id="send-modal-title" style={{ marginTop: 0 }}>Send Invoice by Email</h2>

        {toast && (
          <Toast variant={toast.variant} onDismiss={() => setToast(null)}>
            {toast.message}
          </Toast>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="recipient-email" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
            Recipient Email
          </label>
          <input
            id="recipient-email"
            type="email"
            value={recipient}
            onChange={(e) => handleRecipientChange(e.target.value)}
            placeholder="client@example.com"
            maxLength={254}
            disabled={isLoading}
            aria-describedby={validationError ? 'email-error' : undefined}
            aria-invalid={!!validationError}
            style={{
              width: '100%', padding: '8px 10px', fontSize: 15,
              border: `1px solid ${validationError ? '#ef4444' : '#d1d5db'}`,
              borderRadius: 5, boxSizing: 'border-box', marginBottom: 4,
            }}
          />
          {validationError && (
            <p id="email-error" role="alert" style={{ color: '#ef4444', fontSize: 13, margin: '0 0 8px' }}>
              {validationError}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '8px 18px', borderRadius: 5, border: '1px solid #d1d5db',
                background: '#f9fafb', cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 18px', borderRadius: 5, border: 'none',
                background: isLoading ? '#93c5fd' : '#1a56db',
                color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {isLoading && (
                <span
                  aria-hidden="true"
                  style={{
                    width: 14, height: 14, border: '2px solid #fff',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite',
                  }}
                />
              )}
              {isLoading ? 'Sending…' : 'Send Invoice'}
            </button>
          </div>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
