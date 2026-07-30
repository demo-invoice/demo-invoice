import { describe, it, expect, vi, afterEach } from 'vitest';
import { isSafariBrowser } from './isSafariBrowser';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isSafariBrowser', () => {
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

  /**
   * Secondary Safari detection path — addresses SECONDARY SAFARI DETECTION
   * PATH UNTESTED finding from Zack's iteration-3 review.
   *
   * Strategy:
   * 1. Stub UA so the primary check returns false.
   * 2. Pass a dependency-injected mock anchor element that has no `download`
   *    property (simulating Safari iOS behaviour).
   * 3. Assert isSafariBrowser() returns true via the secondary branch.
   *
   * We do NOT use Object.defineProperty on the real anchor prototype to avoid
   * test pollution between runs.
   */
  it('returns true via secondary path when anchor lacks download attribute (Safari iOS)', () => {
    // Step 1: stub UA so primary check returns false.
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    );

    // Step 2: create a mock anchor without the `download` property.
    // Using a plain object cast — we only need the feature-detect to work.
    const mockAnchor = {} as HTMLAnchorElement;
    // Explicitly ensure 'download' is absent.
    expect('download' in mockAnchor).toBe(false);

    // Step 3: assert secondary branch returns true.
    expect(isSafariBrowser(mockAnchor)).toBe(true);
  });

  it('returns false via secondary path when anchor has download attribute', () => {
    // UA returns false for primary check.
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    );

    // Mock anchor WITH download property.
    const mockAnchor = { download: '' } as HTMLAnchorElement;
    expect(isSafariBrowser(mockAnchor)).toBe(false);
  });
});
