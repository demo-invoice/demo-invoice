import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vite + Vitest configuration.
 * Uses jsdom environment for React component tests.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
