# demo-invoice

A lightweight invoice generator built with React + Vite, continuously deployed to Netlify.

## Live Demo

<https://demo-invoice.netlify.app>

> **Note:** The URL above will be updated to the exact Netlify-assigned subdomain once the first successful CI deploy completes and the subdomain is confirmed in the Netlify dashboard.

## Getting Started

```bash
npm install
npm run dev
```

## Running Tests

```bash
npm test
```

## CI / CD

- **verify.yml** — runs on every push and pull request: installs deps, type-checks, and runs the Vitest suite.
- **deploy.yml** — runs on every push to `main`: builds the app and deploys to Netlify via `nwtgck/actions-netlify`.

Force HTTPS is enabled via **Netlify dashboard → Site Settings → Domain management → HTTPS → Force HTTPS** (not via `netlify.toml` redirects, which cannot match on URL scheme).

## Smoke-Test Checklist

Items below are checked only after manual verification on the live URL post-green-CI:

- [ ] Live URL loads without errors
- [ ] App is served over HTTPS
- [ ] Client-side routing works on hard refresh
- [ ] PDF generation produces a valid download
- [ ] No console errors on initial load
