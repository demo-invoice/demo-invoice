import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SendEmailModal } from './SendEmailModal.jsx';

/** Full invoice fixture satisfying all 10 required fields. */
const invoiceFixture = {
  invoiceNumber: 'INV-001',
  invoiceDate: '2024-01-15',
  dueDate: '2024-02-15',
  clientName: 'Acme Corp',
  clientEmail: 'acme@example.com',
  lineItems: [
    { description: 'Consulting', quantity: 2, unitPrice: 500 },
  ],
  subtotal: 1000,
  tax: 100,
  total: 1100,
  status: 'draft',
};

describe('SendEmailModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Scenario 1 — Success
  // ---------------------------------------------------------------------------
  it('sends the invoice and shows a confirmation message on success', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'msg_123' }),
    }));

    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'Send Invoice by Email' })).toBeInTheDocument();

    // Clear pre-filled email and type a new one
    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'client@example.com');

    await user.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() =>
      expect(screen.getByText(/invoice sent successfully/i)).toBeInTheDocument()
    );

    expect(screen.queryByRole('button', { name: /^send$/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Scenario 2 — Validation error (empty + invalid format)
  // ---------------------------------------------------------------------------
  it('shows aria-invalid and blocks fetch when email is empty or malformed', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    render(<SendEmailModal invoice={{ ...invoiceFixture, clientEmail: '' }} onClose={onClose} />);

    const emailInput = screen.getByLabelText(/recipient email/i);

    // --- empty email ---
    await user.clear(emailInput);
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    // --- malformed email ---
    await user.type(emailInput, 'not-an-email');
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Scenario 3 — API error
  // ---------------------------------------------------------------------------
  it('shows a user-facing error message when the API call fails', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    }));

    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'client@example.com');

    await user.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Internal server error')
    );

    // Modal stays open — Send button still present
    expect(screen.getByRole('button', { name: /^send$/i })).toBeInTheDocument();
    // onClose was NOT called
    expect(onClose).not.toHaveBeenCalled();
  });
});
