import { InvoiceProvider } from './context/InvoiceContext';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import './index.css';

/**
 * Root application component.
 * Wraps the entire app in InvoiceProvider so all children share invoice state.
 */
export function App() {
  return (
    <InvoiceProvider>
      <div style={styles.root}>
        <Header />
        <main style={styles.main}>
          <InvoiceForm />
          <InvoicePreview />
        </main>
      </div>
    </InvoiceProvider>
  );
}

const styles = {
  root: { display: 'flex', flexDirection: 'column' as const, height: '100vh', fontFamily: 'system-ui, sans-serif' },
  main: { display: 'flex', flex: 1, overflow: 'hidden' },
} as const;
