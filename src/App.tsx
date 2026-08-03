import React from 'react';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceHistory } from './components/InvoiceHistory';

/**
 * Root application component.
 * Composes InvoiceProvider, InvoiceForm, and InvoiceHistory.
 */
export function App(): React.JSX.Element {
  return (
    <InvoiceProvider>
      <main>
        <h1>Invoice Manager</h1>
        <InvoiceForm />
        <InvoiceHistory />
      </main>
    </InvoiceProvider>
  );
}
