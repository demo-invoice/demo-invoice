import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoiceHistory } from '../components/InvoiceHistory/InvoiceHistory';
import { InvoiceForm } from '../components/InvoiceForm/InvoiceForm';

beforeEach(() => {
  localStorage.clear();
});

describe('InvoiceHistory — empty state', () => {
  it('renders the empty state message when no invoices are saved', () => {
    render(
      <InvoiceProvider>
        <InvoiceHistory />
      </InvoiceProvider>,
    );
    expect(screen.getByText(/no saved invoices/i)).toBeInTheDocument();
  });

  it('renders the "Saved Invoices" heading', () => {
    render(
      <InvoiceProvider>
        <InvoiceHistory />
      </InvoiceProvider>,
    );
    expect(screen.getByText('Saved Invoices')).toBeInTheDocument();
  });
});

describe('InvoiceHistory — after saving an invoice', () => {
  it('renders a Load button for each saved invoice', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <InvoiceForm />
        <InvoiceHistory />
      </InvoiceProvider>,
    );

    await user.clear(screen.getByLabelText(/invoice number/i));
    await user.type(screen.getByLabelText(/invoice number/i), 'INV-001');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
    expect(screen.getByText(/INV-001/)).toBeInTheDocument();
  });

  it('hides the empty state once an invoice is saved', async () => {
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

  it('appends a second saved invoice without removing the first', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <InvoiceForm />
        <InvoiceHistory />
      </InvoiceProvider>,
    );

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-A');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    await user.clear(screen.getByLabelText(/invoice number/i));
    await user.type(screen.getByLabelText(/invoice number/i), 'INV-B');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(screen.getByText(/INV-A/)).toBeInTheDocument();
    expect(screen.getByText(/INV-B/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /load/i })).toHaveLength(2);
  });

  it('displays client name alongside invoice number in the history entry', async () => {
    const user = userEvent.setup();
    render(
      <InvoiceProvider>
        <InvoiceForm />
        <InvoiceHistory />
      </InvoiceProvider>,
    );

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-003');
    await user.type(screen.getByLabelText(/client name/i), 'Acme Corp');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
  });
});
