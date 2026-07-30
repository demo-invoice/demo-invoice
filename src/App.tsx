import { InvoiceProvider } from './context/InvoiceContext';
import { Header } from './components/Header/Header';
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview/InvoicePreview';
import './App.css';

/**
 * Root application component.
 * Wraps the entire tree in InvoiceProvider and renders the two-panel layout.
 */
export default function App() {
  return (
    <InvoiceProvider>
      <Header />
      <main className="app-main">
        <InvoiceForm />
        <InvoicePreview />
      </main>
    </InvoiceProvider>
  );
}
