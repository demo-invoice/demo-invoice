import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Single consolidated Vite + Vitest config.
 * Replaces vite.config.js — handles both `vite build` and `vitest run`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}', '__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
});
