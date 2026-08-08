import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoicePayload {
  recipientEmail: string;
  clientName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  lineItems?: LineItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: string;
}

/**
 * Build a plain-text email body from the invoice payload.
 */
function buildEmailText(payload: InvoicePayload): string {
  const lines: string[] = [
    `Invoice Number : ${payload.invoiceNumber ?? 'N/A'}`,
    `Invoice Date   : ${payload.invoiceDate ?? 'N/A'}`,
    `Due Date       : ${payload.dueDate ?? 'N/A'}`,
    `Client         : ${payload.clientName ?? 'N/A'}`,
    '',
    'Line Items:',
  ];

  for (const item of payload.lineItems ?? []) {
    lines.push(`  - ${item.description}  x${item.quantity}  @ ${item.unitPrice}`);
  }

  lines.push('');
  lines.push(`Subtotal : ${payload.subtotal ?? 0}`);
  lines.push(`Tax      : ${payload.tax ?? 0}`);
  lines.push(`Total    : ${payload.total ?? 0}`);

  return lines.join('\n');
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const fromAddress = Deno.env.get('RESEND_FROM_ADDRESS');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: missing RESEND_API_KEY' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    if (!fromAddress) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: missing RESEND_FROM_ADDRESS' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const payload = (await req.json()) as InvoicePayload;

    if (!payload.recipientEmail) {
      return new Response(
        JSON.stringify({ error: 'recipientEmail is required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const emailBody = buildEmailText(payload);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [payload.recipientEmail],
        subject: `Invoice ${payload.invoiceNumber ?? ''} from Invoice Builder`,
        text: emailBody,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({ error: resendData.message ?? 'Failed to send email' }),
        { status: resendResponse.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ id: resendData.id }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
