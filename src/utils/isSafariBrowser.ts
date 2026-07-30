/**
 * Determines whether the current browser is Safari.
 *
 * Primary check: User-Agent string contains 'Safari' but not 'Chrome'.
 * (Chrome on desktop also includes 'Safari' in its UA, so we exclude it.)
 *
 * Secondary check (dependency-injected for testability): the anchor element
 * does not support the `download` attribute. This catches Safari on iOS where
 * the UA check may be unreliable. The anchor element is injected via the
 * optional `anchorEl` parameter so jsdom tests can pass a mock without
 * modifying the real prototype.
 *
 * KI-001: On Safari, PDF download falls back to window.open (new tab).
 * localStorage is blocked in Safari private/incognito mode — callers must
 * wrap storage access in try/catch.
 *
 * @param anchorEl - Optional anchor element used for secondary feature detection.
 *   Defaults to document.createElement('a'). Inject a mock in tests.
 * @returns true if the browser is identified as Safari.
 */
export function isSafariBrowser(
  anchorEl: HTMLAnchorElement = document.createElement('a'),
): boolean {
  const ua = navigator.userAgent;

  // Primary check: UA-based detection.
  const uaIsSafari = ua.includes('Safari') && !ua.includes('Chrome');
  if (uaIsSafari) return true;

  // Secondary check: feature-detect missing `download` attribute support.
  // Safari (especially iOS) does not support the `download` attribute on <a>.
  const downloadUnsupported = !('download' in anchorEl);
  return downloadUnsupported;
}
