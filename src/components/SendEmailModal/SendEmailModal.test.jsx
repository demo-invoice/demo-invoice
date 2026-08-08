import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SendEmailModal } from './SendEmailModal.jsx';

/** Full invoice fixture — all 10 required fields present. */
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
  // Rendering
  // ---------------------------------------------------------------------------
  it('renders the modal heading exactly as "Send Invoice by Email"', () => {
    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);
    expect(
      screen.getByRole('heading', { name: 'Send Invoice by Email' })
    ).toBeInTheDocument();
  });

  it('pre-fills the email input with invoice.clientEmail', () => {
    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);
    const input = screen.getByLabelText(/recipient email/i);
    expect(input).toHaveValue('acme@example.com');
  });

  it('renders Send and Cancel buttons in idle state', () => {
    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);
    expect(screen.getByRole('button', { name: /^send$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
  });

  it('email input has aria-invalid="false" before any interaction', () => {
    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);
    const input = screen.getByLabelText(/recipient email/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  // ---------------------------------------------------------------------------
  // Scenario 1 — Success
  // ---------------------------------------------------------------------------
  it('sends the invoice and shows confirmation message on success', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'msg_123' }),
    }));

    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'client@example.com');

    await user.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() =>
      expect(screen.getByText(/invoice sent successfully/i)).toBeInTheDocument()
    );

    // Form is hidden — Send button gone
    expect(screen.queryByRole('button', { name: /^send$/i })).not.toBeInTheDocument();
    // Close button appears
    expect(screen.getByRole('button', { name: /^close$/i })).toBeInTheDocument();
    // onClose not called automatically
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the Close button is clicked after success', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'msg_456' }),
    }));

    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'client@example.com');
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^close$/i })).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: /^close$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // Scenario 2 — Validation errors
  // ---------------------------------------------------------------------------
  it('sets aria-invalid="true" and shows alert when Send is clicked with empty email', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    render(
      <SendEmailModal
        invoice={{ ...invoiceFixture, clientEmail: '' }}
        onClose={onClose}
      />
    );

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sets aria-invalid="true" and blocks fetch when email is malformed', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    render(
      <SendEmailModal
        invoice={{ ...invoiceFixture, clientEmail: '' }}
        onClose={onClose}
      />
    );

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.type(emailInput, 'not-an-email');
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows the validation alert text for an invalid email', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn());

    render(
      <SendEmailModal
        invoice={{ ...invoiceFixture, clientEmail: '' }}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /^send$/i }));

    expect(
      screen.getByText('Please enter a valid email address.')
    ).toBeInTheDocument();
  });

  it('clears aria-invalid once a valid email is entered', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

    render(
      <SendEmailModal
        invoice={{ ...invoiceFixture, clientEmail: '' }}
        onClose={onClose}
      />
    );

    const emailInput = screen.getByLabelText(/recipient email/i);
    // Trigger validation error first
    await user.click(screen.getByRole('button', { name: /^send$/i }));
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    // Now type a valid address
    await user.type(emailInput, 'valid@example.com');
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
  });

  // ---------------------------------------------------------------------------
  // Scenario 3 — API error
  // ---------------------------------------------------------------------------
  it('shows a user-facing error message when the API returns a non-ok response', async () => {
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

    // Modal stays open
    expect(screen.getByRole('button', { name: /^send$/i })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a user-facing error message when fetch rejects (network failure)', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'client@example.com');
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Network failure')
    );

    expect(screen.getByRole('button', { name: /^send$/i })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses the fallback error message when API error body has no error field', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    }));

    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'client@example.com');
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Request failed with status 503')
    );
  });

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  it('disables both buttons and shows "Sending\u2026" while the request is in flight', async () => {
    const user = userEvent.setup();

    // Never resolves — keeps the component in loading state
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'client@example.com');
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    // Send button now shows 'Sending\u2026' and is disabled
    const sendingBtn = screen.getByRole('button', { name: 'Sending\u2026' });
    expect(sendingBtn).toBeDisabled();

    // Cancel button is also disabled
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeDisabled();
  });

  // ---------------------------------------------------------------------------
  // Cancel button
  // ---------------------------------------------------------------------------
  it('calls onClose when Cancel is clicked in idle state', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal invoice={invoiceFixture} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
