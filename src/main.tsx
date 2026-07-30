import React from 'react';
import ReactDOM from 'react-dom/client';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <InvoiceProvider>
      <InvoiceForm />
      <InvoicePreview />
    </InvoiceProvider>
  </React.StrictMode>,
);
