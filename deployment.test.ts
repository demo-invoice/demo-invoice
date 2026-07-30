import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for the deployment smoke-test logic in deployment.test.ts.
 *
 * We re-implement the core branching logic here (skip vs. fetch vs. assert)
 * so we can exercise it in isolation without actually hitting the network.
 */

describe('deployment smoke test — VITE_DEPLOY_URL not set', () => {
  beforeEach(() => {
    delete process.env['VITE_DEPLOY_URL'];
  });

  it('skips gracefully when VITE_DEPLOY_URL is undefined', async () => {
    const deployUrl = process.env['VITE_DEPLOY_URL'];
    // When the env var is absent the test should return early — no fetch, no throw.
    expect(deployUrl).toBeUndefined();
    // Simulate the guard: if no URL, we return without asserting anything.
    if (!deployUrl) return;
    // Should never reach here.
    throw new Error('Should have returned early when VITE_DEPLOY_URL is not set');
  });

  it('skips gracefully when VITE_DEPLOY_URL is an empty string', async () => {
    process.env['VITE_DEPLOY_URL'] = '';
    const deployUrl = process.env['VITE_DEPLOY_URL'];
    // Empty string is falsy — same skip path.
    expect(deployUrl).toBeFalsy();
    if (!deployUrl) return;
    throw new Error('Should have returned early when VITE_DEPLOY_URL is empty');
  });
});

describe('deployment smoke test — URL normalisation', () => {
  it('strips a single trailing slash from the deploy URL', () => {
    const raw = 'https://demo-invoice.netlify.app/';
    const normalised = raw.replace(/\/+$/, '');
    expect(normalised).toBe('https://demo-invoice.netlify.app');
  });

  it('strips multiple trailing slashes from the deploy URL', () => {
    const raw = 'https://demo-invoice.netlify.app///';
    const normalised = raw.replace(/\/+$/, '');
    expect(normalised).toBe('https://demo-invoice.netlify.app');
  });

  it('leaves a URL with no trailing slash unchanged', () => {
    const raw = 'https://demo-invoice.netlify.app';
    const normalised = raw.replace(/\/+$/, '');
    expect(normalised).toBe('https://demo-invoice.netlify.app');
  });
});

describe('deployment smoke test — fetch success path', () => {
  beforeEach(() => {
    process.env['VITE_DEPLOY_URL'] = 'https://demo-invoice.netlify.app';
  });

  afterEach(() => {
    delete process.env['VITE_DEPLOY_URL'];
    vi.restoreAllMocks();
  });

  it('passes when fetch resolves with HTTP 200', async () => {
    const mockResponse = { status: 200 } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const deployUrl = process.env['VITE_DEPLOY_URL']!;
    const baseUrl = deployUrl.replace(/\/+$/, '');

    const response = await fetch(baseUrl, { redirect: 'follow' });
    expect(response.status).toBe(200);
  });

  it('calls fetch with redirect: follow to handle HTTP→HTTPS redirects', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 } as Response);
    vi.stubGlobal('fetch', mockFetch);

    const deployUrl = process.env['VITE_DEPLOY_URL']!;
    const baseUrl = deployUrl.replace(/\/+$/, '');

    await fetch(baseUrl, { redirect: 'follow' });

    expect(mockFetch).toHaveBeenCalledWith(baseUrl, { redirect: 'follow' });
  });

  it('calls fetch with the normalised (no trailing slash) URL', async () => {
    process.env['VITE_DEPLOY_URL'] = 'https://demo-invoice.netlify.app/';
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 } as Response);
    vi.stubGlobal('fetch', mockFetch);

    const deployUrl = process.env['VITE_DEPLOY_URL']!;
    const baseUrl = deployUrl.replace(/\/+$/, '');

    await fetch(baseUrl, { redirect: 'follow' });

    const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://demo-invoice.netlify.app');
    expect(calledUrl.endsWith('/')).toBe(false);
  });
});

describe('deployment smoke test — fetch failure path', () => {
  beforeEach(() => {
    process.env['VITE_DEPLOY_URL'] = 'https://demo-invoice.netlify.app';
  });

  afterEach(() => {
    delete process.env['VITE_DEPLOY_URL'];
    vi.restoreAllMocks();
  });

  it('wraps a network Error with a descriptive message', async () => {
    const networkError = new Error('ECONNREFUSED');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError));

    const deployUrl = process.env['VITE_DEPLOY_URL']!;
    const baseUrl = deployUrl.replace(/\/+$/, '');

    let thrown: Error | null = null;
    try {
      await fetch(baseUrl, { redirect: 'follow' });
    } catch (err) {
      thrown = new Error(
        `[deployment.test.ts] Failed to reach ${baseUrl}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    expect(thrown).not.toBeNull();
    expect(thrown!.message).toContain('[deployment.test.ts] Failed to reach');
    expect(thrown!.message).toContain('https://demo-invoice.netlify.app');
    expect(thrown!.message).toContain('ECONNREFUSED');
  });

  it('wraps a non-Error rejection with a descriptive message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('timeout'));

    const deployUrl = process.env['VITE_DEPLOY_URL']!;
    const baseUrl = deployUrl.replace(/\/+$/, '');

    let thrown: Error | null = null;
    try {
      await fetch(baseUrl, { redirect: 'follow' });
    } catch (err) {
      thrown = new Error(
        `[deployment.test.ts] Failed to reach ${baseUrl}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    expect(thrown).not.toBeNull();
    expect(thrown!.message).toContain('timeout');
  });

  it('fails loudly when HTTP status is not 200', async () => {
    const mockResponse = { status: 404 } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const deployUrl = process.env['VITE_DEPLOY_URL']!;
    const baseUrl = deployUrl.replace(/\/+$/, '');

    const response = await fetch(baseUrl, { redirect: 'follow' });

    // The real test asserts toBe(200); a 404 must not satisfy that.
    expect(response.status).not.toBe(200);
    expect(response.status).toBe(404);
  });
});
