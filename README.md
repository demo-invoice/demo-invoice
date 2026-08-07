# demo-invoice

Initialized by your AI team so we have a base branch to build on.

## Email Invoice Integration

> **Working assumption (PO decision, confidence 0.35 — flagged in PR):**
> The chosen email provider is [EmailJS](https://www.emailjs.com/) via the
> `@emailjs/browser` client-only SDK. No backend route is required. If a
> backend API is preferred, replace `src/services/emailService.js` — the
> function signature is unchanged so no callers need updating.

### Required environment variables

Create a `.env.local` file in the project root (never commit it):

```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Setup steps

1. Create a free account at <https://www.emailjs.com/>.
2. Add an **Email Service** (Gmail, Outlook, SMTP, etc.) and copy the
   **Service ID** → `VITE_EMAILJS_SERVICE_ID`.
3. Create an **Email Template**. The template can reference these variables:
   - `{{to_email}}` — recipient address
   - `{{invoice_number}}` — invoice number (or `N/A` if absent)
   - `{{invoice_date}}` — invoice date
   - `{{line_items}}` — newline-separated list of line items
   - `{{subtotal}}`, `{{tax}}`, `{{total}}` — monetary totals
   - `{{message}}` — optional personal message from the sender
4. Copy the **Template ID** → `VITE_EMAILJS_TEMPLATE_ID`.
5. Copy your **Public Key** from *Account → API Keys* → `VITE_EMAILJS_PUBLIC_KEY`.
6. Restart the dev server (`npm run dev`) so Vite picks up the new env vars.

### Swapping for a backend API

Replace the body of `sendInvoiceEmail` in `src/services/emailService.js` with
a `fetch()` call to your own endpoint. The exported function signature
(`sendInvoiceEmail(invoiceData, recipient, message)`) stays the same, so
`EmailInvoiceModal` and all tests need no changes.
