import './DownloadPDFButton.css';

interface DownloadPDFButtonProps {
  /** Optional override for the download action. Defaults to window.print(). */
  onDownload?: () => void;
}

/**
 * DownloadPDFButton
 *
 * On mobile (≤767 px) renders as a `position: fixed` bottom bar so it is
 * always reachable without scrolling.
 * On desktop renders as a normal inline button.
 *
 * Does NOT dispatch to the InvoiceContext reducer — PDF generation is a
 * side-effect, not a state change.
 */
export function DownloadPDFButton({ onDownload }: DownloadPDFButtonProps): JSX.Element {
  function handleClick(): void {
    if (onDownload) {
      onDownload();
    } else {
      window.print();
    }
  }

  return (
    <div className="download-pdf-bar">
      <button
        type="button"
        className="download-pdf-btn"
        onClick={handleClick}
      >
        ⬇ Download PDF
      </button>
    </div>
  );
}
