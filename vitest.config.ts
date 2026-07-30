import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Explicitly include deployment.test.ts at the repo root so vitest
    // can find and compile it regardless of where the config lives.
    include: ['deployment.test.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Use the node environment so fetch and process.env work correctly
    // in the smoke test without any browser-specific shims.
    environment: 'node',
  },
});
