/**
 * POST /api/send-invoice
 *
 * Receives { invoice, recipientEmail, subject, message }, generates a PDF
 * attachment via generateInvoicePdf, then sends the email via Resend.
 *
 * Error responses:
 *   400 — missing/invalid request body fields
 *   500 — RESEND_API_KEY not configured, or Resend API failure
 *
 * NOTE (T24): Resend is used per Sara's recommendation (confidence 0.4).
 * This is a working assumption pending final PO confirmation. If the provider
 * changes, only this file and .env.local need updating.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { generateInvoicePdf } from '@/utils/generateInvoicePdf';
import type { Invoice } from '@/types/invoice';

interface RequestBody {
  invoice: Invoice;
  recipientEmail: string;
  subject: string;
  message: string;
}

interface SuccessResponse {
  ok: true;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: 'Email service not configured; contact administrator' });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) {
    return res
      .status(500)
      .json({ error: 'Sender email not configured; contact administrator' });
  }

  const body = req.body as Partial<RequestBody>;
  const { invoice, recipientEmail, subject, message } = body;

  if (!invoice || typeof invoice !== 'object') {
    return res.status(400).json({ error: 'Missing invoice data' });
  }
  if (!recipientEmail || typeof recipientEmail !== 'string') {
    return res.status(400).json({ error: 'Missing recipientEmail' });
  }

  const resolvedSubject =
    subject?.trim() || `Invoice #${invoice.number}`;

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateInvoicePdf(invoice);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `PDF generation failed: ${msg}` });
  }

  const resend = new Resend(apiKey);

  const htmlBody = `
    <p>${message ? message.replace(/\n/g, '<br>') : `Please find your invoice #${invoice.number} attached.`}</p>
    <p>Total due: $${invoice.lineItems
      .reduce((s, i) => s + i.quantity * i.unitPrice, 0)
      .toFixed(2)}</p>
  `;

  try {
    const { error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: resolvedSubject,
      html: htmlBody,
      attachments: [
        {
          filename: `invoice-${invoice.number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (resendError) {
      return res.status(500).json({ error: resendError.message });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Email delivery failed: ${msg}` });
  }

  return res.status(200).json({ ok: true });
}
