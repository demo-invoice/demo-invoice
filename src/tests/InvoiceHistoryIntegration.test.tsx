import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceForm } from '../components/InvoiceForm';
import { InvoiceHistory, EMPTY_STATE_MESSAGE } from '../components/InvoiceHistory';

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
  it('shows empty state message when no invoices are saved', () => {
    renderApp();
    expect(screen.getByText(EMPTY_STATE_MESSAGE)).toBeInTheDocument();
  });

  it('empty state message matches exact required string', () => {
    renderApp();
    expect(screen.getByText(
      'No saved invoices yet. Click "Save Invoice" to save the current invoice.'
    )).toBeInTheDocument();
  });

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
    expect(screen.getByText('2024-07-01')).toBeInTheDocument();

    // --- Reset to a new invoice ---
    await user.click(screen.getByRole('button', { name: /new invoice/i }));

    // --- Verify form is cleared ---
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('');
    expect(screen.getByLabelText(/client name/i)).toHaveValue('');
    expect(screen.getByLabelText(/total/i)).toHaveValue(0);

    // History entry still visible after reset
    expect(screen.getByText('INV-001')).toBeInTheDocument();

    // --- Load the saved invoice ---
    await user.click(screen.getByRole('button', { name: /load/i }));

    // --- Assert all fields are restored ---
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('INV-001');
    expect(screen.getByLabelText(/client name/i)).toHaveValue('Acme Corp');
    expect(screen.getByLabelText(/issue date/i)).toHaveValue('2024-07-01');
    expect(screen.getByLabelText(/total/i)).toHaveValue(1500);
  });

  it('Save Invoice button is present in the form', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /save invoice/i })).toBeInTheDocument();
  });

  it('New Invoice button is present in the form', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /new invoice/i })).toBeInTheDocument();
  });

  it('persists history to localStorage on save', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-042');
    await user.type(screen.getByLabelText(/client name/i), 'Beta LLC');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    const stored = localStorage.getItem('invoice_history_v1');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!) as Array<{ invoiceNumber: string }>;
    expect(parsed[0].invoiceNumber).toBe('INV-042');
  });

  it('persists active invoice to localStorage on field change', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/client name/i), 'Stored Client');

    const stored = localStorage.getItem('invoice_active_v1');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!) as { clientName: string };
    expect(parsed.clientName).toBe('Stored Client');
  });

  it('renders invoice history list with aria-label after saving', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-007');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(screen.getByRole('list', { name: /invoice history/i })).toBeInTheDocument();
  });

  it('Load button appears in history after saving an invoice', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-099');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  it('multiple saves produce multiple history entries', async () => {
    const user = userEvent.setup();
    renderApp();

    // Save first invoice
    await user.clear(screen.getByLabelText(/invoice number/i));
    await user.type(screen.getByLabelText(/invoice number/i), 'INV-A');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    // Save second invoice
    await user.clear(screen.getByLabelText(/invoice number/i));
    await user.type(screen.getByLabelText(/invoice number/i), 'INV-B');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(screen.getByText('INV-A')).toBeInTheDocument();
    expect(screen.getByText('INV-B')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /load/i })).toHaveLength(2);
  });
});
