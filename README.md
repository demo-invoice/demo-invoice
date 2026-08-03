# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Send Invoice by Email (T24)

Invoices can be sent directly by email from within the app. Clicking **Send Invoice** opens a modal where you enter a recipient address; the app calls a Vercel Edge Function that delivers the email via SendGrid.

### Architecture

| Layer | File | Responsibility |
|---|---|---|
| Types | `src/types/invoice.ts` | `Invoice`, `LineItem`, `SendStatus`, `SendResult` |
| State | `src/context/InvoiceContext.tsx` | React context + strictly-typed reducer (action union, `SET_SEND_STATUS`) |
| Client service | `src/services/emailService.ts` | POSTs to `/api/send-invoice`, maps HTTP responses to `SendResult` |
| Edge Function | `api/send-invoice.ts` | Validates payload, serializes HTML, calls SendGrid Mail Send API |
| UI | `src/components/SendInvoiceModal.tsx` | Email input, validation, loading state, toast feedback |
| Serializer | `src/utils/invoiceSerializer.ts` | Converts `Invoice` → HTML email body |
| Validation | `src/utils/validateEmail.ts` | RFC-5322-lite regex, used by modal and Edge Function |

### Required Environment Variables

Create a `.env.local` file (see `.env.example`) with:

```
SENDGRID_API_KEY=SG.xxxx          # SendGrid API key with Mail Send permission
SENDGRID_FROM_EMAIL=you@domain.com # Verified sender address in SendGrid
```

These variables are consumed **only** by the Vercel Edge Function — they are never exposed to the browser.

### Running Locally

```bash
npm install
npm run dev        # Vite dev server
npm test           # Vitest unit + integration tests
npx tsc --noEmit   # Type-check
```

To test the Edge Function locally, use the [Vercel CLI](https://vercel.com/docs/cli):

```bash
npx vercel dev
```

### Known Limitations / Working Assumptions

> ⚠️ **PR Review Flag:** The following decisions were made by PO Sara with confidence **0.35** and should be treated as working assumptions until confirmed.

- **Email format:** The email body is HTML only. PDF attachment support is **deferred to a follow-up ticket**.
- **Backend:** Vercel Edge Function → SendGrid (no frontend credential exposure).
- **No existing email integration** was found in the repository at the time of implementation.
