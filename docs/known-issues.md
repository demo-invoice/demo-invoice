# Known Issues — demo-invoice

## KI-001 · Safari: PDF blob URL does not trigger file download

**Severity:** P2  
**Browsers affected:** Safari 17.x (macOS), Safari on iOS 17.x  
**Status:** Workaround in place; not fully resolved.

### Description

When the user clicks **Download PDF**, the application:

1. Generates a PDF `Blob` via jsPDF.
2. Creates an object URL with `URL.createObjectURL(blob)`.
3. Creates a hidden `<a>` element with `href = blobUrl` and `download = "invoice-…pdf"`.
4. Calls `anchor.click()` programmatically.

In Chrome and Firefox this triggers an immediate file download. In Safari,
the programmatic `click()` on a dynamically created anchor with a blob URL is
**silently ignored** — no download dialog appears and no file is saved.

### Root cause

Safari's security model restricts programmatic navigation to blob URLs unless
the click originates from a direct user gesture on the element itself (not a
proxy call). This is a long-standing WebKit limitation tracked at
[bugs.webkit.org/show_bug.cgi?id=167341](https://bugs.webkit.org/show_bug.cgi?id=167341).

### Workaround (implemented)

The `PdfDownload` component wraps `anchor.click()` in a `try/catch` and falls
back to `window.open(blobUrl, '_blank')` on failure. In Safari this opens the
PDF in a new browser tab, from which the user can manually save the file via
**File → Save As** or the share sheet on iOS.

```ts
try {
  anchor.click();
} catch {
  // Safari fallback: open in new tab.
  window.open(blobUrl, '_blank');
}
```

> **Note:** In sandboxed iframe environments (e.g. embedded previews,
> StackBlitz) Safari may also block `window.open()`. In that case the user
> must open the app in a standalone tab.

### Blob URL revocation

The object URL is revoked after a 10-second delay (`setTimeout`) to give the
browser time to initiate the download or open the tab before the URL is
invalidated. Revoking too early causes a blank page in the new tab on Safari.

---

## KI-002 · Android Chrome: PDF opens in-browser instead of downloading

**Severity:** P3  
**Browsers affected:** Chrome for Android 126+  
**Status:** Accepted — expected platform behaviour.

### Description

On Android Chrome, tapping **Download PDF** opens the generated PDF in the
browser's built-in PDF viewer rather than saving it directly to the Downloads
folder. The `download` attribute on the anchor element is respected on desktop
Chrome but Android Chrome routes blob URLs through the viewer first.

The user can save the file from the viewer using the overflow menu → **Download**.

---

## KI-003 · Private Browsing: localStorage unavailable

**Severity:** P3  
**Browsers affected:** Safari Private Browsing (throws `QuotaExceededError` on `setItem`)

### Description

In Safari's Private Browsing mode, `localStorage.setItem()` throws a
`QuotaExceededError` even when no data has been written. All `localStorage`
calls in `invoiceStorage.ts` are wrapped in `try/catch`, so the application
continues to function — state is simply not persisted across page reloads.

---

## KI-004 · Safari sandboxed iframe: window.confirm may be suppressed

**Severity:** P3  
**Browsers affected:** Safari in sandboxed `<iframe>` contexts

### Description

The **New Invoice** confirmation uses `window.confirm()`. In Safari, `confirm()`
called from within a cross-origin sandboxed iframe returns `false` without
showing a dialog. This is not an issue when the app is served as a top-level
document.
