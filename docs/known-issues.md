# Known Issues

## KI-001 — Safari PDF: opens in new tab instead of downloading

| Field       | Value                          |
|-------------|--------------------------------|
| ID          | KI-001                         |
| Severity    | P3 — Low                       |
| Status      | Accepted (by design)           |
| Browsers    | Safari (macOS & iOS)           |
| Reported    | 2024-07-15                     |
| Last update | 2024-07-22                     |

### Description

When a user clicks **Download PDF** in Safari, the PDF opens in a new browser
tab rather than being saved to disk.  This is expected behaviour: Safari does
not honour the `download` attribute on anchor elements for blob URLs.

### Root cause

The HTML `download` attribute is not supported for blob/object URLs in Safari
(WebKit).  Programmatically clicking an `<a download="…" href="blob:…">` causes
Safari to navigate the new tab to the blob URL and display the PDF inline
instead of triggering a file-system save.

### Implemented workaround

The application uses **proactive feature detection** — no try/catch fallback is
employed.  Before any DOM interaction, `pdfDownload.ts` checks:

```ts
const isSafari =
  (typeof navigator !== 'undefined' &&
   typeof navigator.vendor === 'string' &&
   navigator.vendor.includes('Apple'))
  || !('download' in document.createElement('a'));
```

When `isSafari` is `true`, the utility calls `window.open(blobUrl, '_blank')`
directly, bypassing the anchor-click path entirely.  Chrome, Firefox, and Edge
receive the standard anchor-click path.

### User impact

Safari users see the PDF in a new tab and can save it manually via
**File → Save As** or the share sheet on iOS.  No data is lost.

---

## KI-002 — Android Chrome: PDF opens in browser viewer instead of downloading

| Field       | Value                                  |
|-------------|----------------------------------------|
| ID          | KI-002                                 |
| Severity    | P3 — Low                               |
| Status      | Accepted                               |
| Browsers    | Chrome for Android (all tested versions) |
| Reported    | 2024-07-18                             |
| Last update | 2024-07-22                             |

### Description

On Android Chrome, clicking **Download PDF** opens the PDF in the browser's
built-in PDF viewer rather than saving it to the Downloads folder.  The user
can then tap the overflow menu and choose **Download** to save the file.

### Root cause

Android Chrome intercepts blob-URL navigations for known MIME types (including
`application/pdf`) and routes them through the system PDF viewer.  This is
controlled by the Android WebView / Chrome layer and cannot be overridden from
JavaScript.

### User impact

Minimal — the PDF is displayed correctly and the user can save it with one
additional tap.  No data is lost.

### Resolution

Accepted as a platform limitation.  The test matrix records this step as
**PASS\*** with a reference to this issue.
