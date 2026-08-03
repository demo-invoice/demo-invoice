import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceView } from './components/InvoiceView';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <InvoiceProvider>
      <InvoiceView />
    </InvoiceProvider>
  </StrictMode>,
);
