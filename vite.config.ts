import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for demo-invoice.
 *
 * base is explicitly set to '/' for Netlify subdomain deployment.
 * GitHub Pages subdirectory deploys would require a non-root base path,
 * but Netlify serves from the domain root so '/' is correct here.
 */
export default defineConfig({
  plugins: [react()],
  // Explicit root base — prevents accidental breakage if this config is
  // copied to a GitHub Pages fork that expects a subdirectory path.
  base: '/',
  build: {
    // Output directory must match `publish` in netlify.toml.
    outDir: 'dist',
    // Generate source maps for easier production debugging.
    sourcemap: true,
  },
});
