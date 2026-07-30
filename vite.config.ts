import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration with Vitest setup.
 * jsdom environment enables DOM APIs in tests.
 * setupFiles wires @testing-library/jest-dom matchers globally.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  },
});
