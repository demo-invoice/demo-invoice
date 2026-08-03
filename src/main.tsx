import React from 'react';
import ReactDOM from 'react-dom/client';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceView } from './components/invoice/InvoiceView';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <InvoiceProvider>
      <InvoiceView />
    </InvoiceProvider>
  </React.StrictMode>,
);
