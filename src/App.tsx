import React, { useState, useCallback } from 'react';
import { InvoiceProvider, useInvoice } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceHistory } from './components/InvoiceHistory';
import { loadInvoiceHistory } from './services/invoiceStorage';
import type { SavedInvoiceEntry, InvoiceState } from './types/invoice';

function AppInner() {
  const { dispatch } = useInvoice();
  const [history, setHistory] = useState<SavedInvoiceEntry[]>(() => loadInvoiceHistory());

  const handleSaved = useCallback(() => {
    setHistory(loadInvoiceHistory());
  }, []);

  const handleLoad = useCallback((entry: SavedInvoiceEntry) => {
    dispatch({ type: 'LOAD_SAVED_INVOICE', payload: entry.snapshot as InvoiceState });
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
