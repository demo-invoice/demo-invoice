/**
 * vitest.config.ts
 *
 * Sets environment to 'node' so that Node built-ins (fs, path, url)
 * used in print.css.test.ts are available without polyfilling.
 *
 * If jsdom-based component tests are added in a future iteration,
 * switch to a per-file environment override via the `environmentMatchGlobs`
 * option rather than changing the global default.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
