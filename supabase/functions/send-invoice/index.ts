// Supabase Edge Function — send-invoice
// Deno runtime; secrets read exclusively from Deno.env.get(...).

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoicePayload {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  recipientEmail: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  invoiceDate: string;
  dueDate: string;
  status: string;
  logoDataUrl: string | null;
}

/**
 * Formats a simple plain-text email body from the invoice payload.
 */
function buildEmailText(invoice: InvoicePayload): string {
  const lines = invoice.lineItems
    .map((li) => `  - ${li.description}: ${li.quantity} × £${li.unitPrice.toFixed(2)}`)
    .join('\n');

  return [
    `Invoice ${invoice.invoiceNumber}`,
    `Client: ${invoice.clientName}`,
    `Date: ${invoice.invoiceDate}   Due: ${invoice.dueDate}`,
    '',
    'Items:',
    lines,
    '',
    `Subtotal: £${invoice.subtotal.toFixed(2)}`,
    `Tax:      £${invoice.tax.toFixed(2)}`,
    `Total:    £${invoice.total.toFixed(2)}`,
  ].join('\n');
}

/**
 * Validates that required fields are present and well-formed.
 * Returns an error string or null if valid.
 */
function validate(payload: Partial<InvoicePayload>): string | null {
  if (!payload.recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.recipientEmail)) {
    return 'recipientEmail is missing or invalid.';
  }
  if (!payload.invoiceNumber) return 'invoiceNumber is required.';
  if (!Array.isArray(payload.lineItems)) return 'lineItems must be an array.';
  return null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed.' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  // Read API key exclusively from environment — never from client payload.
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set in environment.');
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: email service not configured.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  let payload: Partial<InvoicePayload>;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body.' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  const validationError = validate(payload);
  if (validationError) {
    return new Response(
      JSON.stringify({ error: validationError }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  const invoice = payload as InvoicePayload;
  const emailText = buildEmailText(invoice);

  // Send via Resend (https://resend.com/docs/api-reference/emails/send-email)
  const fromAddress = Deno.env.get('RESEND_FROM_ADDRESS') ?? 'invoices@example.com';
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [invoice.recipientEmail],
      subject: `Invoice ${invoice.invoiceNumber} from Invoice Builder`,
      text: emailText,
    }),
  });

  if (!resendRes.ok) {
    const errBody = await resendRes.json().catch(() => ({}));
    console.error('Resend API error:', resendRes.status, errBody);
    return new Response(
      JSON.stringify({ error: 'Failed to send email. Please try again later.' }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
  );
});
