import React from 'react';
import { InvoiceAction } from '../../context/InvoiceContext';
import { INVOICE_STORAGE_KEY } from '../../context/InvoiceContext';

interface HeaderProps {
  dispatch: React.Dispatch<InvoiceAction>;
}

export function Header({ dispatch }: HeaderProps) {
  function handleNewInvoice() {
    const confirmed = window.confirm(
      'This will clear all current invoice data. Are you sure?'
    );
    if (!confirmed) return;
    localStorage.removeItem(INVOICE_STORAGE_KEY);
    dispatch({ type: 'RESET_INVOICE' });
  }

  return (
    <header>
      <h1>Invoice Generator</h1>
      <button onClick={handleNewInvoice}>New Invoice</button>
    </header>
  );
}
