# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Invoice Preview (T7)

A live, read-only A4-proportioned invoice preview panel that mirrors the invoice form state in real time.

### Architecture overview

```
src/
├── tokens/
│   └── designTokens.ts          # Single source of truth for all design tokens
├── types/
│   └── invoice.ts               # Shared TypeScript interfaces
├── context/
│   └── InvoiceContext.tsx       # React Context + useReducer (state + dispatch)
├── utils/
│   ├── invoiceTotals.ts         # Pure totals derivation + formatCurrency
│   └── ifPresent.tsx            # Helper for conditional field rendering
└── components/
    └── InvoicePreview/
        ├── index.tsx             # Barrel export
        ├── InvoicePreview.tsx    # Root preview component (read-only)
        ├── LogoPlaceholder.tsx
        ├── SenderBlock.tsx
        ├── MetaBlock.tsx
        ├── BillToBlock.tsx
        ├── LineItemsTable.tsx
        ├── TotalsBlock.tsx
        ├── NotesBlock.tsx
        └── InvoicePreview.module.css
```

### Context shape

```ts
interface InvoiceState {
  sender: SenderInfo;      // From address
  client: ClientInfo;      // Bill To address
  meta: InvoiceMeta;       // Invoice number, dates, currency, tax rate
  lineItems: LineItem[];   // Description / qty / unit price rows
  notes: string;           // Optional footer notes
  logoUrl: string;         // Optional data-URL or remote URL
}
```

The context exposes two hooks:

| Hook | Purpose |
|---|---|
| `useInvoiceState()` | Read-only access — safe for preview components |
| `useInvoiceDispatch()` | Write access — for form components only |

### Available actions

```ts
dispatch({ type: 'SET_SENDER',     payload: Partial<SenderInfo> })
dispatch({ type: 'SET_CLIENT',     payload: Partial<ClientInfo> })
dispatch({ type: 'SET_META',       payload: Partial<InvoiceMeta> })
dispatch({ type: 'SET_LINE_ITEMS', payload: LineItem[] })
dispatch({ type: 'SET_NOTES',      payload: string })
dispatch({ type: 'SET_LOGO_URL',   payload: string })
dispatch({ type: 'RESET' })
```

### Design token contract (T3)

All colours, typography, spacing, border radii, and shadows are defined in `src/tokens/designTokens.ts`. No hard-coded hex values or magic numbers exist anywhere else.

To inject tokens as CSS custom properties at app startup:

```ts
import { injectCssVars } from './tokens/designTokens';
injectCssVars(); // call once in main.tsx / App.tsx
```

The CSS module then references them as `var(--color-primary)`, `var(--spacing-8)`, etc.

### `deriveInvoiceTotals` utility

```ts
import { deriveInvoiceTotals, formatCurrency } from './utils/invoiceTotals';

const { subtotal, taxAmount, grandTotal } = deriveInvoiceTotals(lineItems, taxRate);
// taxRate: percentage number, e.g. 20 for 20%
// All values rounded to 2 decimal places — no floating-point drift

formatCurrency(3.3, 'GBP'); // => '£3.30'
formatCurrency(0,   'USD'); // => '$0.00'
```

### A4 aspect ratio

The preview container uses `aspect-ratio: 210 / 297` (CSS property). A `padding-top: calc(297 / 210 * 100%)` fallback is applied via `@supports not (aspect-ratio: ...)` for older engines. The inner sheet is `position: absolute; inset: 0` so it fills the wrapper in both cases.

### Empty field suppression

Every optional field is guarded by the `ifPresent(value, render)` helper:

```ts
{ifPresent(sender.phone, (v) => <span>{v}</span>)}
```

This returns `null` for empty strings, preventing orphan elements in the DOM.

Fields suppressed when empty:
- `sender.phone`, `sender.addressLine2`
- `client.addressLine2`
- `meta.invoiceNumber`, `meta.issueDate`, `meta.dueDate`
- Tax row in `TotalsBlock` (when `taxRate === 0`)
- Entire `NotesBlock` (when `notes` is blank)

### Usage

```tsx
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoicePreview } from './components/InvoicePreview';

function App() {
  return (
    <InvoiceProvider>
      {/* Your form dispatches actions to the context */}
      <InvoiceForm />
      {/* Preview subscribes and re-renders automatically */}
      <InvoicePreview />
    </InvoiceProvider>
  );
}
```

### Running tests

```bash
npm install
npm test
```

Test suite covers:

| Suite | What it verifies |
|---|---|
| `invoiceTotals.test.ts` | Subtotal / tax / grand total correctness, zero tax, empty items, floating-point edge cases |
| `InvoicePreview.test.tsx` (a) | All sections render when state is fully populated |
| `InvoicePreview.test.tsx` (b) | Optional empty fields are absent from the DOM |
| `InvoicePreview.test.tsx` (c) | No dispatch / setState called during preview render |
| `InvoicePreview.test.tsx` (d) | Snapshot stability for full and empty states |
