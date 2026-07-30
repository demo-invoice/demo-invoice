# demo-invoice

![CI](https://github.com/your-org/demo-invoice/actions/workflows/verify.yml/badge.svg)

## Project Setup

```bash
npm install
npm run dev      # start Vite dev server
npm test         # run Vitest suite
npm run build    # production build
```

## Accessibility Notes

- All form fields have explicit `<label htmlFor>` / `id` pairings.
- Per-field error spans are always present in the DOM (empty when no error) so `aria-describedby` references are never dangling.
- A persistent `aria-live="polite"` region is rendered unconditionally; errors are injected into it after a `setTimeout(0)` so React 18 batching does not suppress re-announcement.
- The Currency dropdown is a fully compliant ARIA combobox (`role=combobox`, `aria-haspopup=listbox`, `aria-expanded`, `role=listbox`, `role=option`, `aria-activedescendant`). Keyboard: ↑/↓ navigate options, Enter/Space open, Escape closes, Tab closes without focus-trapping.
- Error text uses `#b91c1c` (red-700) on white — contrast ratio 5.9:1, exceeding WCAG AA 4.5:1.
- Line item remove buttons carry `aria-label="Remove item {n}"` for unambiguous screen-reader identification.
- Line item HTML IDs are derived from stable UUIDs generated at add-time, not from array indices.

## Tech Stack

- React 18 + TypeScript (strict)
- Vite 5 (dev server + bundler)
- Vitest + @testing-library/react + jsdom (tests)
