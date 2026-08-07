import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  status: 'Draft' | 'Sent' | 'Paid';
  notes: string;
  [key: string]: unknown;
}

export type InvoiceAction =
  | { type: 'SET_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE_STATUS'; payload: Invoice['status'] }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: unknown } }
  | { type: 'SEND_EMAIL' };

export function invoiceReducer(state: Invoice, action: InvoiceAction): Invoice {
  switch (action.type) {
    case 'SET_INVOICE':
      return { ...action.payload, status: action.payload.status ?? 'Draft' };
    case 'UPDATE_INVOICE_STATUS': {
      const validStatuses: Invoice['status'][] = ['Draft', 'Sent', 'Paid'];
      if (!validStatuses.includes(action.payload)) return state;
      return { ...state, status: action.payload };
    }
    case 'UPDATE_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    case 'SEND_EMAIL':
      return state;
    default:
      return state;
  }
}

const InvoiceContext = createContext<{
  invoice: Invoice;
  dispatch: React.Dispatch<InvoiceAction>;
} | null>(null);

const defaultInvoice: Invoice = {
  id: '',
  number: '',
  clientName: '',
  clientEmail: '',
  status: 'Draft',
  notes: '',
};

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoice, dispatch] = useReducer(invoiceReducer, defaultInvoice);
  return (
    <InvoiceContext.Provider value={{ invoice, dispatch }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoice must be used within an InvoiceProvider');
  return ctx;
}
