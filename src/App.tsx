import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';

/**
 * Root application component.
 * InvoiceProvider lives here — co-located with the component tree that
 * consumes it — so the form can be tested in isolation by wrapping with
 * InvoiceProvider directly, without touching index.tsx.
 */
export default function App() {
  return (
    <InvoiceProvider>
      <InvoiceForm />
    </InvoiceProvider>
  );
}
