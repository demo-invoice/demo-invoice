# demo-invoice

A minimal React + Vite + TypeScript invoice application.

[![Verify](https://github.com/demo-org/demo-invoice/actions/workflows/verify.yml/badge.svg)](https://github.com/demo-org/demo-invoice/actions/workflows/verify.yml)

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm test` | Run Vitest test suite |
| `npm run typecheck` | Type-check without building |

## Cross-browser smoke test

See [`docs/test-matrix.md`](docs/test-matrix.md) for the full cross-browser
test matrix, known issues, and attestation.

**Status**: All P1 findings from iteration-3 review resolved. Two lower-priority
known issues remain as follow-ups:

- **KI-001** (P2): Safari PDF download opens in new tab instead of downloading.
  Root cause: Safari ignores the `download` attribute on `<a>` elements.
  Workaround: `isSafariBrowser()` detects Safari and falls back to `window.open`.
- **KI-002** (P3): `localStorage` is blocked in Safari private/incognito mode.
  The persistence layer wraps all storage calls in `try/catch` and fails silently.

## CI

The `.github/workflows/verify.yml` workflow runs on every push and pull request:

1. `npm ci` — deterministic install from lockfile
2. `npx tsc -p tsconfig.json --noEmit` — type-check src
3. `npx tsc -p tsconfig.node.json --noEmit` — type-check vite config
4. `npm test` — Vitest test suite
5. `npm run build` — production build gate
