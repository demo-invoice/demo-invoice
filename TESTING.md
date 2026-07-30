# Print Stylesheet — Manual Verification (T14)

## Selector confirmation

The `.invoice-preview` CSS selector used in `src/styles/print.css` is confirmed
from the T7 InvoicePreview component specification (ticket AC wording). The T7
component source was not present in the repository tree at the time this ticket
was implemented; if the selector differs in the final T7 implementation, update
both `src/styles/print.css` and this document accordingly.

## Automated tests

Run the full test suite:

```bash
npm install
npm test
```

All tests in `src/styles/print.css.test.ts` must pass. The suite verifies:

- `@media print` block is present and non-empty.
- Nested `@page { margin: 1cm; }` block does **not** cause premature termination
  of the extracted block (brace-depth tracking).
- UI chrome elements (`header`, `nav`, `form`, `button`, `.no-print`,
  `body > *:not(.invoice-preview)`) are hidden with `display: none !important`.
- `.invoice-preview` has `box-shadow: none !important`.
- `tr` has both `page-break-inside: avoid` (legacy) and `break-inside: avoid`
  (modern).
- `thead` uses `display: table-header-group`.
- `tfoot` uses `display: table-footer-group`.

## Manual browser verification

1. Open the application in a Chromium-based browser (Chrome / Edge) or Firefox.
2. Navigate to an invoice that has **15 or more line items** so that the table
   spans multiple printed pages.
3. Press **Ctrl+P** (Windows/Linux) or **Cmd+P** (macOS) to open the print
   preview.
4. Verify the following in the print preview:

   | Check | Expected |
   |---|---|
   | Navigation / header bar | **Not visible** |
   | Any form controls or buttons | **Not visible** |
   | Invoice panel shadow | **Not visible** (clean white background) |
   | Table rows | **No row splits across a page boundary** |
   | Table header | **Repeated on every page** (where browser supports it) |
   | Page margins | Approximately **1 cm** on all sides |

5. Print to PDF and inspect the output to confirm no row is split across pages.

## Known limitations

- `display: table-header-group` for repeating `thead` is supported in Chrome and
  Firefox but may not repeat in all Safari versions — this is a browser
  limitation, not a bug in the stylesheet.
- `break-inside: avoid` on `tr` is a best-effort hint; very tall single rows
  (taller than one page) cannot be avoided by CSS alone.
