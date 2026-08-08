import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface InvoicePayload {
  email: string;
  invoice: Record<string, unknown>;
}

/**
 * Sends an invoice by email via the Resend API.
 * Reads RESEND_API_KEY from Supabase secret store (Deno.env).
 * Handles CORS preflight and returns JSON responses.
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
  if (!resendApiKey) {
    return new Response(
      JSON.stringify({ error: 'Email service is not configured.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  let payload: InvoicePayload;
  try {
    payload = await req.json() as InvoicePayload;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body.' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  const { email, invoice } = payload;

  if (!email || typeof email !== 'string') {
    return new Response(
      JSON.stringify({ error: 'A valid recipient email is required.' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  const invoiceSummary = Object.entries(invoice ?? {})
    .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
    .join('');

  const htmlBody = `
    <h1>Your Invoice</h1>
    <ul>${invoiceSummary}</ul>
    <p>Thank you for your business.</p>
  `;

  let resendResponse: Response;
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'invoices@yourdomain.com',
        to: [email],
        subject: 'Your Invoice',
        html: htmlBody,
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: `Failed to reach email provider: ${message}` }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  if (!resendResponse.ok) {
    let detail = `Resend API error (${resendResponse.status}).`;
    try {
      const body = await resendResponse.json() as { message?: string };
      if (body.message) detail = body.message;
    } catch {
      // use default detail
    }
    return new Response(
      JSON.stringify({ error: detail }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
  );
});
