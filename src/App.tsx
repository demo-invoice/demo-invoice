/**
 * App — root component.
 *
 * Wraps the invoice form in a <main> landmark with a visible <h1> so screen
 * reader users can navigate by landmark and heading (WCAG 2.4.1, 2.4.6).
 */
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';
import './styles/tokens.css';

/**
 * Root application component.
 */
export function App() {
  return (
    <main>
      <h1>Create Invoice</h1>
      <InvoiceForm />
    </main>
  );
}
