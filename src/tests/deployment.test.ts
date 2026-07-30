import { describe, it, expect } from 'vitest';

/**
 * Smoke test suite for the live Netlify deployment.
 *
 * The env-var check test fails loudly if VITE_DEPLOY_URL is not set,
 * so CI surfaces the misconfiguration rather than silently passing.
 *
 * The network-dependent tests are skipped when VITE_DEPLOY_URL is absent
 * (e.g. on branches where the deployment secret is not configured) and
 * run in full when the secret IS present.
 */
const deployUrl = import.meta.env.VITE_DEPLOY_URL as string | undefined;

describe('Deployment smoke tests', () => {
  it('VITE_DEPLOY_URL env var is configured', () => {
    if (!deployUrl) {
      throw new Error(
        'VITE_DEPLOY_URL must be set in CI — configure it as a repository secret'
      );
    }
    expect(deployUrl).toMatch(/^https:\/\//);
  });

  it.skipIf(!deployUrl)('live URL returns HTTP 200', async () => {
    // No try/catch — a network error must propagate as a test failure.
    const response = await fetch(deployUrl!);
    expect(response.status).toBe(200);
  });

  it.skipIf(!deployUrl)('live URL is served over HTTPS', () => {
    expect(deployUrl!.startsWith('https://')).toBe(true);
  });
});
