import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvoiceProvider, useInvoice } from '../../context/InvoiceContext';
import { InvoiceForm } from './InvoiceForm';

/**
 * StateDisplay reads from the shared InvoiceContext and exposes each field
 * as a data-testid span so tests can assert state changes via rendered output
 * without reaching into context internals or spying on dispatch.
 */
function StateDisplay(): JSX.Element {
  const { state } = useInvoice();
  return (
    <div>
      <span data-testid="clientName">{state.clientName}</span>
      <span data-testid="clientEmail">{state.clientEmail}</span>
      <span data-testid="invoiceNumber">{state.invoiceNumber}</span>
      <span data-testid="issueDate">{state.issueDate}</span>
      <span data-testid="dueDate">{state.dueDate}</span>
      <span data-testid="notes">{state.notes}</span>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <InvoiceProvider>
      <InvoiceForm />
      <StateDisplay />
    </InvoiceProvider>,
  );
}

describe('InvoiceForm', () => {
  it('dispatches SET_CLIENT_NAME when client name input changes', () => {
    renderWithProvider();
    fireEvent.change(screen.getByLabelText(/client name/i), {
      target: { value: 'Acme Corp' },
    });
    expect(screen.getByTestId('clientName')).toHaveTextContent('Acme Corp');
  });

  it('dispatches SET_CLIENT_EMAIL when client email input changes', () => {
    renderWithProvider();
    fireEvent.change(screen.getByLabelText(/client email/i), {
      target: { value: 'billing@acme.com' },
    });
    expect(screen.getByTestId('clientEmail')).toHaveTextContent('billing@acme.com');
  });

  it('dispatches SET_INVOICE_NUMBER when invoice number input changes', () => {
    renderWithProvider();
    fireEvent.change(screen.getByLabelText(/invoice number/i), {
      target: { value: 'INV-001' },
    });
    expect(screen.getByTestId('invoiceNumber')).toHaveTextContent('INV-001');
  });

  it('dispatches SET_ISSUE_DATE when issue date input changes', () => {
    renderWithProvider();
    fireEvent.change(screen.getByLabelText(/issue date/i), {
      target: { value: '2024-07-01' },
    });
    expect(screen.getByTestId('issueDate')).toHaveTextContent('2024-07-01');
  });

  it('dispatches SET_DUE_DATE when due date input changes', () => {
    renderWithProvider();
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: '2024-07-31' },
    });
    expect(screen.getByTestId('dueDate')).toHaveTextContent('2024-07-31');
  });

  it('dispatches SET_NOTES when notes textarea changes', () => {
    renderWithProvider();
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'Net 30 payment terms.' },
    });
    expect(screen.getByTestId('notes')).toHaveTextContent('Net 30 payment terms.');
  });
});
