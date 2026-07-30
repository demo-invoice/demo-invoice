# Cross-Browser Smoke Test Matrix — Iteration 3

**Test run date:** 2024-07-22  
**Build:** `demo-invoice` v0.3.0 (commit `a1b2c3d`)  
**Tester (QA):** Priya Nair  
**Tester (Dev):** Zack Holloway  

---

## Sign-off

| Role | Name           | Date       | Signature         |
|------|----------------|------------|-------------------|
| QA   | Priya Nair     | 2024-07-22 | Priya Nair        |
| Dev  | Zack Holloway  | 2024-07-22 | Zack Holloway     |

---

## Legend

| Symbol  | Meaning                                              |
|---------|------------------------------------------------------|
| PASS    | Feature works as specified                           |
| PASS\*  | Feature works with a known, accepted deviation       |
| FAIL    | Feature does not work; blocking                      |
| N/A     | Not applicable on this platform                      |

---

## Test Steps

| # | Step | Chrome 126 (macOS) | Firefox 128 (macOS) | Safari 17 (macOS) | Chrome 126 (Android) | Safari (iOS 17) |
|---|------|--------------------|---------------------|-------------------|----------------------|-----------------|
| 1  | App loads without console errors                        | PASS | PASS | PASS | PASS  | PASS  |
| 2  | Invoice number field accepts input                      | PASS | PASS | PASS | PASS  | PASS  |
| 3  | From / To fields accept input                           | PASS | PASS | PASS | PASS  | PASS  |
| 4  | Issue Date defaults to today                            | PASS | PASS | PASS | PASS  | PASS  |
| 5  | Due Date field accepts input                            | PASS | PASS | PASS | PASS  | PASS  |
| 6  | Add Line Item button adds a row                         | PASS | PASS | PASS | PASS  | PASS  |
| 7  | Line item description, qty, price accept input          | PASS | PASS | PASS | PASS  | PASS  |
| 8  | Line item totals calculate correctly                    | PASS | PASS | PASS | PASS  | PASS  |
| 9  | Remove line item removes the correct row                | PASS | PASS | PASS | PASS  | PASS  |
| 10 | Logo upload displays preview                            | PASS | PASS | PASS | PASS  | PASS  |
| 11 | State persists across page reload (localStorage)        | PASS | PASS | PASS | PASS  | PASS  |
| 12 | New Invoice button clears all fields                    | PASS | PASS | PASS | PASS  | PASS  |
| 13 | Issue Date resets to today after New Invoice            | PASS | PASS | PASS | PASS  | PASS  |
| 14 | localStorage key removed after New Invoice              | PASS | PASS | PASS | PASS  | PASS  |
| 15 | Reload after New Invoice starts with blank form         | PASS | PASS | PASS | PASS  | PASS  |
| 16 | Download PDF button is present                          | PASS | PASS | PASS | PASS  | PASS  |
| 17 | Download PDF triggers file save / viewer                | PASS | PASS | PASS | PASS\* | PASS  |
| 18 | Downloaded PDF renders invoice content correctly        | PASS | PASS | PASS | PASS  | PASS  |
| 19 | Safari PDF opens in new tab (KI-001)                    | N/A  | N/A  | PASS | N/A   | PASS  |
| 20 | No JS errors in console during full workflow            | PASS | PASS | PASS | PASS  | PASS  |

---

## Footnotes

**PASS\*** (step 17, Android Chrome) — Android Chrome opens the PDF in the
browser's built-in PDF viewer rather than triggering a direct file-system
download.  The user can save the file via the overflow menu.  See
[KI-002](./known-issues.md#ki-002--android-chrome-pdf-opens-in-browser-viewer-instead-of-downloading)
(P3, Accepted).
