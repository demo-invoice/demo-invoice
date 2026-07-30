import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration with Vitest settings.
 * globals: true — required so @testing-library/jest-dom's top-level expect.extend() call
 * in test-setup.ts finds `expect` as a global. Individual test files may still import
 * { describe, it, expect, vi } explicitly from 'vitest' — both styles work with globals: true.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
