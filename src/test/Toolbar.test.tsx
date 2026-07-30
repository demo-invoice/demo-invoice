import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toolbar } from '../components/Toolbar';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceContext } from '../context/InvoiceContext';
import type { InvoiceState, InvoiceAction } from '../types/invoice';
import React from 'react';

// Minimal valid invoice state for seeding context
const validState: InvoiceState = {
  invoiceNumber: 'INV-001',
  issueDate: '2024-01-01',
  dueDate: '2024-01-31',
  sender: { name: 'Sender Name', email: 'sender@example.com', address: '123 Main St' },
  client: { name: 'Client Name', email: 'client@example.com', address: '456 Other St' },
  lineItems: [{ id: '1', description: 'Service', quantity: 1, unitPrice: 100 }],
  taxRate: 10,
  notes: '',
  logo: '',
  logoMime: '',
};

// const SeededToolbar = ({ state }: { state: InvoiceState }) => {
//   const dispatch = React.useReducer((s: InvoiceState, _a: InvoiceAction) => s, state)[1];
//   return (
//     <InvoiceContext.Provider value={{ state, dispatch }}>
//       <Toolbar />
//     </InvoiceContext.Provider>
//   );
// };

// const renderSeededToolbar = (state: InvoiceState) => render(<SeededToolbar state={state} />);

describe('Toolbar', () => {
  it('renders the Download PDF button', () => {
    render(
      <InvoiceProvider>
        <Toolbar />
      </InvoiceProvider>
    );
    expect(screen.getByRole('button', { name: /download invoice as pdf/i })).toBeInTheDocument();
  });

  it('shows validation errors when form is invalid', async () => {
    render(
      <InvoiceProvider>
        <Toolbar />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /download invoice as pdf/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('calls window.print when form is valid', async () => {
    const printMock = vi.fn();
    window.print = printMock;

    const dispatch = vi.fn();
    render(
      <InvoiceContext.Provider value={{ state: validState, dispatch }}>
        <Toolbar />
      </InvoiceContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /download invoice as pdf/i }));
    await waitFor(() => {
      expect(printMock).toHaveBeenCalled();
    });
  });

  it('sets document.title to Invoice-{invoiceNumber} before printing', async () => {
    const printMock = vi.fn();
    window.print = printMock;

    const dispatch = vi.fn();
    render(
      <InvoiceContext.Provider value={{ state: validState, dispatch }}>
        <Toolbar />
      </InvoiceContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /download invoice as pdf/i }));
    await waitFor(() => {
      expect(printMock).toHaveBeenCalled();
    });
    expect(document.title).toBe('Invoice-INV-001');
  });
});
