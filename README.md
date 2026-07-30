# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Accessibility (WCAG AA)

This project targets **WCAG 2.1 Level AA** compliance. The sections below document the approach, tooling, and conventions every contributor must follow.

---

### WCAG AA Compliance Approach

| Criterion | Implementation |
|---|---|
| 1.1.1 Non-text Content | All icon-only buttons use `aria-label` |
| 1.3.1 Info & Relationships | Every input has an explicit `<label htmlFor>` / `id` pairing — no placeholder-only labelling |
| 1.3.5 Identify Input Purpose | `autoComplete` attributes set on name/organisation fields |
| 1.4.1 Use of Colour | Errors are indicated by text + border, not colour alone |
| 1.4.3 Contrast (Minimum) | All text tokens ≥ 4.5:1; UI components ≥ 3:1 (see token table below) |
| 1.4.11 Non-text Contrast | Focus rings and input borders meet 3:1 |
| 2.1.1 Keyboard | All interactions operable by keyboard; no keyboard traps |
| 2.4.1 Bypass Blocks | `<main>` landmark present |
| 2.4.3 Focus Order | DOM order matches visual order; focus moved explicitly after row removal |
| 2.4.6 Headings & Labels | Visible `<h1>` page title; all inputs labelled |
| 3.3.1 Error Identification | Validation errors linked via `aria-describedby`; `aria-invalid="true"` set |
| 3.3.2 Labels or Instructions | Explicit `<label>` elements on every control |
| 4.1.3 Status Messages | `aria-live` regions announce validation errors without moving focus |

---

### Colour Token Contrast Ratios

All tokens are defined in `src/styles/tokens.css` and verified against WCAG AA.

| Token | Value | Contrast on `#ffffff` | Threshold | Status |
|---|---|---|---|---|
| `--color-text` | `#111827` | ~18.1:1 | 4.5:1 (normal text) | ✅ Pass |
| `--color-text-secondary` | `#374151` | ~10.7:1 | 4.5:1 (normal text) | ✅ Pass |
| `--color-error` | `#b91c1c` | ~5.9:1 | 4.5:1 (normal text) | ✅ Pass |
| `--color-primary` | `#1d4ed8` | ~5.9:1 | 4.5:1 (normal text) | ✅ Pass |
| `--color-border` | `#6b7280` | ~3.9:1 | 3:1 (UI component) | ✅ Pass |
| `--color-focus-ring` | `#005fcc` | ~6.5:1 | 3:1 (UI component) | ✅ Pass |

> **Disabled elements**: WCAG 1.4.3 explicitly exempts disabled UI components from contrast requirements. Disabled inputs in this project use `opacity: 0.4` and are documented as intentionally below threshold.

---

### Running an Accessibility Audit

#### axe DevTools (browser)

1. Install the [axe DevTools browser extension](https://www.deque.com/axe/devtools/) (Chrome / Firefox).
2. Run `npm run dev` and open `http://localhost:5173`.
3. Open DevTools → **axe DevTools** tab → **Scan page**.
4. All violations are reported with WCAG criterion references and fix guidance.

#### axe-core (automated, CI-friendly)

```bash
npm install --save-dev @axe-core/react
```

Then in `src/index.tsx` (development only):

```ts
if (import.meta.env.DEV) {
  const axe = await import('@axe-core/react');
  const ReactDOM = await import('react-dom');
  axe.default(React, ReactDOM, 1000);
}
```

Violations are logged to the browser console with WCAG references.

---

### Keyboard Navigation Guide

#### General form navigation

| Key | Action |
|---|---|
| `Tab` | Move focus to next interactive element |
| `Shift+Tab` | Move focus to previous interactive element |
| `Enter` | Submit form (when focus is on submit button) |

#### Currency dropdown (native `<select>`)

The currency selector is a native `<select>` element, which provides full keyboard support without any custom JavaScript:

| Key | Action |
|---|---|
| `Tab` | Focus the dropdown |
| `Enter` / `Space` | Open the option list |
| `↑` / `↓` | Navigate between options |
| `Escape` | Close without changing selection |
| `Home` / `End` | Jump to first / last option |
| Any letter | Jump to first option starting with that letter |

> If a custom-styled dropdown is ever needed, it must implement: `role="combobox"` on the trigger, `role="listbox"` on the options container, `role="option"` on each option, `aria-expanded`, `aria-activedescendant`, and a full keyboard handler (Enter/Space open, ArrowUp/Down navigate, Escape closes and returns focus to trigger with `event.preventDefault()` to suppress page scroll, Home/End jump to first/last).

#### Date fields

Native `<input type="date">` is used — keyboard navigation is provided by the browser.

#### Line item rows

| Key | Action |
|---|---|
| `Tab` | Move through Description → Quantity → Unit Price → Remove |
| `Enter` (on Remove) | Remove the row; focus moves to **Add Item** button |

---

### InvoiceContext Action Union — Contributor Requirement

**Before dispatching any new action type, you must add it to the `InvoiceAction` discriminated union in `src/context/InvoiceContext.tsx`.**

The current union is:

```ts
export type InvoiceAction =
  | { type: 'ADD_LINE_ITEM' }
  | { type: 'REMOVE_LINE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_LINE_ITEM'; payload: { id: string; field: keyof Omit<LineItem, 'id'>; value: string } }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof Omit<InvoiceState, 'lineItems' | 'errors'>; value: string } }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' };
```

The reducer's `default` branch is a TypeScript exhaustiveness check (`const _exhaustive: never = action`). If you dispatch an unrecognised action type, **TypeScript strict mode will fail the build** — this is intentional. Silent no-ops are not possible.

**Steps to add a new action:**

1. Add the new variant to `InvoiceAction` in `InvoiceContext.tsx`.
2. Add the corresponding `case` to `invoiceReducer`.
3. Add a unit test in `src/context/InvoiceContext.test.ts`.
4. CI runs `npx tsc --noEmit` and `vitest run` — both must pass.

---

### Screen Reader Announcement Notes

- **Validation errors** use `role="alert"` (implicit `aria-live="assertive"`) so they are announced immediately when they appear.
- **Form-level error summary** uses `role="alert"` + `aria-live="assertive"` and receives programmatic focus after a failed submit.
- **Re-announcement on double submit**: `CLEAR_ERRORS` is dispatched before `SET_ERRORS` on every submit attempt. This removes and re-inserts the live region content, guaranteeing the screen reader re-announces even if the errors are identical.
- **Focus after row removal**: focus is moved to the **Add Item** button via `queueMicrotask` after the DOM updates, preventing focus loss to `document.body` (WCAG 2.4.3 failure).
