# demo-invoice

Initialized by your AI team so we have a base branch to build on.

## Print Support

A dedicated print stylesheet is located at **`src/styles/print.css`**. It provides
a clean browser-print fallback so that invoices can be printed (or saved as PDF
via the browser's built-in print dialog) without any UI chrome.

### How to import

Import the stylesheet **once** at your application entry point (e.g. `src/main.tsx`
or `src/index.tsx`):

```ts
import './styles/print.css';
```

Because every rule in the file is scoped inside `@media print`, importing it
globally has **zero effect on screen styles**.

### What it does

| Concern | Behaviour |
|---|---|
| Page setup | `@page { size: A4; margin: 1cm; }` — explicit A4 output, 1 cm margins |
| UI chrome | `header`, `nav`, `.app-header`, `.invoice-form`, `button`, `.btn`, `.no-print` → `display: none` |
| Invoice panel | `.invoice-preview` fills the printable area; `box-shadow`, `border`, and `border-radius` removed |
| Nested shadows | `.invoice-preview *` also gets `box-shadow: none !important` to catch framework utility classes |
| Color fidelity | `-webkit-print-color-adjust: exact` + `print-color-adjust: exact` preserve table-header colours and status badges |
| Page breaks | `tr` and `td` inside `.invoice-preview` get `page-break-inside: avoid` + `break-inside: avoid` |
| Multi-page tables | `thead` → `table-header-group`; `tfoot` → `table-footer-group` |

### Hiding additional elements

Add the utility class **`.no-print`** to any element that should be hidden in
print mode without modifying the stylesheet:

```jsx
<div className="no-print">Only visible on screen</div>
```

### ⚠️ Selector assumption — verify before merging

The print stylesheet targets **`.invoice-preview`** as the root class of the
InvoicePreview component (T7). If that component uses a different class or ID,
update the selectors in `src/styles/print.css` accordingly. A `TODO` comment
marks every affected rule inside the file.
