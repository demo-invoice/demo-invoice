import { describe, it, expect, vi, afterEach } from 'vitest';
import { isSafariBrowser } from './isSafariBrowser';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isSafariBrowser', () => {
  // ---------------------------------------------------------------------------
  // Primary UA path
  // ---------------------------------------------------------------------------

  it('returns true for a Safari UA string (primary path)', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    );
    expect(isSafariBrowser()).toBe(true);
  });

  it('returns false for a Chrome UA string (primary path)', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    );
    expect(isSafariBrowser()).toBe(false);
  });

  it('returns false for a Firefox UA string (primary path)', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
    );
    expect(isSafariBrowser()).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Secondary feature-detection path (dependency-injected anchor)
  // AC: stub UA to return false, remove download from anchor, assert true
  // ---------------------------------------------------------------------------

  it('returns true via secondary path when anchor lacks download attribute (Safari iOS)', () => {
    // Step 1: stub UA so primary check returns false.
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    );

    // Step 2: create a mock anchor WITHOUT the `download` property.
    // Plain object cast — only the feature-detect matters here.
    const mockAnchor = {} as HTMLAnchorElement;
    // Confirm 'download' is genuinely absent so the secondary check fires.
    expect('download' in mockAnchor).toBe(false);

    // Step 3: secondary branch must return true.
    expect(isSafariBrowser(mockAnchor)).toBe(true);
  });

  it('returns false via secondary path when anchor has download attribute', () => {
    // UA returns false for primary check (Chrome UA).
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    );

    // Mock anchor WITH download property — secondary check must return false.
    const mockAnchor = { download: '' } as HTMLAnchorElement;
    expect(isSafariBrowser(mockAnchor)).toBe(false);
  });

  it('primary check short-circuits before secondary check on real Safari UA', () => {
    // If primary returns true, secondary is never reached regardless of anchor.
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    );
    // Even if anchor has download, result is still true (primary wins).
    const mockAnchor = { download: '' } as HTMLAnchorElement;
    expect(isSafariBrowser(mockAnchor)).toBe(true);
  });
});
