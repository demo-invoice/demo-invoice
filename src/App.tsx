/**
 * App — root component.
 * Wraps InvoiceForm in InvoiceProvider and imports global design tokens.
 */
import './styles/tokens.css';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';

/** Root application component. */
export function App() {
  return (
    <InvoiceProvider>
      <InvoiceForm />
    </InvoiceProvider>
  );
}
