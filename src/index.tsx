/**
 * Application entry point.
 * Wraps the app in InvoiceProvider so all components can access invoice state.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InvoiceProvider } from './context/InvoiceContext';
import { App } from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found in document.');
}

createRoot(container).render(
  <StrictMode>
    <InvoiceProvider>
      <App />
    </InvoiceProvider>
  </StrictMode>,
);
