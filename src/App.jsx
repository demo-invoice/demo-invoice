import React from 'react';
import { InvoiceProvider } from './context/InvoiceContext.jsx';
import { YourDetailsForm } from './components/YourDetailsForm/YourDetailsForm.jsx';
import { InvoicePreview } from './components/InvoicePreview/InvoicePreview.jsx';
import './App.css';

/**
 * Root application component.
 * Wraps the entire tree in InvoiceProvider so all children share invoice state.
 */
export function App() {
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
          </div>
        </main>
      </div>
    </InvoiceProvider>
  );
}
