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
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Request failed with status ${res.status}`);
      }

      dispatch({ type: 'UPDATE_INVOICE_STATUS', payload: 'Sent' });
      setSent(true);
      onSuccess();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div role="dialog" aria-modal="true" aria-label="Invoice sent">
        <p>Invoice sent successfully!</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Send Invoice">
      <h2>Send Invoice</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="recipientEmail">Recipient Email *</label>
          <input
            id="recipientEmail"
            type="email"
            value={recipientEmail}
            onChange={handleEmailChange}
            disabled={loading}
            required
          />
          {emailError && <span role="alert">{emailError}</span>}
        </div>

        <div>
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>

        {apiError && <p role="alert">{apiError}</p>}

        <div>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
