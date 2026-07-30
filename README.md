# demo-invoice

Initialized by your AI team so we have a base branch to build on.

## Responsive / Mobile Layout

### Breakpoints

| Breakpoint | Layout |
|---|---|
| ≥ 768 px (desktop) | Two-column flex row: `InvoiceForm` on the left, `PreviewPanel` on the right |
| < 768 px (mobile) | Single-column flex column: `InvoiceForm` stacked above `PreviewPanel` |

The breakpoint is defined as `@media (max-width: 767px)` throughout the codebase.

### Sticky Download PDF Button

On mobile (`max-width: 767px`) the `DownloadPDFButton` is rendered as a **fixed bottom bar**:

```
position: fixed;
bottom: 0;
left: 0;
width: 100%;
height: var(--sticky-btn-height, 60px);
z-index: 1000;
```

To prevent the fixed button from overlapping scrollable content, `.app-content` receives
`padding-bottom: var(--sticky-btn-height)` at the same breakpoint. Both values share the
CSS custom property `--sticky-btn-height: 60px` (defined on `:root` in `index.css`) so
changing the button height in one place keeps everything in sync.

### Touch Targets

All interactive elements (`input`, `select`, `textarea`, `button`) receive
`min-height: 44px` at the mobile breakpoint, meeting the WCAG 2.5.5 / Apple HIG
minimum touch-target guideline.

### Line Items — Card Layout

On mobile the `LineItemsTable` collapses each `<tr>` into a **card**:

- `<thead>` is hidden (`display: none`).
- Each `<tr>` becomes `display: block` with a border and shadow.
- Each `<td>` is `display: block`; the description cell spans the full card width.
- Quantity, unit price, and amount cells are grouped in a flex row via a
  `.line-item-sub-row` wrapper.
- Every `<td>` carries a `data-label` attribute; a CSS `::before` pseudo-element
  surfaces that label visually and for assistive technologies.

### Horizontal Scroll Prevention

`overflow-x: hidden` is set on **both** `html` and `body` in `index.css`, and
additionally on `.preview-container` in `PreviewPanel.css`, to prevent any
wide invoice content from causing horizontal scroll at 375 px / 390 px viewports.
