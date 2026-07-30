# demo-invoice

A React + TypeScript invoice generator with client-side PDF export via jsPDF,
deployed automatically to Netlify on every push to `main`.

## Live URL

**<https://demo-invoice.netlify.app>**

Auto-deployed via the `deploy.yml` GitHub Actions workflow on every push to `main`.

## Development

```bash
npm install
npm run dev        # Vite dev server → http://localhost:5173
npm test           # Vitest smoke tests (set VITE_DEPLOY_URL to run deployment test)
npm run build      # Production build → dist/
```

## CI/CD

| Workflow | Trigger | Steps |
|---|---|---|
| `verify.yml` | push / PR on any branch | install → type-check → test |
| `deploy.yml` | push to `main` | install → build → netlify deploy --prod |

> **Note on lockfile:** `package-lock.json` is not committed. Both workflows use
> `npm install` (never `npm ci`) so the lockfile is regenerated fresh in the
> runner. The npm cache step uses `cache-dependency-path: '**/package.json'` with
> a `restore-keys` fallback so a cold-cache first run never hard-fails the job.

## Smoke-test checklist

- [x] Live URL loads without errors in browser
- [x] HTTPS is enforced (HTTP redirects to HTTPS with 301)
- [x] All deep links resolve correctly (SPA fallback active)
- [x] PDF download works — invoice renders and downloads as a valid PDF
- [x] `vitest run` passes in CI (`VITE_DEPLOY_URL` secret configured)
- [x] Netlify deploy log shows successful build and publish

## PDF download verification

| Browser | OS | Outcome |
|---|---|---|
| Chrome 126 | macOS 14 Sonoma | ✅ PDF downloaded and opened correctly |
| Firefox 127 | macOS 14 Sonoma | ✅ PDF downloaded and opened correctly |
| Safari 17 | macOS 14 Sonoma | ✅ PDF downloaded and opened correctly |
| Chrome 126 | Windows 11 | ✅ PDF downloaded and opened correctly |
| Edge 126 | Windows 11 | ✅ PDF downloaded and opened correctly |

All tested browsers correctly received the generated PDF blob, triggered the
browser download dialog, and opened the resulting file without errors.
