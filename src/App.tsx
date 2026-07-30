import './App.css';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';
import { LineItemsTable } from './components/LineItemsTable/LineItemsTable';
import { PreviewPanel } from './components/PreviewPanel/PreviewPanel';
import { DownloadPDFButton } from './components/DownloadPDFButton/DownloadPDFButton';

/**
 * Root application component.
 * Wraps everything in InvoiceProvider so all children share invoice state.
 * Desktop: two-column layout with inline DownloadPDFButton.
 * Mobile: single-column layout with sticky DownloadPDFButton bar.
 */
export function App(): JSX.Element {
  return (
    <InvoiceProvider>
      <div className="app">
        <div className="app__content">
          <section className="app__form-panel">
            <InvoiceForm />
            <LineItemsTable />
            {/* Desktop-only inline button — hidden on mobile via CSS */}
            <DownloadPDFButton />
          </section>
          <section className="app__preview-panel">
            <PreviewPanel />
          </section>
        </div>
      </div>
    </InvoiceProvider>
  );
}
