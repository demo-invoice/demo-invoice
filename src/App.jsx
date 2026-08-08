import React, { useState } from 'react';
import { InvoiceProvider } from './context/InvoiceContext.jsx';
import { YourDetailsForm } from './components/YourDetailsForm/YourDetailsForm.jsx';
import { InvoicePreview } from './components/InvoicePreview/InvoicePreview.jsx';
import { SendEmailModal } from './components/SendEmailModal/SendEmailModal.jsx';
import { useInvoice } from './context/InvoiceContext.jsx';
import './App.css';

/**
 * Inner layout component — must live inside InvoiceProvider to access context.
 */
function AppLayout() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { invoiceState } = useInvoice();

  // Compose a plain serialisable invoice object to pass to the modal.
  const invoice = { status: invoiceState.status };

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
          <InvoicePreview onSendEmail={() => setShowEmailModal(true)} />
        </div>
      </main>

      {showEmailModal && (
        <SendEmailModal
          invoice={invoice}
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
