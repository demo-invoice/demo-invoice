# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Saved Invoice History

This feature (T21, Iteration 2) lets users save the current invoice to a local history list and reload any past invoice back into the form.

### How it works

1. Fill in the invoice fields (Invoice Number, Client Name, Issue Date, Total).
2. Click **Save Invoice** — the current invoice is appended to the history list below the form.
3. Click **Load** next to any saved entry to restore that invoice into the form.
4. Click **New Invoice** to reset the form to a fresh blank invoice.

All data is persisted to `localStorage` so it survives page refreshes.

### localStorage keys

| Key | Purpose |
|---|---|
| `invoice_active_v1` | The active (in-progress) invoice fields |
| `invoice_history_v1` | Array of saved invoice snapshots |

### Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run verify` | Run TypeScript type-check only (`tsc --noEmit`) |
| `npm test` | Run the Vitest test suite |

### CI

The `.github/workflows/verify.yml` workflow runs on every push and pull request:

1. **Type-check** — `npx tsc --noEmit`
2. **Test** — `npm test`

Both steps must be green for a PR to be considered passing.
