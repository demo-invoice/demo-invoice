import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration with React plugin and Vitest setup.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
