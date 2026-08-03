# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Send Invoice (T24)

### How it works

The **Send Invoice** feature lets users email an invoice directly from the app
without any backend infrastructure. Clicking **✉ Send Invoice** on the invoice
view opens a modal where the user fills in a recipient address, optional subject,
and optional personal message. On submit, the app constructs a `mailto:` URI
containing the full invoice summary (line items, subtotal, tax, total) and opens
it via `window.location.href`, which hands off to the user's default mail client.

### Limitations of the `mailto:` approach

| Limitation | Detail |
|---|---|
| **No PDF attachment** | The `mailto:` scheme (RFC 6068) does not support file attachments. Invoice content is inlined as plain text in the email body. |
| **Depends on user's mail client** | The feature only works if the user has a default mail client configured. In browser-only environments (e.g. Chromebook with no desktop client) the link may silently fail. |
| **URI length cap** | Browsers impose a ~2 000-character limit on `mailto:` URIs. Very long invoices are truncated with a notice: `[Invoice details truncated — please open the full invoice in the app]`. |
| **No delivery tracking** | There is no way to confirm the email was sent or received. |
| **Confidence caveat** | This approach was adopted per Sara's PO decision (confidence **0.4** — treated as a working assumption). If stakeholders require programmatic sending, see the follow-up path below. |

### Follow-up ticket: upgrade to a real email service

To remove the above limitations, a follow-up ticket should:

1. Add a **Next.js API route** (or equivalent serverless function) at
   `POST /api/invoices/[id]/send`.
2. Integrate a **transactional email provider** (e.g. [Resend](https://resend.com)
   or [SendGrid](https://sendgrid.com)) with server-side credentials stored in
   environment variables — never committed to the repo.
3. Generate a **PDF** of the invoice server-side (e.g. with `@react-pdf/renderer`
   or Puppeteer) and attach it to the outgoing email.
4. Return delivery status to the client so the UI can show confirmed-sent vs.
   failed states.
5. Remove the `buildMailtoUri` fallback (or keep it as a graceful degradation
   path for environments without backend access).

The `TODO` comment in `src/utils/invoiceEmail.ts` marks the exact callsite to
replace.

---

## T7 lesson: typed reducer action unions

All action types dispatched to `invoiceReducer` **must** appear in the
`InvoiceAction` typed union in `src/types/invoice.ts`. The reducer's `default`
branch contains a TypeScript `never` exhaustive check:

```ts
default: {
  const _exhaustive: never = action;
  return _exhaustive;
}
```

This means that if a developer adds a new action type to the union but forgets
to handle it in the reducer, **TypeScript will fail at compile time** — not
silently no-op at runtime. The CI `tsc --noEmit` step enforces this on every
push and pull request.

> **Rule:** before dispatching an action anywhere in the codebase, verify its
> `type` string exists in the `InvoiceAction` union. Never use ad-hoc string
> literals as action types.

---

## Development

```bash
npm install
npm run dev      # Vite dev server
npm test         # Vitest unit tests
npm run build    # Type-check + production build
```
