import './App.css';
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';
import { PreviewPanel } from './components/PreviewPanel/PreviewPanel';
import { DownloadPDFButton } from './components/DownloadPDFButton/DownloadPDFButton';

/**
 * Root layout component.
 *
 * Desktop (≥768 px): two-column flex row — form on the left, preview on the right.
 * Mobile (<768 px):  single-column flex column — form stacked above preview.
 *
 * `.app-content` receives `padding-bottom: var(--sticky-btn-height)` on mobile
 * so the fixed DownloadPDFButton never overlaps scrollable content.
 */
export function App(): JSX.Element {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Invoice Generator</h1>
      </header>

      <main className="app-content">
        <div className="app-columns">
          <section className="app-col app-col--form" aria-label="Invoice form">
            <InvoiceForm />
          </section>

          <section className="app-col app-col--preview" aria-label="Invoice preview">
            <PreviewPanel />
          </section>
        </div>
      </main>

      <DownloadPDFButton />
    </div>
  );
}
