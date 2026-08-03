/**
 * Root page — wraps InvoiceView in the InvoiceProvider.
 */
import React from 'react';
import { InvoiceProvider } from '@/context/InvoiceContext';
import { InvoiceView } from '@/components/InvoiceView';

export default function HomePage() {
  return (
    <InvoiceProvider>
      <InvoiceView />
    </InvoiceProvider>
  );
}
