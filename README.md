# demo-invoice

[![Deploy to Netlify](https://github.com/demo-invoice/demo-invoice/actions/workflows/deploy.yml/badge.svg)](https://github.com/demo-invoice/demo-invoice/actions/workflows/deploy.yml)
[![Verify](https://github.com/demo-invoice/demo-invoice/actions/workflows/verify.yml/badge.svg)](https://github.com/demo-invoice/demo-invoice/actions/workflows/verify.yml)

## 🚀 Live Demo

> **URL:** [https://invoice-generator.netlify.app](https://invoice-generator.netlify.app)
>
> ⚠️ **Working assumption (confidence 0.35):** The Netlify subdomain above is a
> placeholder — replace it with the actual URL after the first successful deploy.
> No custom domain is configured until explicitly requested (Sara / PO to confirm).
> This assumption is flagged in the PR description.

---

## Development

```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:5173)
npm run dev

# Production build (output → dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment

The app is deployed to **Netlify** via GitHub Actions on every push to `main`.

### How it works

| Step | Tool |
|------|------|
| Build | `npm run build` → `dist/` via Vite |
| Deploy | `nwtgck/actions-netlify@v3` action |
| Trigger | Push to `main` branch |
| Config | `netlify.toml` at repo root |

### First-time setup

1. Create a new site on [Netlify](https://app.netlify.com) (or let the first
   workflow run auto-create it if `NETLIFY_SITE_ID` is left blank initially).
2. Copy the **Site ID** from *Site settings → General → Site details*.
3. Generate a **Personal Access Token** from *Netlify user settings → Applications*.
4. Add both as GitHub repository secrets (*Settings → Secrets and variables →
   Actions*):

   | Secret name | Value |
   |-------------|-------|
   | `NETLIFY_AUTH_TOKEN` | Your Netlify personal access token |
   | `NETLIFY_SITE_ID` | Your Netlify site API ID |

5. Push to `main` — the workflow will build and deploy automatically.
6. Update the **Live Demo** URL above with the assigned `*.netlify.app` subdomain.

### Netlify configuration (`netlify.toml`)

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **SPA routing:** All paths redirect to `/index.html` (HTTP 200) so
  client-side routes never return a 404 on direct navigation or refresh.
- **Security headers:** HSTS, CSP (includes `blob:` for PDF download), `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

### Smoke test checklist (post-deploy)

- [ ] Chrome: open live URL, navigate to a client-side route, refresh — no 404
- [ ] Chrome: generate and download a PDF — blob URL opens / file downloads correctly
- [ ] Firefox: repeat PDF download test
- [ ] DevTools → Network: confirm all assets load over HTTPS, no mixed-content warnings
- [ ] DevTools → Console: no CSP violation errors

---

Initialized by your AI team so we have a base branch to build on.
