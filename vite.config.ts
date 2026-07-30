import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Vite configuration for demo-invoice. */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
