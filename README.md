# demo-invoice

A minimal Next.js invoice app with **Send Invoice by Email** functionality (T24).

---

## Features

- View invoice details with line items and totals
- **Send Invoice by Email** — generates a PDF attachment and delivers it via email directly from the app
- Invoice status lifecycle: `Draft` → `Sent` → `Paid`
- Toast notification on successful send

---

## Setup

### 1. Create a Resend account

Go to [resend.com](https://resend.com) and create a free account.  
Verify a sending domain under **Domains**, then generate an API key under **API Keys**.

> **Note (T24 working assumption):** Resend was chosen as the email service provider based on Sara's recommendation during T24 planning (confidence 0.4). This is a working assumption pending final PO confirmation. If the provider changes to SendGrid, EmailJS, or another service, only `src/pages/api/send-invoice.ts` and the environment variables below need updating — no other files are affected.

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and populate:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=invoices@yourdomain.com
```

`.env.local` is gitignored and must **never** be committed.

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Running Tests

```bash
npm test
```

The test suite uses **Vitest** + **React Testing Library** + **MSW** (Mock Service Worker) to mock the `/api/send-invoice` endpoint.  
Coverage includes:

| Test file | What it covers |
|---|---|
| `__tests__/validateEmail.test.ts` | Email regex utility — valid/invalid cases |
| `__tests__/invoiceReducer.test.ts` | Reducer: `UPDATE_INVOICE_STATUS`, `SET_INVOICE`, `UPDATE_FIELD`, unknown action guard |
| `__tests__/sendInvoice.test.tsx` | Full modal flow: success, validation error, API error, button re-enable |

---

## Architecture

```
src/
  types/invoice.ts          # Invoice, InvoiceLineItem, InvoiceStatus, InvoiceAction union
  context/InvoiceContext.tsx # useReducer-based state, useInvoice hook
  utils/generateInvoicePdf.ts# @react-pdf/renderer — server-side only
  utils/validateEmail.ts     # Pure email regex utility
  components/
    SendInvoiceModal.tsx     # Controlled modal: validation, loading, success/error
    InvoiceView.tsx          # Invoice display + Send Invoice button
    Toast.tsx                # Auto-dismissing notification
  pages/
    index.tsx                # Root page
    api/send-invoice.ts      # POST handler: PDF gen + Resend delivery
```

### Key decisions

| Decision | Rationale |
|---|---|
| **Next.js** | API routes + React in one framework; no separate backend needed |
| **Resend SDK** | Simple API, generous free tier, first-class attachment support *(working assumption — see note above)* |
| **@react-pdf/renderer** | JSX-based PDF generation; runs server-side in the API route |
| **Vitest + MSW** | Fast, ESM-native test runner; MSW intercepts fetch without patching globals |
| **`RESEND_API_KEY` in `process.env`** | Never exposed to the client bundle |

---

## CI

GitHub Actions workflow at `.github/workflows/verify.yml` runs on every push and pull request:

1. `npm install`
2. `npx tsc --noEmit` (type-check)
3. `npm test`
