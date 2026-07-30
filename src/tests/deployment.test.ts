import { describe, it, expect } from 'vitest';

/**
 * Smoke test suite for the live Netlify deployment.
 *
 * Fails loudly if VITE_DEPLOY_URL is not set, so CI surfaces the
 * misconfiguration rather than silently passing.
 *
 * Requires VITE_DEPLOY_URL to be configured as a repository secret and
 * injected into the CI environment before this suite is executed.
 */
describe('Deployment smoke tests', () => {
  const deployUrl = import.meta.env.VITE_DEPLOY_URL as string | undefined;

  it('VITE_DEPLOY_URL env var is configured', () => {
    if (!deployUrl) {
      throw new Error(
        'VITE_DEPLOY_URL must be set in CI — configure it as a repository secret'
      );
    }
    expect(deployUrl).toMatch(/^\/\//);
  });

  it('live URL returns HTTP 200', async () => {
    if (!deployUrl) {
      throw new Error(
        'VITE_DEPLOY_URL must be set in CI — configure it as a repository secret'
      );
    }

    // No try/catch — a network error must propagate as a test failure.
    const response = await fetch(deployUrl);
    expect(response.status).toBe(200);
  });

  it('live URL is served over HTTPS', () => {
    if (!deployUrl) {
      throw new Error(
        'VITE_DEPLOY_URL must be set in CI — configure it as a repository secret'
      );
    }
    expect(deployUrl.startsWith('https://')).toBe(true);
  });
});
