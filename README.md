# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Logo Upload

The **Logo Upload** feature (T8, Iteration 3) lets users attach a business logo that appears in the invoice preview.

### Accepted file types

| Format | MIME type |
|--------|-----------|
| PNG | `image/png` |
| JPEG | `image/jpeg` |
| SVG | `image/svg+xml` |

Some browsers report an empty MIME type for SVG files. The component handles this transparently by also accepting any file whose name ends with `.svg`.

### Size limit

Files must be **2 MB or smaller** (≤ 2 × 1 024 × 1 024 bytes). Files that exceed this limit are rejected before any read is attempted.

### ARIA live region behaviour

An ARIA live region (`role="alert"`, `aria-live="assertive"`) is **always present** in the DOM. Its text content is set to the error message when validation fails, and cleared to an empty string on a successful upload or when the logo is removed. This approach — mutating text content rather than conditionally mounting/unmounting a child element — ensures screen readers announce the message reliably.

### localStorage persistence

The logo is persisted as a base64 data URL under the key **`invoice_logo`** in `localStorage`.

- On component mount the stored value is rehydrated into shared state automatically.
- On every successful upload the new data URL is written to `localStorage`.
- Clicking **Remove Logo** deletes the key from `localStorage`.
- If `localStorage` is unavailable (private browsing, quota exceeded, etc.) the failure is caught silently; the logo still works for the current session.

### Component structure

```
src/
  context/
    InvoiceContext.jsx   — shared state (logo field) + localStorage sync
  components/
    LogoUpload.jsx       — upload control (validation, FileReader, ARIA)
    InvoicePreview.jsx   — invoice panel with logo slot
    YourDetails.jsx      — form section hosting LogoUpload
  App.jsx                — root; wraps tree in InvoiceContextProvider
```
