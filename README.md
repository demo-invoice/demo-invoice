# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## New Invoice Feature (T11)

The **New Invoice** button in the app header lets users clear all current invoice data and start fresh.

### How it works

1. The user clicks **New Invoice** (keyboard-accessible; `aria-label="Start a new invoice"`).
2. A native `window.confirm()` dialog asks:
   > *This will clear all current invoice data. Are you sure?*
3. If the user confirms:
   - `localStorage.removeItem(INVOICE_STORAGE_KEY)` is called to wipe persisted data.
   - A `RESET_INVOICE` action is dispatched to `InvoiceContext`.
   - The reducer returns a fresh default state (see below).
4. If the user cancels, nothing changes.

### Reset defaults

| Field | Reset value |
|---|---|
| `invoiceNumber` | `'INV-001'` |
| `issueDate` | Today's date (`new Date()` computed at reset time) |
| `fromName` | `''` |
| `toName` | `''` |
| `notes` | `''` |
| `lineItems` | `[]` |

### Key constants

| Constant | Value | Location |
|---|---|---|
| `INVOICE_STORAGE_KEY` | `'demo-invoice:state'` | `src/context/InvoiceContext.tsx` |
| Action type | `'RESET_INVOICE'` | `InvoiceAction` union in same file |

Both the Header component and the context import `INVOICE_STORAGE_KEY` from the same module — there is no key duplication.

### Running the app

```bash
npm install
npm run dev
```

### Running tests

```bash
npm test
```

Tests cover:
- `invoiceReducer` — all action types, including `RESET_INVOICE` resetting every field.
- `Header` — button renders, confirm=true dispatches reset + removes localStorage key, confirm=false leaves state unchanged.
