import React, { useState } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { validate } from '../hooks/useInvoiceValidation';
import type { ValidationErrors } from '../hooks/useInvoiceValidation';

/**
 * Toolbar containing the Download PDF button.
 *
 * handleDownloadPDF:
 * 1. Validates invoice state.
 * 2. If invalid, surfaces errors and returns early — window.print() is NOT called.
 * 3. Sets document.title to `Invoice-{invoiceNumber}` as a filename hint for the
 *    browser's Save As dialog.
 * 4. Calls window.print() (synchronous — opens the print/save dialog).
 * 5. Restores document.title via setTimeout so the restoration happens after the
 *    print dialog closes (which is asynchronous from the user's perspective).
 */
export function Toolbar() {
  const { state } = useInvoice();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isPrinting, setIsPrinting] = useState(false);

  function handleDownloadPDF() {
    if (isPrinting) return;

    const result = validate(state);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    // Clear any previous errors.
    setErrors({});

    const originalTitle = document.title;
    const invoiceNumber = state.invoiceNumber.trim();
    document.title = invoiceNumber ? `Invoice-${invoiceNumber}` : 'Invoice-Draft';

    setIsPrinting(true);
    window.print();

    // Restore title after the print dialog has had time to close.
    setTimeout(() => {
      document.title = originalTitle;
      setIsPrinting(false);
    }, 500);
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="toolbar">
      <span className="toolbar__title">Invoice App</span>
      <div className="toolbar__actions">
        <button
          className="download-btn"
          onClick={handleDownloadPDF}
          disabled={isPrinting}
          aria-label="Download invoice as PDF"
        >
          {isPrinting ? 'Preparing…' : 'Download PDF'}
        </button>
      </div>
      {hasErrors && (
        <ul className="toolbar__errors" role="alert" aria-live="assertive">
          {Object.values(errors).map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
