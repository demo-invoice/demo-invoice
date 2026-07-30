# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## T7 — Live Invoice Preview

A real-time, purely presentational invoice preview panel that mirrors a controlled form with zero latency — every keystroke in the form is reflected in the preview within the same React render cycle.

### Running the app

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The left panel is the form; the right panel is the live preview.

### Running tests

```bash
npm test
```

---

### Component tree

```
<App>
  <InvoiceProvider>          ← shared state (React Context + useReducer)
    <InvoiceForm />          ← dispatches on every onChange keystroke
    <InvoicePreview>         ← A4-ratio container, zero state mutations
      <PreviewHeader />      ← logo placeholder + sender + INVOICE heading/dates
      <PreviewBillTo />      ← Bill To block (suppressed when billToName empty)
      <PreviewLineItemsTable /> ← line items table (handles 0 rows gracefully)
      <PreviewTotals />      ← derives subtotal/tax/grand-total inline
      <PreviewNotes />       ← notes section (suppressed when notes empty)
    </InvoicePreview>
  </InvoiceProvider>
</App>
```

---

### Token layer

All colours, typography sizes/weights, spacing values, and border radii live in **`src/tokens/index.ts`** and are exported as a single typed `tokens` object.

```ts
import { tokens } from './tokens';
// tokens.color.accent, tokens.spacing['4'], tokens.typography.size.base …
```

No component contains a hard-coded hex value or magic number — every visual decision traces back to a token.

---

### Context / selector pattern

| Hook | Who uses it | Purpose |
|---|---|---|
| `useInvoiceState()` | Preview components only | Read-only access to invoice state |
| `useInvoiceDispatch()` | `InvoiceForm` only | Write access via discriminated-union actions |

The preview components call **only** `useInvoiceState()` — they never hold local state, never dispatch, and never register event handlers. This guarantees the preview is purely presentational and always consistent with the form.

#### Reducer actions

| Action type | Payload | Effect |
|---|---|---|
| `UPDATE_FIELD` | `field`, `value` | Updates any scalar field on `InvoiceState` |
| `ADD_LINE_ITEM` | — | Appends a new blank line item |
| `REMOVE_LINE_ITEM` | `id` | Removes the line item with the given id |
| `UPDATE_LINE_ITEM` | `id`, `field`, `value` | Updates a single field on a line item |

---

### Edge cases handled

| Scenario | Behaviour |
|---|---|
| `lineItems` is empty | Table renders with a single colspan placeholder row — no JS error |
| `taxRate` is `0`, `undefined`, or `""` | Tax line shows `$0.00`; grand total equals subtotal |
| `quantity` or `unitPrice` is `NaN` / empty string | Treated as `0` via `Number(x) \|\| 0`; amount shows `$0.00` |
| All optional fields blank | Zero empty DOM nodes emitted; no blank vertical gaps |
| `notes` is empty / whitespace | Entire Notes section absent from DOM |
| `billToName` is empty | Entire Bill To block suppressed |
| Very long description | `word-break: break-word` on description `<td>` prevents table overflow |
| `invoiceNumber` is empty | Heading still renders `INVOICE`; number field shows `—` |
| `issueDate` / `dueDate` empty | Date rows suppressed individually |
| Logo field empty | Placeholder `<div>` always renders — never throws |
| Rapid keystrokes | No debounce; every React render cycle reflects latest context value |
