import { useState, useCallback } from 'react';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceHistory } from './components/InvoiceHistory';
import { loadInvoiceHistory, appendInvoiceHistory } from './services/invoiceStorage';
import type { SavedInvoiceEntry } from './types/invoice';
import { useInvoice } from './context/InvoiceContext';

function AppInner() {
  const { dispatch } = useInvoice();
  const [history, setHistory] = useState<SavedInvoiceEntry[]>(() => loadInvoiceHistory());

  const handleSaved = useCallback(() => {
    setHistory(loadInvoiceHistory());
  }, []);

  const handleLoad = useCallback((entry: SavedInvoiceEntry) => {
    dispatch({ type: 'LOAD_SAVED_INVOICE', payload: entry.snapshot });
  }, [dispatch]);

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24 }}>
      <InvoiceForm onSaved={handleSaved} />
      <InvoiceHistory savedInvoices={history} onLoad={handleLoad} />
    </div>
  );
}

export default function App() {
  return (
    <InvoiceProvider>
      <AppInner />
    </InvoiceProvider>
  );
}
