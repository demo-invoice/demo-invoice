import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const root = resolve(__dirname, '../../');

function read(relPath: string): string {
  return readFileSync(resolve(root, relPath), 'utf-8');
}

// ---------------------------------------------------------------------------
// netlify.toml — build config, redirects, and security headers
// ---------------------------------------------------------------------------
describe('netlify.toml', () => {
  const toml = read('netlify.toml');

  it('specifies npm run build as the build command', () => {
    expect(toml).toContain('command = "npm run build"');
  });

  it('specifies dist as the publish directory', () => {
    expect(toml).toContain('publish = "dist"');
  });

  it('contains a catch-all SPA redirect from /* to /index.html with status 200', () => {
    expect(toml).toContain('from = "/*"');
    expect(toml).toContain('to = "/index.html"');
    expect(toml).toContain('status = 200');
  });

  it('includes HSTS header to enforce HTTPS', () => {
    expect(toml).toContain('Strict-Transport-Security');
    expect(toml).toContain('max-age=31536000');
    expect(toml).toContain('includeSubDomains');
  });

  it('includes a Content-Security-Policy header', () => {
    expect(toml).toContain('Content-Security-Policy');
  });

  it('CSP allows blob: in default-src for PDF generation', () => {
    // The CSP value must include blob: so jsPDF blob URLs are not blocked.
    const cspLine = toml
      .split('\n')
      .find((l) => l.includes('Content-Security-Policy'));
    expect(cspLine).toBeDefined();
    expect(cspLine).toContain('blob:');
  });

  it('CSP default-src includes self and blob:', () => {
    expect(toml).toContain("default-src 'self' blob:");
  });

  it('CSP script-src includes blob: for PDF blob URLs', () => {
    expect(toml).toContain("script-src 'self' blob:");
  });

  it('CSP includes upgrade-insecure-requests to prevent mixed-content', () => {
    expect(toml).toContain('upgrade-insecure-requests');
  });

  it('includes X-Content-Type-Options: nosniff', () => {
    expect(toml).toContain('X-Content-Type-Options');
    expect(toml).toContain('nosniff');
  });

  it('includes X-Frame-Options: DENY to prevent clickjacking', () => {
    expect(toml).toContain('X-Frame-Options');
    expect(toml).toContain('DENY');
  });

  it('includes Referrer-Policy header', () => {
    expect(toml).toContain('Referrer-Policy');
    expect(toml).toContain('strict-origin-when-cross-origin');
  });

  it('includes Permissions-Policy disabling camera, microphone, geolocation', () => {
    expect(toml).toContain('Permissions-Policy');
    expect(toml).toContain('camera=()');
    expect(toml).toContain('microphone=()');
    expect(toml).toContain('geolocation=()');
  });
});

