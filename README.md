# demo-invoice

An accessibility-compliant invoice form built with React, TypeScript, and Vite.

## Getting started

```bash
npm install
npm run dev      # start dev server
npm test         # run all tests (vitest)
npm run build    # type-check + production build
```

---

## Architecture decisions

### InvoiceProvider location — `src/App.tsx` (not `src/index.tsx`)

`<InvoiceProvider>` lives in `App.tsx` and wraps `<InvoiceForm />` there.
`src/index.tsx` only renders `<App />` — it has no knowledge of the context.

**Why:** Co-locating the provider with the component tree that consumes it
makes the boundary obvious and keeps `index.tsx` minimal. It also means
tests can import `InvoiceForm` and wrap it with `<InvoiceProvider>` directly
without touching the entry point.

---

## Running the axe accessibility audit in tests

axe-core is integrated directly into the Vitest test suite.
The test `'has zero critical/serious axe violations on initial render'` in
`src/components/InvoiceForm/InvoiceForm.test.tsx` runs `axe.run(container)`
after every render and asserts:

```ts
const blocking = results.violations.filter(
  (v) => v.impact === 'critical' || v.impact === 'serious',
);
expect(blocking).toHaveLength(0);
```

To run only the accessibility tests:

```bash
npx vitest run --reporter=verbose InvoiceForm.test
```

To see the full axe violation report on failure, add a `console.log` before
the assertion:

```ts
console.log(JSON.stringify(blocking, null, 2));
```

---

## Keyboard navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward through all form controls |
| `Shift+Tab` | Move focus backward |
| `Enter` / `Space` | Activate focused button |
| `Arrow keys` | Navigate options inside a `<select>` (currency) |
| `Enter` (on form) | Submit the invoice |

After removing a line item, focus automatically returns to the **Add Item**
button so keyboard and switch-access users are never stranded.

---

## WCAG AA compliance notes

| Criterion | Implementation |
|-----------|---------------|
| 1.1.1 Non-text content | All icon-only buttons have `aria-label` |
| 1.3.1 Info and relationships | `<label htmlFor>` paired with input `id` on every field; `<fieldset>`/`<legend>` groups client details |
| 1.3.5 Identify input purpose | `autoComplete` attributes on name and email inputs |
| 1.4.3 Contrast (minimum) | All text colours verified ≥ 4.5:1 against white background (see `src/index.css`) |
| 2.1.1 Keyboard | All interactions reachable and operable by keyboard only |
| 2.4.3 Focus order | DOM order matches visual order; no `tabindex` manipulation |
| 2.4.7 Focus visible | `:focus-visible` outline on all interactive elements |
| 3.3.1 Error identification | Errors identified in text via `ValidationError` live regions |
| 3.3.2 Labels or instructions | Every input has an explicit visible label |
| 4.1.3 Status messages | `role="alert"` / `aria-live="assertive"` on error regions; `role="status"` / `aria-live="polite"` available for non-critical messages |

### Live region anti-pattern — avoided

ValidationError **always renders its container element** (never returns `null`).
Screen readers (VoiceOver, NVDA) register live regions when they first appear
in the DOM. If the element is conditionally mounted *at the same time* as the
error text is set, the announcement is missed. By keeping the node in the DOM
with empty text and only changing the text content, we guarantee the
announcement fires reliably.

### Double-submit re-announcement

`handleSubmit` dispatches `CLEAR_ERRORS` **before** `SET_ERRORS` on every
attempt. This causes the live region text node to transition `text → empty →
text`, which re-triggers the screen reader announcement even when the error
messages are identical to the previous submission.
