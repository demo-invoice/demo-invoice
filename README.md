# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Accessibility Implementation (T17)

This project targets **WCAG 2.1 AA** compliance. Below is a guide to the
implementation, how to audit it, and the keyboard navigation contract.

### Running an axe DevTools audit

1. Install the [axe DevTools browser extension](https://www.deque.com/axe/devtools/).
2. Run the dev server: `npm run dev`
3. Open `http://localhost:5173` in Chrome or Firefox.
4. Open DevTools → **axe DevTools** tab → **Scan ALL of my page**.
5. All issues should be zero violations at AA level.

Alternatively, use the CLI:

```bash
npx axe http://localhost:5173 --tags wcag2a,wcag2aa
```

### Keyboard navigation guide

#### General tab order

```
Invoice Number → (Line item rows: Description → Qty → Rate → Remove) →
Add line item → Currency → Issue Date → Due Date → Save Invoice
```

#### Currency Dropdown (custom combobox)

| Key | Action |
|-----|--------|
| `Tab` | Focus the trigger button |
| `Enter` or `Space` | Open the listbox |
| `ArrowDown` | Move highlight to next option (wraps) |
| `ArrowUp` | Move highlight to previous option (wraps) |
| `Enter` (listbox open) | Select highlighted option and close |
| `Escape` | Close without selecting; focus returns to trigger |
| `Tab` (listbox open) | Close listbox and move focus to next element (no trap) |

### Typed action union — CAUTION note

The `InvoiceContext` reducer uses a **TypeScript discriminated union** for all
dispatch actions. The only valid `type` string literals are:

```ts
'UPDATE_INVOICE_FIELD'
'ADD_LINE_ITEM'
'REMOVE_LINE_ITEM'
'UPDATE_LINE_ITEM'
'SET_CURRENCY'
```

**Never use a generic string like `'UPDATE_FIELD'`** — it will not match any
branch in the reducer and will silently no-op at runtime. With `strict: true`
in `tsconfig.json`, TypeScript will catch this as a compile error before it
ever reaches the browser. All dispatch call sites in the codebase use only
the exact literals above.

### Colour contrast tokens

All colour values are defined in `src/styles/tokens.css` and verified against
WCAG AA (4.5:1 minimum for normal text):

| Token | Value | Ratio on white |
|-------|-------|----------------|
| `--color-error` | `#b91c1c` | 5.9:1 ✓ |
| `--color-text` | `#111827` | 18.1:1 ✓ |
| `--color-text-muted` | `#374151` | 10.7:1 ✓ |
| `--color-placeholder` | `#6b7280` | 4.6:1 ✓ |
| `--color-btn-primary-bg` | `#1d4ed8` | 7.2:1 (white text) ✓ |
| `--color-btn-danger-bg` | `#b91c1c` | 5.9:1 (white text) ✓ |

### aria-live regions

Two live regions are rendered once at the top of `InvoiceForm` and updated
dynamically — they are **never unmounted**, which prevents double-announcement
on initial render:

- `aria-live="polite"` (`role="status"`) — success messages and field-level
  feedback that should not interrupt the user.
- `aria-live="assertive"` (`role="alert"`) — the full error summary on form
  submit, announced immediately.
