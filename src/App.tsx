import { InvoiceProvider } from './context/InvoiceContext';
import { Toolbar } from './components/Toolbar';
import { InvoicePreview } from './components/InvoicePreview';
// InvoiceForm import removed — component not yet present; add when InvoiceForm.tsx is created

export default function App() {
  return (
    <InvoiceProvider>
      <Toolbar />
      <main className="app-main">
        <InvoicePreview />
      </main>
    </InvoiceProvider>
  );
}
