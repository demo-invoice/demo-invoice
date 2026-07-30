import './styles/tokens.css';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';

export default function App() {
  return (
    <InvoiceProvider>
      <InvoiceForm />
    </InvoiceProvider>
  );
}
