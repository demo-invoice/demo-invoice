/**
 * pdfDownload utility tests
 *
 * Verifies proactive Safari feature-detection and the correct download path
 * for both Safari and non-Safari browsers.
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

  it('does NOT call window.open with anything other than the blob url for Safari', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    downloadPdf('blob:http://localhost/abc', 'invoice.pdf');
    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('does NOT create a download anchor element for Safari', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    downloadPdf('blob:http://localhost/abc', 'invoice.pdf');
    // The download anchor is appended to body only on the non-Safari path
    expect(appendSpy).not.toHaveBeenCalled();
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
    vi.spyOn(HTMLElement.prototype, 'click').mockImplementation(() => {});

    downloadPdf('blob:http://localhost/xyz', 'my-invoice.pdf');

    const downloadAnchor = anchors.find((a) => a.download === 'my-invoice.pdf');
    expect(downloadAnchor).toBeDefined();
    expect(downloadAnchor?.href).toContain('blob:http://localhost/xyz');
  });

  it('appends the anchor to document.body and removes it after click', () => {
    vi.spyOn(HTMLElement.prototype, 'click').mockImplementation(() => {});
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    downloadPdf('blob:http://localhost/xyz', 'invoice.pdf');

    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });
});
