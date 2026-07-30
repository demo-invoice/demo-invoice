import React from 'react';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { tokens } from './tokens';

/**
 * Root component.
 * Wraps everything in InvoiceProvider and renders a two-column layout:
 * - Left column: InvoiceForm (form wiring)
 * - Right column: InvoicePreview (purely presentational, mirrors form in real time)
 */
export function App(): React.JSX.Element {
  return (
    <InvoiceProvider>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '420px 1fr',
          height: '100vh',
          overflow: 'hidden',
          fontFamily: tokens.typography.fontFamily,
          backgroundColor: tokens.color.background,
        }}
      >
        {/* Left: form panel */}
        <div
          style={{
            borderRight: `1px solid ${tokens.color.border}`,
            overflowY: 'auto',
            backgroundColor: tokens.color.surface,
          }}
        >
          <InvoiceForm />
        </div>

        {/* Right: live preview panel */}
        <div style={{ overflowY: 'auto' }}>
          <InvoicePreview />
        </div>
      </div>
    </InvoiceProvider>
  );
}
