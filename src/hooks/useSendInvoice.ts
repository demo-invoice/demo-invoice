/**
 * useSendInvoice — custom hook encapsulating send-invoice logic.
 *
 * Manages recipient, subject, message, validation, loading, success, and
 * error state. Calls buildMailtoUri and opens the mailto link via
 * window.location.href. Prevents duplicate sends via isSending flag.
 */
import { useState, useCallback } from 'react';
import type { Invoice } from '../types/invoice';
import { isValidEmail } from '../utils/validateEmail';
import { buildMailtoUri } from '../utils/invoiceEmail';

export interface SendInvoiceState {
  recipient: string;
  subject: string;
  message: string;
  isSending: boolean;
  isSuccess: boolean;
  error: string | null;
  recipientError: string | null;
}

export interface SendInvoiceActions {
  setRecipient: (value: string) => void;
  setSubject: (value: string) => void;
  setMessage: (value: string) => void;
  triggerSend: () => void;
  reset: () => void;
}

const INITIAL_STATE: SendInvoiceState = {
  recipient: '',
  subject: '',
  message: '',
  isSending: false,
  isSuccess: false,
  error: null,
  recipientError: null,
};

/**
 * Hook for the Send Invoice flow.
 *
 * @param invoice - The invoice to send. Typically sourced from InvoiceContext.
 * @returns State values and action callbacks.
 */
export function useSendInvoice(
  invoice: Invoice,
): SendInvoiceState & SendInvoiceActions {
  const [state, setState] = useState<SendInvoiceState>({
    ...INITIAL_STATE,
    // Pre-populate recipient from context if available (reduces friction).
    recipient: invoice.clientEmail ?? '',
  });

  const setRecipient = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      recipient: value,
      recipientError:
        value.length > 0 && !isValidEmail(value)
          ? 'Please enter a valid email address.'
          : null,
    }));
  }, []);

  const setSubject = useCallback((value: string) => {
    setState((prev) => ({ ...prev, subject: value }));
  }, []);

  const setMessage = useCallback((value: string) => {
    setState((prev) => ({ ...prev, message: value }));
  }, []);

  const triggerSend = useCallback(() => {
    setState((prev) => {
      // Guard: prevent duplicate sends and invalid email.
      if (prev.isSending || !isValidEmail(prev.recipient)) return prev;

      try {
        const uri = buildMailtoUri(
          invoice,
          prev.recipient,
          prev.subject,
          prev.message,
        );
        window.location.href = uri;
        // mailto: is synchronous from JS's perspective — briefly show loading
        // then flip to success. The mail client opens asynchronously.
        return { ...prev, isSending: true, error: null };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to open mail client.';
        return { ...prev, isSending: false, error: message };
      }
    });

    // Resolve the simulated loading state after a short delay.
    setTimeout(() => {
      setState((prev) =>
        prev.isSending
          ? { ...prev, isSending: false, isSuccess: true }
          : prev,
      );
    }, 800);
  }, [invoice]);

  const reset = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      recipient: invoice.clientEmail ?? '',
    });
  }, [invoice.clientEmail]);

  return {
    ...state,
    setRecipient,
    setSubject,
    setMessage,
    triggerSend,
    reset,
  };
}
