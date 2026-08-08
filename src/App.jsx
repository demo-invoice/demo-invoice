import React, { useState } from 'react';
import { InvoiceProvider, useInvoice } from './context/InvoiceContext.jsx';
import { YourDetailsForm } from './components/YourDetailsForm/YourDetailsForm.jsx';
import { InvoicePreview } from './components/InvoicePreview/InvoicePreview.jsx';
import { SendEmailModal } from './components/SendEmailModal/SendEmailModal.jsx';
import './App.css';

/**
 * Inner app content — rendered inside InvoiceProvider so it can consume context.
 */
function AppContent() {
  const [
    showSendEmailModal,
    setShowSendEmailModal,
  ] = useState(false);

  const {
    status,
    logoDataUrl,
    // Extend here as more invoice fields are added to context
  } = useInvoice();

  /**
   * Construct the live invoice object from context state.
   * Fields not yet in context are provided as safe defaults so the
   * modal always receives a well-shaped prop.
   */
  const liveInvoice = {
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    clientName: '',
    clientEmail: '',
    lineItems: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status,
    logoDataUrl,
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Invoice Builder</h1>
        <button
          className="app__send-btn"
          onClick={() => setShowSendEmailModal(true)}
          type="button"
        >
          Send by Email
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

      {showSendEmailModal && (
        <SendEmailModal
          invoice={liveInvoice}
          onClose={() => setShowSendEmailModal(false)}
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
      <AppContent />
    </InvoiceProvider>
  );
}
