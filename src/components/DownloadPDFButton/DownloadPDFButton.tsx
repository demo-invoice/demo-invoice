import './DownloadPDFButton.css';
import { useInvoice } from '../../context/InvoiceContext';

/**
 * Renders two button variants controlled entirely by CSS:
 * - `.download-pdf-bar`: sticky bottom bar, visible only on mobile (< 768px).
 * - `.download-pdf-inline`: inline button, visible only on desktop (≥ 768px).
 *
 * AC #5: desktop layout is never broken by a persistent sticky bar.
 * AC #6: bar height uses --sticky-btn-height CSS variable.
 */
export function DownloadPDFButton(): JSX.Element {
  const { state } = useInvoice();

  /** Placeholder PDF generation — replace with real implementation. */
  function handleDownload(): void {
    // eslint-disable-next-line no-console
    console.log('Download PDF for invoice', state.invoiceNumber);
  }

  return (
    <>
      {/* Mobile sticky bar — hidden on desktop via CSS */}
      <div className="download-pdf-bar">
        <button
          className="download-pdf-bar__btn"
          type="button"
          onClick={handleDownload}
        >
          Download PDF
        </button>
      </div>

      {/* Desktop inline button — hidden on mobile via CSS */}
      <div className="download-pdf-inline">
        <button
          className="download-pdf-inline__btn"
          type="button"
          onClick={handleDownload}
        >
          Download PDF
        </button>
      </div>
    </>
  );
}
