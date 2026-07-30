# demo-invoice

A browser-based invoice generator.  Fill in your details, add line items, upload a logo, and download a PDF.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Run tests

```bash
npm test
```

### Build for production

```bash
npm run build
```

---

## Architecture

| Layer | Technology |
|-------|------------|
| UI | React 18 + TypeScript |
| State | `useReducer` + React Context (`InvoiceContext`) |
| Persistence | `localStorage` (key: `demo-invoice:state`) |
| PDF | Blob URL + anchor-click (Chrome/Firefox) or `window.open` (Safari) |
| Tests | Vitest + Testing Library |
| Build | Vite 5 |

---

## Safari PDF behaviour

Safari does not honour the `download` attribute on anchor elements for blob
URLs.  Rather than attempting an anchor click and catching the failure, the
application uses **proactive feature detection**:

```ts
// src/utils/pdfDownload.ts
const isSafari =
  (typeof navigator !== 'undefined' &&
   typeof navigator.vendor === 'string' &&
   navigator.vendor.includes('Apple'))
  || !('download' in document.createElement('a'));

if (isSafari) {
  window.open(blobUrl, '_blank'); // open in new tab
} else {
  anchor.click();                 // standard download
}
```

The check runs **before** any DOM interaction.  Safari users see the PDF in a
new tab and can save it via **File → Save As**.  See
[KI-001](./docs/known-issues.md#ki-001--safari-pdf-opens-in-new-tab-instead-of-downloading)
for full details.

---

## Known issues

See [docs/known-issues.md](./docs/known-issues.md).

---

## State reset flow

Clicking **New Invoice**:

1. Dispatches `{ type: 'RESET_INVOICE' }` (typed action union member).
2. The reducer calls `makeDefaultState()` **at dispatch time**, so Issue Date
   always reflects the moment the user clicked the button.
3. The persistence `useEffect` detects `_lastAction === 'RESET_INVOICE'`,
   calls `localStorage.removeItem(INVOICE_STORAGE_KEY)`, and returns early —
   it does **not** call `setItem`, so the blank invoice is never re-persisted.
4. A subsequent page reload starts with a blank form.

---

## Test matrix

See [docs/test-matrix.md](./docs/test-matrix.md) for the full cross-browser
smoke test results including sign-off.
