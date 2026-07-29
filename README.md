# demo-invoice

Initialized by your AI team so we have a base branch to build on.

## Development

### Project structure

- **Zustand store** — `src/store/invoiceStore.ts`  
  Single source of truth for all invoice data. The form writes to this store; the preview only reads from it. Exports `useInvoiceStore` and pure selector functions (`selectSubtotal`, `selectTaxAmount`, `selectGrandTotal`, `selectLineItemTotal`).

- **Design tokens** — `src/tokens/tokens.css`  
  CSS custom properties (`--token-*`) covering colour palette, typography scale, spacing scale, border radii, and shadows. Must be imported in the app entry point so `var()` references resolve before any component CSS runs.

- **InvoicePreview component** — `src/components/InvoicePreview/InvoicePreview.tsx`  
  Pure read-only display component. It subscribes to `invoiceStore` via selectors and renders the current invoice state. **Contributors must not add `useState`, `useReducer`, `useEffect`, or any state-mutation logic inside this component.** All data changes must go through the Zustand store.

### Running tests

```bash
npm install
npm test              # vitest run (single pass)
npm test -- --coverage  # with coverage report
```

### Type checking

```bash
npx tsc --noEmit
```
