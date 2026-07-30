import { InvoiceProvider } from './context/InvoiceContext';
import { Toolbar } from './components/Toolbar';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import './styles/global.css';

export default function App() {
  return (
    <InvoiceProvider>
      <Toolbar />
      <main className="app-main">
        <InvoiceForm />
        <InvoicePreview />
      </main>
    </InvoiceProvider>
  );
}
