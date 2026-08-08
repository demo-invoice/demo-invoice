import React, { useState } from 'react';
import { InvoiceProvider } from './context/InvoiceContext.jsx';
import { YourDetailsForm } from './components/YourDetailsForm/YourDetailsForm.jsx';
import { InvoicePreview } from './components/InvoicePreview/InvoicePreview.jsx';
import { SendEmailModal } from './components/SendEmailModal/SendEmailModal.jsx';
import './App.css';

/**
 * Build a full invoice object from the current application state.
 * Adjust field sources here as the data model evolves.
 *
 * @returns {object} invoice
 */
function buildInvoice() {
  return {
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    clientName: '',
    clientEmail: '',
    lineItems: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft',
  };
}

/**
 * Root application component.
 * Wraps the entire tree in InvoiceProvider so all children share invoice state.
 */
export function App() {
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  function openEmailModal() {
    setEmailModalOpen(true);
  }

  function closeEmailModal() {
    setEmailModalOpen(false);
  }

  return (
    <InvoiceProvider>
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
            <button type="button" onClick={openEmailModal}>
              Send by Email
            </button>
          </div>
        </main>
      </div>

      {emailModalOpen && (
        <SendEmailModal
          invoice={buildInvoice()}
          onClose={closeEmailModal}
        />
      )}
    </InvoiceProvider>
  );
}
