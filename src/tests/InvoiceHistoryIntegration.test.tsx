import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceForm } from '../components/InvoiceForm';
import { InvoiceHistory } from '../components/InvoiceHistory';
import { EMPTY_STATE_MESSAGE } from '../components/InvoiceHistory';

/** Renders the full invoice UI inside the provider. */
function renderApp() {
  return render(
    <InvoiceProvider>
      <InvoiceForm />
      <InvoiceHistory />
    </InvoiceProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('Invoice History Integration', () => {
  it('saves an invoice, resets the form, and reloads the saved invoice', async () => {
    const user = userEvent.setup();
    renderApp();

    // --- Fill in the form ---
    const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
    await user.clear(invoiceNumberInput);
    await user.type(invoiceNumberInput, 'INV-001');

    const clientNameInput = screen.getByLabelText(/client name/i);
    await user.clear(clientNameInput);
    await user.type(clientNameInput, 'Acme Corp');

    const issueDateInput = screen.getByLabelText(/issue date/i);
    await user.clear(issueDateInput);
    await user.type(issueDateInput, '2024-07-01');

    const totalInput = screen.getByLabelText(/total/i);
    await user.clear(totalInput);
    await user.type(totalInput, '1500');

    // --- Save the invoice ---
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    // --- Assert history entry appears ---
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();

    // --- Reset to a new invoice ---
    await user.click(screen.getByRole('button', { name: /new invoice/i }));

    // --- Verify form is cleared ---
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('');
    expect(screen.getByLabelText(/client name/i)).toHaveValue('');
    expect(screen.getByLabelText(/total/i)).toHaveValue(0);

    // --- Load the saved invoice ---
    await user.click(screen.getByRole('button', { name: /load/i }));

    // --- Assert all fields are restored ---
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('INV-001');
    expect(screen.getByLabelText(/client name/i)).toHaveValue('Acme Corp');
    expect(screen.getByLabelText(/issue date/i)).toHaveValue('2024-07-01');
    expect(screen.getByLabelText(/total/i)).toHaveValue(1500);
  });

  it('shows empty state message when no invoices are saved', () => {
    renderApp();
    expect(screen.getByText(EMPTY_STATE_MESSAGE)).toBeInTheDocument();
  });
});
