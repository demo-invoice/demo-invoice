# demo-invoice

A browser-based invoice generator built with React, TypeScript, and Vite.
State is persisted to `localStorage` and a PDF can be downloaded via jsPDF.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build   # type-check + Vite production build
```

## Test

```bash
npm test        # vitest run (unit + integration)
```

---

## Architecture Notes

### Storage key

Invoice state is persisted under the localStorage key:

```
demo-invoice:state
```

Exported as `INVOICE_STORAGE_KEY` from `src/context/invoiceStorage.ts`.

### Reset behaviour

When the user clicks **New Invoice** and confirms:

1. `localStorage.removeItem('demo-invoice:state')` is called **directly** in
   `NewInvoiceButton` before dispatch (belt-and-suspenders).
2. `RESET_INVOICE` is dispatched to the reducer.
3. The reducer calls `makeDefaultState()` **at reset time** — so Issue Date
   always reflects the current day, not the time the app first loaded.
4. The persistence `useEffect` in `InvoiceContext` detects
   `state._lastAction === 'RESET_INVOICE'` and calls `clearInvoiceState()`
   (i.e. `removeItem`) rather than writing a blank record back to storage.

### Cross-browser compatibility

See the full test matrix and known issues:

- [`docs/test-matrix.md`](docs/test-matrix.md) — pass/fail results across
  Chrome, Firefox, Safari, and Chrome Android.
- [`docs/known-issues.md`](docs/known-issues.md) — browser-specific
  limitations with severity classification and workarounds.

#### Key fixes applied (T16 / T18)

| Area | Fix |
|------|-----|
| Mobile horizontal scroll | `html, body { overflow-x: hidden; max-width: 100% }` in `global.css`; per-container `overflow-x: hidden`; line-items table wrapped in `overflow-x: auto` scroll container |
| Sticky bar obscuring content | `padding-bottom: 5rem` on `.invoice-form-container` matches sticky bar height |
| Safari PDF download | `anchor.click()` wrapped in try/catch; falls back to `window.open(blobUrl)` |
| FileReader cross-browser | Uses `addEventListener('load', …)` instead of `onload` assignment |
| localStorage private browsing | All storage calls wrapped in `try/catch` |
| RESET_INVOICE persistence guard | `useEffect` checks `_lastAction === 'RESET_INVOICE'` → calls `removeItem`, not `setItem` |

### Known Safari PDF limitation

Safari does not honour programmatic `anchor.click()` on blob URLs. The app
falls back to `window.open(blobUrl, '_blank')`, which opens the PDF in a new
tab. Users can save from there via **File → Save As**. See
[`docs/known-issues.md#ki-001`](docs/known-issues.md#ki-001) for full details.
