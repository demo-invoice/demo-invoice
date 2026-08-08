import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoicePayload {
  recipientEmail: string;
  clientName?: string;
  lineItems?: LineItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  status?: string;
}

/**
 * Renders a plain-text email body from the invoice payload.
 */
function renderEmailBody(payload: InvoicePayload): string {
  const lines: string[] = [];

  lines.push(`Invoice${payload.invoiceNumber ? ` #${payload.invoiceNumber}` : ''}`);
  lines.push('');

  if (payload.clientName) {
    lines.push(`Dear ${payload.clientName},`);
    lines.push('');
  }

  lines.push('Please find your invoice details below:');
  lines.push('');

  if (payload.invoiceDate) lines.push(`Invoice Date: ${payload.invoiceDate}`);
  if (payload.dueDate) lines.push(`Due Date:     ${payload.dueDate}`);
  lines.push('');

  if (payload.lineItems && payload.lineItems.length > 0) {
    lines.push('Items:');
    for (const item of payload.lineItems) {
      const lineTotal = (item.quantity ?? 0) * (item.unitPrice ?? 0);
      lines.push(
        `  - ${item.description ?? 'Item'} x${item.quantity} @ $${item.unitPrice.toFixed(2)} = $${lineTotal.toFixed(2)}`
      );
    }
    lines.push('');
  }

  if (payload.subtotal !== undefined) lines.push(`Subtotal: $${payload.subtotal.toFixed(2)}`);
  if (payload.tax !== undefined) lines.push(`Tax:      $${payload.tax.toFixed(2)}`);
  if (payload.total !== undefined) lines.push(`Total:    $${payload.total.toFixed(2)}`);

  lines.push('');
  lines.push('Thank you for your business.');

  return lines.join('\n');
}

serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set');
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: RESEND_API_KEY is not set.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const fromAddress = Deno.env.get('RESEND_FROM_ADDRESS');
  if (!fromAddress) {
    console.error('RESEND_FROM_ADDRESS is not set');
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: RESEND_FROM_ADDRESS is not set.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let payload: InvoicePayload;
  try {
    payload = await req.json() as InvoicePayload;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!payload.recipientEmail) {
    return new Response(
      JSON.stringify({ error: 'recipientEmail is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const subject = payload.invoiceNumber
    ? `Invoice #${payload.invoiceNumber}${ payload.clientName ? ` for ${payload.clientName}` : '' }`
    : 'Your Invoice';

  const emailBody = renderEmailBody(payload);

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [payload.recipientEmail],
      subject,
      text: emailBody,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text().catch(() => 'Unknown Resend error');
    console.error('Resend API error:', errorText);
    return new Response(
      JSON.stringify({ error: `Failed to send email: ${errorText}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const result = await resendResponse.json();
  return new Response(
    JSON.stringify({ success: true, id: result.id }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
