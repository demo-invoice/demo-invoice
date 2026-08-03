import type { Invoice, SendResult } from '../types/invoice';

/**
 * POSTs invoice data and a recipient email address to the
 * `/api/send-invoice` Vercel Edge Function.
 *
 * Accepts an optional AbortSignal so callers (e.g. modal on unmount)
 * can cancel an in-flight request.
 *
 * @param invoice   - The invoice to send.
 * @param recipient - Validated recipient email address.
 * @param signal    - Optional AbortController signal.
 * @returns A typed SendResult indicating success or failure.
 */
export async function sendInvoice(
  invoice: Invoice,
  recipient: string,
  signal?: AbortSignal,
): Promise<SendResult> {
  let response: Response;

  try {
    response = await fetch('/api/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice, recipient }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, message: 'Request cancelled.' };
    }
    return { ok: false, message: 'Network error — please check your connection and try again.' };
  }

  if (response.ok) {
    return { ok: true, message: `Invoice sent to ${recipient}.` };
  }

  // Map known HTTP status codes to user-friendly messages
  if (response.status === 400) {
    return { ok: false, message: 'Invalid request — please check the invoice details.' };
  }
  if (response.status === 429) {
    return { ok: false, message: 'Too many requests — please wait a moment and try again.' };
  }

  // 500 or any other server error (e.g. missing SendGrid API key)
  return { ok: false, message: 'Failed to send — please try again.' };
}
