# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Custom Branding — Font Setup (Required Pre-Deploy Step)

The custom branding feature allows each user to choose a font family for their
invoices. The PDF renderer loads fonts from TTF files at runtime. **These files
are not committed to the repository** (binary assets; too large for git).

You must download them manually before running the server or building the app.

### Required TTF files

Place all files in `assets/fonts/` at the repository root:

| CSS font-family name | Expected filename              |
|----------------------|--------------------------------|
| Inter                | `Inter-Regular.ttf`            |
| Roboto               | `Roboto-Regular.ttf`           |
| Lato                 | `Lato-Regular.ttf`             |
| Open Sans            | `OpenSans-Regular.ttf`         |
| Merriweather         | `Merriweather-Regular.ttf`     |
| Playfair Display     | `PlayfairDisplay-Regular.ttf`  |
| Source Sans Pro      | `SourceSansPro-Regular.ttf`    |

### Where to download

All fonts are available free from **Google Fonts**: <https://fonts.google.com>

Search for each font by name, click **Download family**, and rename the TTF
file to match the expected filename in the table above.

### Verifying locally

Run the font-check script before deploying:

```bash
npm run verify:fonts
```

This script (`scripts/check-fonts.js`) checks that every expected TTF file
exists in `assets/fonts/`. It exits with code `0` on success and code `1` with
a descriptive error message listing each missing file.

The same script also runs automatically as part of `npm install` (via the
`prepare` lifecycle hook).

### What happens if fonts are missing

- **`npm install` / `npm run verify:fonts`** — exits non-zero with a clear
  error listing the missing files.
- **PDF generation at runtime** — the server throws a descriptive `Error`
  including the expected file path. There is **no silent fallback** to
  Helvetica or any other font.

---

## Development

```bash
npm install      # also runs prepare → check-fonts.js
npm test         # vitest
npm run dev      # tsx watch src/index.ts
```
