import { describe, it, expect } from 'vitest';

/**
 * Smoke test: verifies the live deployed URL returns HTTP 200.
 *
 * - In local dev (VITE_DEPLOY_URL not set): test is skipped gracefully.
 * - In CI (VITE_DEPLOY_URL must be set): missing var causes a loud failure
 *   so the problem is immediately visible rather than silently passing.
 */
describe('deployment smoke test', () => {
  it('live URL is reachable and returns HTTP 200', async () => {
    const deployUrl = process.env['VITE_DEPLOY_URL'];

    // Graceful skip in local dev where the env var is not configured.
    if (!deployUrl) {
      console.warn(
        '[deployment.test.ts] VITE_DEPLOY_URL is not set — skipping smoke test. ' +
          'This test MUST run (and pass) in CI where the variable is required.'
      );
      return;
    }

    // Normalise: strip trailing slash so URL construction is predictable.
    const baseUrl = deployUrl.replace(/\/+$/, '');

    let response: Response;
    try {
      response = await fetch(baseUrl, {
        // Follow redirects (e.g. HTTP → HTTPS) automatically.
        redirect: 'follow',
      });
    } catch (err) {
      throw new Error(
        `[deployment.test.ts] Failed to reach ${baseUrl}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    expect(
      response.status,
      `Expected HTTP 200 from ${baseUrl} but got ${response.status}`
    ).toBe(200);
  });
});
