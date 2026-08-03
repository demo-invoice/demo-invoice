import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';
import { InvoiceHistory } from './components/InvoiceHistory/InvoiceHistory';

/**
 * Root application component.
 * Wraps InvoiceForm and InvoiceHistory inside the shared InvoiceProvider.
 */
function App() {
  return (
    <InvoiceProvider>
      <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
        <InvoiceForm />
        <InvoiceHistory />
      </div>
    </InvoiceProvider>
  );
}

export default App;
