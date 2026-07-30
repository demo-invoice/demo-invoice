import { isSafariBrowser } from '../../utils/isSafariBrowser';

interface PdfDownloadProps {
  /** URL of the PDF blob or data URI to download. */
  pdfUrl: string;
  /** Suggested filename for the download. */
  filename?: string;
}

/**
 * Renders a button that triggers a PDF download.
 *
 * On non-Safari browsers: creates a hidden <a download> link and clicks it.
 * On Safari: falls back to window.open (opens PDF in a new tab).
 *
 * KI-001: Safari does not honour the `download` attribute on anchor elements
 * for cross-origin or blob URLs. The window.open fallback opens the PDF in a
 * new tab instead of downloading it. This is a known Safari limitation with
 * no reliable client-side workaround without a server-side Content-Disposition
 * header. Logged as follow-up issue KI-001.
 *
 * Note: localStorage is blocked in Safari private/incognito mode. The
 * InvoiceProvider persistence effect wraps all storage calls in try/catch.
 */
export function PdfDownload({
  pdfUrl,
  filename = 'invoice.pdf',
}: PdfDownloadProps): JSX.Element {
  function handleDownload(): void {
    if (isSafariBrowser()) {
      // KI-001: Safari fallback — opens PDF in new tab.
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Standard path: programmatic anchor click with download attribute.
    const anchor = document.createElement('a');
    anchor.href = pdfUrl;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  return (
    <button type="button" onClick={handleDownload}>
      Download PDF
    </button>
  );
}
