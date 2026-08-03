/**
 * SendInvoiceModal
 *
 * Controlled modal for sending an invoice by email.
 * - Pre-fills subject as "Invoice #<number>" (user-editable).
 * - Validates recipient email client-side before submission.
 * - Disables Send button while request is in-flight.
 * - Dispatches UPDATE_INVOICE_STATUS('Sent') on success.
 * - Surfaces descriptive error messages on API failure.
 */
import React, { useState } from 'react';
import type { Invoice } from '@/types/invoice';
import { useInvoice } from '@/context/InvoiceContext';
import { validateEmail } from '@/utils/validateEmail';

interface Props {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

export function SendInvoiceModal({ invoice, onClose, onSuccess }: Props) {
  const { dispatch } = useInvoice();
  const [recipientEmail, setRecipientEmail] = useState(invoice.clientEmail);
  const [subject, setSubject] = useState(`Invoice #${invoice.number}`);
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRecipientEmail(e.target.value);
    if (emailError) setEmailError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');

    if (!validateEmail(recipientEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice,
          recipientEmail: recipientEmail.trim(),
          subject: subject.trim() || `Invoice #${invoice.number}`,
          message,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `Unexpected error (HTTP ${res.status})`);
      }

      dispatch({ type: 'UPDATE_INVOICE_STATUS', payload: 'Sent' });
      setSent(true);
      onSuccess();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to send invoice.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
      style={overlay}>
      <div style={panel}>
        <h2 id="modal-title" style={{ marginTop: 0 }}>Send Invoice by Email</h2>

        {sent ? (
          <div role="status" aria-live="polite">
            <p style={{ color: 'green' }}>✓ Invoice sent successfully!</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="recipientEmail">Recipient Email *</label>
            <input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={handleEmailChange}
              disabled={loading}
              aria-describedby={emailError ? 'email-error' : undefined}
              aria-invalid={!!emailError}
              style={inputStyle}
            />
            {emailError && (
              <p id="email-error" role="alert" style={{ color: 'red', margin: '4px 0' }}>
                {emailError}
              </p>
            )}

            <label htmlFor="subject" style={{ display: 'block', marginTop: 12 }}>Subject</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              style={inputStyle}
            />

            <label htmlFor="message" style={{ display: 'block', marginTop: 12 }}>Message (optional)</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />

            {apiError && (
              <p role="alert" style={{ color: 'red', margin: '8px 0' }}>
                {apiError}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" disabled={loading} aria-busy={loading}>
                {loading ? 'Sending…' : 'Send Invoice'}
              </button>
              <button type="button" onClick={onClose} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const panel: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, maxWidth: 520,
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
};
const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '8px 10px',
  marginTop: 4, boxSizing: 'border-box', fontSize: 14,
};
