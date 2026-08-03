import { render, screen, fireEvent } from '@testing-library/react';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceForm } from '../components/InvoiceForm';
import { InvoiceHistory } from '../components/InvoiceHistory';

function renderApp() {
  return render(
    <InvoiceProvider>
      <InvoiceForm />
      <InvoiceHistory />
    </InvoiceProvider>,
  );
}

describe('InvoiceHistoryIntegration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows empty-state message when no invoices are saved', () => {
    renderApp();
    expect(
      screen.getByText(/no saved invoices/i),
    ).toBeInTheDocument();
  });

  it('save → appears in history → load → form fields restored', () => {
    renderApp();

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/invoice number/i), {
      target: { value: 'INV-001' },
    });
    fireEvent.change(screen.getByLabelText(/client name/i), {
      target: { value: 'Acme Corp' },
    });
    fireEvent.change(screen.getByLabelText(/issue date/i), {
      target: { value: '2024-01-15' },
    });
    fireEvent.change(screen.getByLabelText(/total/i), {
      target: { value: '1500' },
    });

    // Save the invoice
    fireEvent.click(screen.getByRole('button', { name: /save invoice/i }));

    // Assert the entry appears in the history list
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();

    // Reset the form
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    // Verify form is cleared
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('');
    expect(screen.getByLabelText(/client name/i)).toHaveValue('');

    // Load the saved invoice
    fireEvent.click(screen.getByRole('button', { name: /load/i }));

    // Assert form fields are restored
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('INV-001');
    expect(screen.getByLabelText(/client name/i)).toHaveValue('Acme Corp');
    expect(screen.getByLabelText(/issue date/i)).toHaveValue('2024-01-15');
  });
});
