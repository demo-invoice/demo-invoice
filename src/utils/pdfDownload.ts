/**
 * PDF download utility.
 *
 * Safari does not honour the `download` attribute on anchor elements and will
 * navigate the current tab instead of saving the file.  We detect Safari
 * proactively — via `navigator.vendor` (primary) or the absence of the
 * `download` attribute on anchor elements (secondary) — and call
 * `window.open(blobUrl, '_blank')` directly.  No try/catch fallback is used;
 * the feature-detect fires before any DOM interaction.
 *
 * Chrome, Firefox, and Edge all support the `download` attribute, so they
 * receive the standard anchor-click path.
 */

/**
 * Returns `true` when the current browser is Safari (or any Apple WebKit
 * browser that does not support the anchor `download` attribute).
 *
 * Safe to call in Node / SSR environments — guards against `navigator` being
 * undefined.
 */
export function isSafariBrowser(): boolean {
  // SSR / test environments where navigator is not defined
  if (typeof navigator === 'undefined') return false;

  // Primary: Apple sets navigator.vendor to a string containing 'Apple'
  const vendorIsSafari =
    typeof navigator.vendor === 'string' &&
    navigator.vendor.includes('Apple');

  // Secondary: some Safari versions do not expose the `download` attribute
  const noDownloadAttr = !('download' in document.createElement('a'));

  return vendorIsSafari || noDownloadAttr;
}

/**
 * Triggers a PDF download from a Blob URL.
 *
 * - **Safari / Apple WebKit**: opens the blob URL in a new tab via
 *   `window.open(blobUrl, '_blank')` because the `download` attribute is
 *   ignored.
 * - **Chrome / Firefox / Edge**: creates a temporary `<a>` element with the
 *   `download` attribute and programmatically clicks it.
 *
 * @param blobUrl  - Object URL created with `URL.createObjectURL(blob)`.
 * @param filename - Suggested filename for the download (ignored by Safari).
 */
export function downloadPdf(blobUrl: string, filename: string): void {
  if (isSafariBrowser()) {
    // Safari ignores the `download` attribute; open in a new tab instead.
    window.open(blobUrl, '_blank');
    return;
  }

  // Standard path for Chrome, Firefox, Edge.
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
