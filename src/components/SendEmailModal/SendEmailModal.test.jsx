import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SendEmailModal } from './SendEmailModal.jsx';

/** Full invoice fixture mirroring the shape constructed in App.jsx */
const invoiceFixture = {
  clientName: 'Acme Corp',
  clientEmail: 'acme@example.com',
  lineItems: [
    { description: 'Consulting', quantity: 2, unitPrice: 500 },
  ],
  subtotal: 1000,
  tax: 200,
  total: 1200,
  invoiceNumber: 'INV-001',
  invoiceDate: '2024-01-15',
  dueDate: '2024-02-15',
  status: 'draft',
};

describe('SendEmailModal', () => {
  let mockDispatch;
  let mockOnClose;

  beforeEach(() => {
    mockDispatch = vi.fn();
    mockOnClose = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the full invoice payload and shows success confirmation', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });
    vi.stubGlobal('fetch', mockFetch);

    render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Send Invoice by Email' })
    ).toBeInTheDocument();

    // Email input is pre-filled from invoice.clientEmail
    const emailInput = screen.getByLabelText(/recipient email/i);
    expect(emailInput).toHaveValue('acme@example.com');

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/send-invoice');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body);
    expect(body.clientName).toBe('Acme Corp');
    expect(body.lineItems).toHaveLength(1);
    expect(body.total).toBe(1200);
    expect(body.recipientEmail).toBe('acme@example.com');

    await waitFor(() => {
      expect(
        screen.getByText(/invoice sent successfully/i)
      ).toBeInTheDocument();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_INVOICE_STATUS',
      payload: 'sent',
    });
  });

  it('shows a validation error and does NOT call fetch when email is empty', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    render(
      <SendEmailModal
        invoice={{ ...invoiceFixture, clientEmail: '' }}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    const emailInput = screen.getByLabelText(/recipient email/i);
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('shows a validation error and does NOT call fetch when email has no @', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    render(
      <SendEmailModal
        invoice={{ ...invoiceFixture, clientEmail: '' }}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    const emailInput = screen.getByLabelText(/recipient email/i);
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows a user-facing error message on API/network failure without crashing', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network failure'));
    vi.stubGlobal('fetch', mockFetch);

    render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert').textContent).toMatch(/network failure/i);
    // Form is still visible (not success state)
    expect(screen.getByLabelText(/recipient email/i)).toBeInTheDocument();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('shows a user-facing error message on non-2xx response without crashing', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });
    vi.stubGlobal('fetch', mockFetch);

    render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert').textContent).toMatch(
      /internal server error/i
    );
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('disables both Send and Cancel buttons while loading', async () => {
    // Never resolves — keeps the component in loading state
    const mockFetch = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal('fetch', mockFetch);

    render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /sending/i })
      ).toBeDisabled();
    });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });
});
