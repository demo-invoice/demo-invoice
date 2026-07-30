import React from 'react';
import { InvoiceProvider } from './context/InvoiceContext';
import { Toolbar } from './components/Toolbar';
import { FormPanel } from './components/FormPanel';
import { InvoicePreview } from './components/InvoicePreview';

/**
 * Root application component.
 * Wraps everything in InvoiceProvider so all children share invoice state.
 */
export function App() {
  return (
    <InvoiceProvider>
      <Toolbar />
      <main className="app-layout">
        <FormPanel />
        <InvoicePreview />
      </main>
    </InvoiceProvider>
  );
}
