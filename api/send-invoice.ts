/**
 * Vercel Edge Function: POST /api/send-invoice
 *
 * Receives { invoice, recipient } in the request body, serializes the
 * invoice to HTML, and delivers it via the SendGrid Mail Send API.
 *
 * Required environment variables:
 *   SENDGRID_API_KEY   — SendGrid API key with Mail Send permission
 *   SENDGRID_FROM_EMAIL — Verified sender address in SendGrid
 *
 * Returns:
 *   200 — email accepted by SendGrid
 *   400 — missing / invalid request body
 *   429 — SendGrid rate limit hit
 *   500 — server misconfiguration or unexpected SendGrid error
 *
 * @remarks PDF attachment is deferred to a follow-up ticket
 *   (PO working assumption, Sara confidence 0.35 — flagged for PR review).
 */

import type { Invoice } from '../src/types/invoice';
import { serializeInvoiceToHtml } from '../src/utils/invoiceSerializer';
import { validateEmail } from '../src/utils/validateEmail';

export const config = { runtime: 'edge' };

interface RequestBody {
  invoice: Invoice;
  recipient: string;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- Parse body ---
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { invoice, recipient } = body;

  if (!invoice || !recipient || !validateEmail(recipient)) {
    return json({ error: 'Missing or invalid invoice / recipient' }, 400);
  }

  // --- Env vars ---
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.error('SendGrid env vars not configured');
    return json({ error: 'Server misconfiguration' }, 500);
  }

  // --- Serialize invoice to HTML ---
  const htmlBody = serializeInvoiceToHtml(invoice);

  // --- Call SendGrid Mail Send API ---
  const sgPayload = {
    personalizations: [{ to: [{ email: recipient }] }],
    from: { email: fromEmail },
    subject: `Invoice ${invoice.invoiceNumber}`,
    content: [{ type: 'text/html', value: htmlBody }],
  };

  let sgResponse: Response;
  try {
    sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sgPayload),
    });
  } catch (err) {
    console.error('SendGrid fetch failed', err);
    return json({ error: 'Failed to reach email provider' }, 500);
  }

  if (sgResponse.status === 202) {
    return json({ ok: true }, 200);
  }

  if (sgResponse.status === 429) {
    return json({ error: 'Rate limit exceeded' }, 429);
  }

  const errorText = await sgResponse.text().catch(() => 'unknown');
  console.error(`SendGrid error ${sgResponse.status}:`, errorText);
  return json({ error: 'Email provider error' }, 500);
}

function json(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
