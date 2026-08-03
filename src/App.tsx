/**
 * Root application component.
 */
import React, { useState } from 'react';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceHistory } from './components/InvoiceHistory';
import { loadInvoiceHistory } from './services/invoiceStorage';
import { useInvoice } from './context/InvoiceContext';
import type { SavedInvoiceEntry } from './types/invoice';

/** Inner component that has access to InvoiceProvider context. */
function AppInner() {
  const { dispatch } = useInvoice();
  const [history, setHistory] = useState<SavedInvoiceEntry[]>(() => loadInvoiceHistory());

  function refreshHistory() {
    setHistory(loadInvoiceHistory());
  }

  function handleLoad(entry: SavedInvoiceEntry) {
    dispatch({ type: 'LOAD_SAVED_INVOICE', payload: entry.snapshot });
  }

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, fontFamily: 'sans-serif' }}>
      <InvoiceForm onSaved={refreshHistory} />
      <InvoiceHistory savedInvoices={history} onLoad={handleLoad} />
    </div>
  );
}

/** Root component — wraps everything in InvoiceProvider. */
export function App() {
  return (
    <InvoiceProvider>
      <AppInner />
    </InvoiceProvider>
  );
}
