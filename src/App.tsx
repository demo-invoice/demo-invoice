import { InvoiceProvider } from './context/InvoiceContext';
import { NewInvoiceButton } from './components/NewInvoiceButton/NewInvoiceButton';

/**
 * Root application component.
 * Wraps the app in InvoiceProvider so all children can access invoice state.
 */
export function App(): JSX.Element {
  return (
    <InvoiceProvider>
      <main>
        <h1>Demo Invoice</h1>
        <NewInvoiceButton />
      </main>
    </InvoiceProvider>
  );
}
