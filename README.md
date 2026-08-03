# demo-invoice

Initialized by your AI team so we have a base branch to build on.

---

## Branding (T25 — Custom Colors & Fonts Per User)

Each user can configure a **primary color**, **secondary color**, and **font family** that are applied to their generated invoice PDFs and reflected in the live preview UI.

### Approved Fonts

Exactly 7 fonts are supported (PO decision T25 — no custom font upload in this iteration):

| Key (API / DB) | Display Name     |
|----------------|------------------|
| `Inter`        | Inter            |
| `Roboto`       | Roboto           |
| `Lato`         | Lato             |
| `Merriweather` | Merriweather     |
| `OpenSans`     | Open Sans        |
| `PlayfairDisplay` | Playfair Display |
| `Montserrat`   | Montserrat       |

### Color Format

Colors must be **6-digit hex strings** including the leading `#`, e.g. `#2563EB`.  
Shorthand (`#FFF`), named colors (`red`), and values without `#` are rejected with a `400` error.

### API Endpoints

#### `GET /api/users/:userId/branding`

Returns the user's saved branding record. If the user has never saved branding, returns the defaults:

```json
{
  "primary_color": "#2563EB",
  "secondary_color": "#64748B",
  "font_family": "Inter"
}
```

**Auth**: The authenticated user (`req.user.id`) must match `:userId`. Returns `403` otherwise.

#### `PUT /api/users/:userId/branding`

Saves (upserts) the user's branding. Request body:

```json
{
  "primary_color": "#FF5733",
  "secondary_color": "#33FF57",
  "font_family": "Roboto"
}
```

Returns `200` with the saved record on success, or `400` with field-level errors on validation failure.

**Auth**: Same isolation rule — `403` if `:userId` does not match the authenticated session.

### Font Bundling (PDF Rendering)

PDF generation uses [PDFKit](https://pdfkit.org/) with fonts loaded **from disk** (`assets/fonts/*.ttf`) — zero external network dependency at render time.

**Before deploying**, download and commit the following TTF files into `assets/fonts/`:

- `Inter.ttf`
- `Roboto.ttf`
- `Lato.ttf`
- `Merriweather.ttf`
- `OpenSans.ttf`
- `PlayfairDisplay.ttf`
- `Montserrat.ttf`

All fonts are licensed under the [SIL Open Font License (OFL)](https://scripts.sil.org/OFL).  
If a font file is missing at render time, the renderer falls back to PDFKit's built-in **Helvetica** and logs a warning — the invoice still generates rather than crashing.

### Defaults

If a user has never configured branding, all layers (API, service, renderer) fall back to:

```
primary_color:   #2563EB
secondary_color: #64748B
font_family:     Inter
```

No null/undefined values ever reach the PDF renderer.

### Not Supported (This Iteration)

- Custom font upload — users select from the fixed list of 7 approved fonts only (PO decision T25).
- Shorthand or named CSS colors — only full 6-digit hex is accepted.
