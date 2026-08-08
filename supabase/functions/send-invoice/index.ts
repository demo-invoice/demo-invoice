import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface LineItem {
  description?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
}

interface Invoice {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  clientName?: string;
  clientEmail?: string;
  lineItems?: LineItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: string;
}

interface RequestBody {
  to: string;
  invoice: Invoice;
}

/**
 * Build a plain-text email body from the invoice data.
 */
function buildEmailHtml(invoice: Invoice): string {
  const rows = (invoice.lineItems ?? []).map(
    (item) =>
      `<tr>
        <td>${item.description ?? ''}</td>
        <td>${item.quantity ?? ''}</td>
        <td>${item.rate ?? ''}</td>
        <td>${item.amount ?? ''}</td>
      </tr>`
  ).join('');

  return `
    <h1>Invoice ${invoice.invoiceNumber ?? ''}</h1>
    <p>Date: ${invoice.invoiceDate ?? ''}</p>
    <p>Due: ${invoice.dueDate ?? ''}</p>
    <p>Client: ${invoice.clientName ?? ''}</p>
    <table>
      <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Subtotal: ${invoice.subtotal ?? 0}</p>
    <p>Tax: ${invoice.tax ?? 0}</p>
    <p><strong>Total: ${invoice.total ?? 0}</strong></p>
  `;
}

/**
 * Deno Edge Function entry point.
 * Accepts POST { to, invoice }, sends via Resend API.
 */
serve(async (req: Request): Promise<Response> => {
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

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const resendFrom = Deno.env.get('RESEND_FROM_ADDRESS');

  if (!resendApiKey) {
    return new Response(
      JSON.stringify({ error: 'Email service is not configured on the server.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  if (!resendFrom) {
    return new Response(
      JSON.stringify({ error: 'Sender address is not configured on the server.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body.' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  const { to, invoice } = body;

  if (!to || typeof to !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid "to" field.' }),
      { status: 422, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  const resendPayload = {
    from: resendFrom,
    to: [to],
    subject: `Invoice ${invoice?.invoiceNumber ?? ''} from Invoice Builder`,
    html: buildEmailHtml(invoice ?? {}),
  };

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resendPayload),
  });

  const resendData: unknown = await resendResponse.json().catch(() => ({}));

  if (!resendResponse.ok) {
    const errorMessage =
      typeof resendData === 'object' &&
      resendData !== null &&
      'message' in resendData &&
      typeof (resendData as Record<string, unknown>).message === 'string'
        ? (resendData as Record<string, string>).message
        : 'Failed to send email. Please try again.';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: resendResponse.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data: resendData }),
    { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
  );
});
