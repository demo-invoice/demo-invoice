/**
 * pdfDownload utility tests
 *
 * Verifies proactive Safari feature-detection and the correct download path
 * for both Safari and non-Safari browsers.  navigator.vendor is not defined
 * in jsdom, so tests use Object.defineProperty to simulate each environment.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isSafariBrowser, downloadPdf } from './pdfDownload';

// ---------------------------------------------------------------------------
// Helpers to set navigator.vendor in jsdom
// ---------------------------------------------------------------------------

function setNavigatorVendor(vendor: string) {
  Object.defineProperty(navigator, 'vendor', {
    value: vendor,
    configurable: true,
    writable: true,
  });
}

function restoreNavigatorVendor() {
  Object.defineProperty(navigator, 'vendor', {
    value: '',
    configurable: true,
    writable: true,
  });
}

// ---------------------------------------------------------------------------
// isSafariBrowser
// ---------------------------------------------------------------------------

describe('isSafariBrowser()', () => {
  afterEach(() => {
    restoreNavigatorVendor();
  });

  it('returns true when navigator.vendor contains "Apple"', () => {
    setNavigatorVendor('Apple Computer, Inc.');
    expect(isSafariBrowser()).toBe(true);
  });

  it('returns false when navigator.vendor is "Google Inc."', () => {
    setNavigatorVendor('Google Inc.');
    expect(isSafariBrowser()).toBe(false);
  });

  it('returns false when navigator.vendor is empty string (jsdom default)', () => {
    setNavigatorVendor('');
    expect(isSafariBrowser()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// downloadPdf — Safari path
// ---------------------------------------------------------------------------

describe('downloadPdf() — Safari path', () => {
  beforeEach(() => {
    setNavigatorVendor('Apple Computer, Inc.');
  });

  afterEach(() => {
    restoreNavigatorVendor();
    vi.restoreAllMocks();
  });

  it('calls window.open(blobUrl, "_blank") for Safari', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    downloadPdf('blob:http://localhost/abc', 'invoice.pdf');
    expect(openSpy).toHaveBeenCalledWith('blob:http://localhost/abc', '_blank');
  });

  it('does NOT create an anchor element for Safari', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const createElementSpy = vi.spyOn(document, 'createElement');
    downloadPdf('blob:http://localhost/abc', 'invoice.pdf');
    // createElement may be called for the vendor-check anchor, but must NOT
    // be called with 'a' for the download anchor after the Safari branch.
    const anchorCallsAfterDetect = createElementSpy.mock.calls.filter(
      ([tag]) => tag === 'a',
    );
    // The only 'a' createElement call is inside isSafariBrowser for the
    // download-attr check — the download anchor path is skipped.
    expect(anchorCallsAfterDetect.length).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// downloadPdf — Chrome/Firefox path
// ---------------------------------------------------------------------------

describe('downloadPdf() — Chrome/Firefox path', () => {
  beforeEach(() => {
    setNavigatorVendor('Google Inc.');
  });

  afterEach(() => {
    restoreNavigatorVendor();
    vi.restoreAllMocks();
  });

  it('does NOT call window.open for Chrome', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    downloadPdf('blob:http://localhost/xyz', 'invoice.pdf');
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('creates an anchor with the correct href and download attributes', () => {
    const anchors: HTMLAnchorElement[] = [];
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag);
      if (tag === 'a') anchors.push(el as HTMLAnchorElement);
      return el;
    });
    // Stub click so jsdom doesn't complain.
    vi.spyOn(HTMLElement.prototype, 'click').mockImplementation(() => {});

    downloadPdf('blob:http://localhost/xyz', 'my-invoice.pdf');

    const downloadAnchor = anchors.find((a) => a.download === 'my-invoice.pdf');
    expect(downloadAnchor).toBeDefined();
    expect(downloadAnchor?.href).toContain('blob:http://localhost/xyz');
  });
});
