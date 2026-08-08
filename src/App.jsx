import React, { useState } from 'react';
import { InvoiceProvider, useInvoice } from './context/InvoiceContext.jsx';
import { YourDetailsForm } from './components/YourDetailsForm/YourDetailsForm.jsx';
import { InvoicePreview } from './components/InvoicePreview/InvoicePreview.jsx';
import { SendInvoiceModal } from './components/SendInvoiceModal/SendInvoiceModal.jsx';
import './App.css';

/**
 * Inner layout — must be inside InvoiceProvider so useInvoice() works.
 */
function AppLayout() {
  const [
    sendModalOpen,
    setSendModalOpen,
  ] = useState(false);

  const {
    invoiceNumber,
    clientName,
    clientEmail,
    lineItems,
    subtotal,
    tax,
    total,
    invoiceDate,
    dueDate,
    status,
    logoDataUrl,
    dispatch,
  } = useInvoice();

  /** @type {import('./components/SendInvoiceModal/SendInvoiceModal.jsx').LiveInvoice} */
  const liveInvoice = {
    invoiceNumber,
    clientName,
    clientEmail,
    lineItems,
    subtotal,
    tax,
    total,
    invoiceDate,
    dueDate,
    status,
    logoDataUrl,
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Invoice Builder</h1>
        <button
          className="app__send-btn"
          onClick={() => setSendModalOpen(true)}
        >
          Send Invoice
        </button>
      </header>
      <main className="app__main">
        <div className="app__form-panel">
          <YourDetailsForm />
        </div>
        <div className="app__preview-panel">
          <InvoicePreview />
        </div>
      </main>

      {sendModalOpen && (
        <SendInvoiceModal
          liveInvoice={liveInvoice}
          dispatch={dispatch}
          onClose={() => setSendModalOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Root application component.
 * Wraps the entire tree in InvoiceProvider so all children share invoice state.
 */
export function App() {
  return (
    <InvoiceProvider>
      <AppLayout />
    </InvoiceProvider>
  );
}
