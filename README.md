# demo-invoice

A Vite + React invoice builder with email sending via Supabase Edge Functions and Resend.

## Getting Started

```bash
npm install
npm run dev
```

## Running Tests

```bash
npm test
```

## Building for Production

```bash
npm run build
```

---

## Environment Variables & Secrets

### Client-side (Vite — safe to expose, set in `.env`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_FUNCTIONS_URL` | Base URL for your Supabase Edge Functions, e.g. `https://<project-ref>.supabase.co/functions/v1`. Set in `.env` (or `.env.local`). |

Example `.env`:
```
VITE_SUPABASE_FUNCTIONS_URL=https://xyzabc.supabase.co/functions/v1
```

### Supabase Secrets (server-side only — never put these in client code or `.env`)

Set these via the Supabase CLI:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
supabase secrets set RESEND_FROM_ADDRESS=invoices@yourdomain.com
```

| Secret | Description |
|---|---|
| `RESEND_API_KEY` | Your [Resend](https://resend.com) API key. Found in the Resend dashboard under API Keys. |
| `RESEND_FROM_ADDRESS` | The sender address for outgoing invoices. **Must be a verified sender domain in Resend** — `yourdomain.com` is a placeholder and will not work until you verify your domain. |

> **Important:** `RESEND_FROM_ADDRESS` must be set to a real, Resend-verified sender address before emails will be delivered. The Edge Function will return a `500` error with a descriptive message if either secret is missing.

### Deploying the Edge Function

```bash
supabase functions deploy send-invoice
```

---

## Architecture

- **`src/context/InvoiceContext.jsx`** — Shared invoice state via React context + `useReducer`. Exports `UPDATE_INVOICE_STATUS` action type constant.
- **`src/components/SendEmailModal/`** — Modal that collects/confirms recipient email and POSTs the full invoice to the Edge Function.
- **`supabase/functions/send-invoice/index.ts`** — Deno Edge Function that calls the Resend API. Reads `RESEND_API_KEY` and `RESEND_FROM_ADDRESS` from `Deno.env`.
