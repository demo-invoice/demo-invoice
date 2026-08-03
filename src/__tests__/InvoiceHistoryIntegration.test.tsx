import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

beforeEach(() => {
  localStorage.clear();
});

describe('InvoiceHistory integration', () => {
  it('saves an invoice and loads it back into the form', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Type an invoice number into the form.
    const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
    await user.clear(invoiceNumberInput);
    await user.type(invoiceNumberInput, 'INV-999');

    // Save the invoice.
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    // The history panel should now show the saved entry.
    expect(screen.getByText(/INV-999/)).toBeInTheDocument();

    // Start a new invoice so the form is cleared.
    await user.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('');

    // Click Load on the saved entry.
    await user.click(screen.getByRole('button', { name: /load/i }));

    // The form should now reflect the loaded invoice number.
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('INV-999');
  });

  it('preserves saved history after New Invoice is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-KEEP');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));
    await user.click(screen.getByRole('button', { name: /new invoice/i }));

    // History entry must still be visible.
    expect(screen.getByText(/INV-KEEP/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  it('appends multiple invoices without overwriting history', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-A');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    await user.clear(screen.getByLabelText(/invoice number/i));
    await user.type(screen.getByLabelText(/invoice number/i), 'INV-B');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(screen.getByText(/INV-A/)).toBeInTheDocument();
    expect(screen.getByText(/INV-B/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /load/i })).toHaveLength(2);
  });
});
