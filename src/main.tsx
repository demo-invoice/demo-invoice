import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/tokens/tokens.css';
import { InvoicePreview } from './components/InvoicePreview';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in the document.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <InvoicePreview />
  </React.StrictMode>,
);
