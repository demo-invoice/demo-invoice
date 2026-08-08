import React, { useState } from 'react';
import { InvoiceProvider, useInvoice } from './context/InvoiceContext.jsx';
import { YourDetailsForm } from './components/YourDetailsForm/YourDetailsForm.jsx';
import { InvoicePreview } from './components/InvoicePreview/InvoicePreview.jsx';
import { SendEmailModal } from './components/SendEmailModal/SendEmailModal.jsx';
import './App.css';

/**
 * Inner layout — must be inside InvoiceProvider to access context.
 */
function AppLayout() {
  const { invoiceState, dispatch } = useInvoice();
  const [showEmailModal, setShowEmailModal] = useState(false);

  /**
   * Full invoice object derived from context state.
   * All fields are passed as-is; the modal and Edge Function handle missing values.
   */
  const invoice = {
    clientName: invoiceState.clientName,
    clientEmail: invoiceState.clientEmail,
    lineItems: invoiceState.lineItems,
    subtotal: invoiceState.subtotal,
    tax: invoiceState.tax,
    total: invoiceState.total,
    invoiceNumber: invoiceState.invoiceNumber,
    invoiceDate: invoiceState.invoiceDate,
    dueDate: invoiceState.dueDate,
    status: invoiceState.status,
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Invoice Builder</h1>
      </header>
      <main className="app__main">
        <div className="app__form-panel">
          <YourDetailsForm />
        </div>
        <div className="app__preview-panel">
          <InvoicePreview />
          <button
            className="app__send-email-btn"
            onClick={() => setShowEmailModal(true)}
          >
            Send Invoice by Email
          </button>
        </div>
      </main>

      {showEmailModal && (
        <SendEmailModal
          invoice={invoice}
          dispatch={dispatch}
          onClose={() => setShowEmailModal(false)}
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
