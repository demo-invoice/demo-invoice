import React from 'react';
import { InvoiceContextProvider } from './context/InvoiceContext.jsx';
import { YourDetails } from './components/YourDetails.jsx';
import { InvoicePreview } from './components/InvoicePreview.jsx';

/**
 * Root application component.
 * Wraps the app in InvoiceContextProvider and renders the two-column layout.
 */
export function App() {
  return (
    <InvoiceContextProvider>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
          padding: '32px 24px',
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: '24px' }}>Demo Invoice</h1>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <YourDetails />
          <InvoicePreview />
        </div>
      </div>
    </InvoiceContextProvider>
  );
}

export default App;
