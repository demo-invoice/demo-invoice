import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceHistory } from '../components/InvoiceHistory/InvoiceHistory';
import { InvoiceForm } from '../components/InvoiceForm/InvoiceForm';

beforeEach(() => {
  localStorage.clear();
});

describe('InvoiceHistory', () => {
  it('renders the empty state message when no invoices are saved', () => {
    render(
      <InvoiceProvider>
        <InvoiceHistory />
      </InvoiceProvider>,
    );
    expect(screen.getByText(/no saved invoices/i)).toBeInTheDocument();
  });

  it('renders a Load button for each saved invoice', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <InvoiceForm />
        <InvoiceHistory />
      </InvoiceProvider>,
    );

    // Fill in invoice number and save.
    await user.clear(screen.getByLabelText(/invoice number/i));
    await user.type(screen.getByLabelText(/invoice number/i), 'INV-001');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
    expect(screen.getByText(/INV-001/)).toBeInTheDocument();
  });

  it('does not show the empty state once an invoice is saved', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <InvoiceForm />
        <InvoiceHistory />
      </InvoiceProvider>,
    );

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-002');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(screen.queryByText(/no saved invoices/i)).not.toBeInTheDocument();
  });
});
