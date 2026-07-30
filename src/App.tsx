import React from 'react';
import { InvoiceProvider } from './context/InvoiceContext';
import { InvoiceForm }    from './components/InvoiceForm/InvoiceForm';

/** Root application component. */
export function App(): React.JSX.Element {
  return (
    <InvoiceProvider>
      <InvoiceForm />
    </InvoiceProvider>
  );
}