// ---------------------------------------------------------------------------
// package.json — scripts required by CI/CD
// ---------------------------------------------------------------------------
describe('package.json', () => {
  const pkg = JSON.parse(read('package.json'));

  it('has a build script', () => {
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.build).toBe('vite build');
  });

  it('has a test script that exits 0 (no-op safe script)', () => {
    expect(pkg.scripts.test).toBeDefined();
    // Must not be empty — CI references it; the no-op must exit 0.
    expect(pkg.scripts.test).toContain('exit 0');
  });

  it('has a dev script', () => {
    expect(pkg.scripts.dev).toBe('vite');
  });

  it('has a preview script', () => {
    expect(pkg.scripts.preview).toBe('vite preview');
  });

  it('lists react and react-dom as dependencies', () => {
    expect(pkg.dependencies['react']).toBeDefined();
    expect(pkg.dependencies['react-dom']).toBeDefined();
  });

  it('lists vite and @vitejs/plugin-react as devDependencies', () => {
    expect(pkg.devDependencies['vite']).toBeDefined();
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// .github/workflows/deploy.yml — CI/CD pipeline
// ---------------------------------------------------------------------------
describe('.github/workflows/deploy.yml', () => {
  const workflow = read('.github/workflows/deploy.yml');

  it('triggers on push to main branch only', () => {
    expect(workflow).toContain('branches:');
    expect(workflow).toContain('- main');
  });

  it('uses actions/checkout@v4', () => {
    expect(workflow).toContain('actions/checkout@v4');
  });

  it('sets up Node.js version 20', () => {
    expect(workflow).toContain("node-version: '20'");
  });

  it('runs npm install to install dependencies', () => {
    expect(workflow).toContain('run: npm install');
  });

  it('runs npm run build', () => {
    expect(workflow).toContain('run: npm run build');
  });

  it('uses nwtgck/actions-netlify@v3 for deployment', () => {
    expect(workflow).toContain('nwtgck/actions-netlify@v3');
  });

  it('sets publish-dir to ./dist', () => {
    expect(workflow).toContain("publish-dir: './dist'");
  });

  it('sets production-branch to main', () => {
    expect(workflow).toContain('production-branch: main');
  });

  it('sets production-deploy to true', () => {
    expect(workflow).toContain('production-deploy: true');
  });

  it('references NETLIFY_AUTH_TOKEN secret', () => {
    expect(workflow).toContain('NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}');
  });

  it('references NETLIFY_SITE_ID secret', () => {
    expect(workflow).toContain('NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}');
  });

  it('sets a timeout of 10 minutes on the deploy step', () => {
    expect(workflow).toContain('timeout-minutes: 10');
  });
});

// ---------------------------------------------------------------------------
// .github/workflows/verify.yml — CI verify workflow
// ---------------------------------------------------------------------------
describe('.github/workflows/verify.yml', () => {
  const workflow = read('.github/workflows/verify.yml');

  it('triggers on push and pull_request events', () => {
    expect(workflow).toContain('push');
    expect(workflow).toContain('pull_request');
  });

  it('runs npm test', () => {
    expect(workflow).toContain('run: npm test');
  });

  it('uses actions/checkout@v4', () => {
    expect(workflow).toContain('actions/checkout@v4');
  });

  it('sets up Node.js version 20', () => {
    expect(workflow).toContain("node-version: '20'");
  });
});

// ---------------------------------------------------------------------------
// README.md — live demo URL and deployment documentation
// ---------------------------------------------------------------------------
describe('README.md', () => {
  const readme = read('README.md');

  it('contains a Live Demo section', () => {
    expect(readme).toContain('Live Demo');
  });

  it('documents the Netlify live URL', () => {
    expect(readme).toContain('https://invoice-generator.netlify.app');
  });

  it('documents the build command npm run build', () => {
    expect(readme).toContain('npm run build');
  });

  it('documents the output directory dist/', () => {
    expect(readme).toContain('dist/');
  });

  it('documents the required NETLIFY_AUTH_TOKEN secret', () => {
    expect(readme).toContain('NETLIFY_AUTH_TOKEN');
  });

  it('documents the required NETLIFY_SITE_ID secret', () => {
    expect(readme).toContain('NETLIFY_SITE_ID');
  });

  it('references netlify.toml', () => {
    expect(readme).toContain('netlify.toml');
  });

  it('includes a smoke test checklist', () => {
    expect(readme).toContain('Smoke test checklist');
  });

  it('mentions PDF download in the smoke test checklist', () => {
    expect(readme).toContain('PDF');
  });

  it('mentions Chrome and Firefox in the smoke test checklist', () => {
    expect(readme).toContain('Chrome');
    expect(readme).toContain('Firefox');
  });
});

// ---------------------------------------------------------------------------
// vite.config.ts — build output and base path
// ---------------------------------------------------------------------------
describe('vite.config.ts', () => {
  const config = read('vite.config.ts');

  it('sets base to / for Netlify root deployment', () => {
    expect(config).toContain("base: '/'");
  });

  it('sets outDir to dist to match netlify.toml publish directory', () => {
    expect(config).toContain("outDir: 'dist'");
  });

  it('enables sourcemap generation', () => {
    expect(config).toContain('sourcemap: true');
  });

  it('uses the react plugin from @vitejs/plugin-react', () => {
    expect(config).toContain("import react from '@vitejs/plugin-react'");
    expect(config).toContain('react()');
  });
});
