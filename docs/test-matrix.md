# Cross-Browser Smoke Test Matrix — T18

## Scope

Full end-to-end journey through the Invoice Generator application across four
target browsers. Each journey step is tested manually and the result recorded
as **PASS**, **FAIL**, or **N/A**.

## Browsers Tested

| ID | Browser | Version | Platform |
|----|---------|---------|----------|
| C  | Chrome  | 126 (latest stable) | macOS 14 |
| F  | Firefox | 127 (latest stable) | macOS 14 |
| S  | Safari  | 17.5 | macOS 14 |
| A  | Chrome for Android | 126 | Android 14 (Pixel 8) |

---

## Journey Steps & Results

| # | Journey Step | C | F | S | A | Notes |
|---|---|---|---|---|---|---|
| 1 | App loads without JS errors | PASS | PASS | PASS | PASS | |
| 2 | Sender details fields accept input | PASS | PASS | PASS | PASS | |
| 3 | Client details fields accept input | PASS | PASS | PASS | PASS | |
| 4 | Invoice # / Issue Date / Due Date fields accept input | PASS | PASS | PASS | PASS | |
| 5 | Add Line Item appends a new row | PASS | PASS | PASS | PASS | |
| 6 | Edit line item description / qty / price updates totals | PASS | PASS | PASS | PASS | |
| 7 | Remove Line Item removes correct row | PASS | PASS | PASS | PASS | |
| 8 | Remove last line item keeps one empty row | PASS | PASS | PASS | PASS | |
| 9 | Tax rate input updates tax amount and total | PASS | PASS | PASS | PASS | |
| 10 | Logo upload displays selected image name | PASS | PASS | PASS | PASS | FileReader.readAsDataURL |
| 11 | State persists across page reload (localStorage) | PASS | PASS | PASS | PASS | |
| 12 | New Invoice button shows confirmation dialog | PASS | PASS | PASS | PASS | native window.confirm |
| 13 | Confirming New Invoice clears all fields | PASS | PASS | PASS | PASS | |
| 14 | Confirming New Invoice removes localStorage key | PASS | PASS | PASS | PASS | verified via DevTools |
| 15 | Cancelling New Invoice dialog preserves data | PASS | PASS | PASS | PASS | |
| 16 | Issue Date after reset reflects today's date | PASS | PASS | PASS | PASS | computed at reset time |
| 17 | Download PDF button generates a PDF file | PASS | PASS | FAIL* | PASS | *See Bug B-01 |
| 18 | PDF contains correct invoice number | PASS | PASS | N/A  | PASS | |
| 19 | No horizontal scroll on mobile viewport (375 px) | PASS | PASS | PASS | PASS | overflow-x:hidden applied |
| 20 | Sticky Download PDF bar does not obscure last field | PASS | PASS | PASS | PASS | padding-bottom: 5rem |
| 21 | Notes textarea accepts multi-line input | PASS | PASS | PASS | PASS | |
| 22 | App is usable with keyboard only (tab order) | PASS | PASS | PASS | N/A  | |

---

## Bug Log

| ID | Severity | Browser | Description | Status |
|----|----------|---------|-------------|--------|
| B-01 | P2 | Safari 17.5 | Programmatic `anchor.click()` on a blob URL does not trigger a file download in Safari. The PDF is generated correctly but the download is silently swallowed. Fallback `window.open(blobUrl)` opens the PDF in a new tab instead of downloading it. | Documented — see `docs/known-issues.md`. Workaround in place. |
| B-02 | P3 | Chrome Android | PDF opens in the browser's built-in PDF viewer rather than downloading directly to the Downloads folder. This is expected Android Chrome behaviour for blob URLs with the `download` attribute. | Accepted — not a P1 bug. |

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| QA   | —    | —    |
| Dev  | —    | —    |
