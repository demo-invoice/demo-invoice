import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// globals: true — vitest injects describe/it/expect/vi globally; test files must NOT import them
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
});
