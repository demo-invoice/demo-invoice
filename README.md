# demo-invoice

Initialized by your AI team so we have a base branch to build on.

## Saved Invoice History

This feature allows users to save snapshots of the current invoice and reload them later.

### localStorage Keys

| Key | Purpose |
|-----|---------|
| `invoice_active` (`INVOICE_STORAGE_KEY`) | Stores the currently active invoice state. Cleared on "New Invoice". |
| `invoice_history` (`INVOICE_HISTORY_KEY`) | Stores the array of all saved invoice entries. **Never cleared by the app** — only appended to. |

### `LOAD_SAVED_INVOICE` Action

Dispatching `{ type: 'LOAD_SAVED_INVOICE', payload: snapshot }` replaces the entire active invoice state with the saved snapshot and persists it to `INVOICE_STORAGE_KEY`. This is a first-class member of the `InvoiceAction` union — TypeScript will catch any typo at compile time.

### Running Tests

```bash
npm install
npm test
```

Tests are written with [Vitest](https://vitest.dev/) and [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/).

### Graceful Degradation on localStorage Failure

All `localStorage` access is wrapped in `try/catch`. If storage is unavailable (e.g. private browsing with quota exceeded) or contains malformed JSON:

- `loadActiveInvoice()` returns `null` — the app starts with a fresh default invoice.
- `loadInvoiceHistory()` returns `[]` — the history panel shows the empty-state message.
- `saveActiveInvoice()` and `appendInvoiceHistory()` silently swallow errors — the UI remains fully functional, just without persistence.
