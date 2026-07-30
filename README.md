# demo-invoice

A React + TypeScript invoice application with persistent state and a **New Invoice** button.

## Features

- Create and edit invoices with from/to details, line items, dates, and notes
- Live preview panel updates as you type
- State is automatically persisted to `localStorage`
- **New Invoice** button clears all data after a confirmation prompt

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tests

```bash
npm test
```

Runs the full test suite with [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/).

## Type checking

```bash
npm run type-check
```

## Build

```bash
npm run build
```

## New Invoice Button Behaviour

1. User clicks **New Invoice** in the header.
2. A native `confirm()` dialog appears: _"Start a new invoice? All current data will be cleared."_
3. **OK** → `localStorage.removeItem('invoice_state')` is called once (from `Header`), then `RESET_INVOICE` is dispatched.
   - The persistence `useEffect` in `InvoiceProvider` detects `state._lastAction === 'RESET_INVOICE'` and **skips** `setItem`, so the key remains absent.
   - `issueDate` is set to today's date at the moment of reset.
4. **Cancel** → zero side effects; all form data is preserved.

## CI

GitHub Actions runs on every push and pull request to `main` and `feat/**` branches:

| Job | Command |
|---|---|
| `type-check` | `npx tsc --noEmit` |
| `test` | `npm test` |

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
