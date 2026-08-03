import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

beforeEach(() => {
  localStorage.clear();
});

describe('InvoiceHistory integration — full App', () => {
  it('saves an invoice and loads it back into the form (handleLoad → LOAD_SAVED_INVOICE → re-render)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
    await user.clear(invoiceNumberInput);
    await user.type(invoiceNumberInput, 'INV-999');

    await user.click(screen.getByRole('button', { name: /save invoice/i }));
    expect(screen.getByText(/INV-999/)).toBeInTheDocument();

    // Clear the form via New Invoice.
    await user.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('');

    // Load the saved entry — form must update.
    await user.click(screen.getByRole('button', { name: /load/i }));
    expect(screen.getByLabelText(/invoice number/i)).toHaveValue('INV-999');
  });

  it('preserves saved history after New Invoice is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-KEEP');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));
    await user.click(screen.getByRole('button', { name: /new invoice/i }));

    // History must be unaffected by reset.
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

  it('New Invoice clears the form fields but does not remove saved history from localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-LS');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));
    await user.click(screen.getByRole('button', { name: /new invoice/i }));

    // Active key should be removed (or blank), history key must still hold data.
    const historyRaw = localStorage.getItem('invoice_history_v1');
    expect(historyRaw).not.toBeNull();
    const history = JSON.parse(historyRaw as string);
    expect(history).toHaveLength(1);
    expect(history[0].invoiceNumber).toBe('INV-LS');

    // Active key must be absent after reset.
    expect(localStorage.getItem('invoice_active_v1')).toBeNull();
  });

  it('loading a saved invoice restores client name into the form', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/invoice number/i), 'INV-CN');
    await user.type(screen.getByLabelText(/client name/i), 'Test Client');
    await user.click(screen.getByRole('button', { name: /save invoice/i }));

    await user.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(screen.getByLabelText(/client name/i)).toHaveValue('');

    await user.click(screen.getByRole('button', { name: /load/i }));
    expect(screen.getByLabelText(/client name/i)).toHaveValue('Test Client');
  });
});
