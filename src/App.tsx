import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';
import './styles/global.css';

/**
 * Root application component.
 * Wraps the form in the InvoiceProvider so all children share invoice state.
 */
export default function App() {
  return (
    <InvoiceProvider>
      <InvoiceForm />
    </InvoiceProvider>
  );
}
