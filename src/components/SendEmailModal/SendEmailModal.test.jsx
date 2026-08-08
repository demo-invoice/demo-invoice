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
      expect(screen.getByText(/invoice sent successfully/i)).toBeInTheDocument();
    });

    // Verify fetch was called with the correct URL, method, and full invoice body
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://test.supabase.co/functions/v1/send-invoice');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.invoice).toBeUndefined(); // invoice fields are spread directly
    expect(body.clientName).toBe(invoiceFixture.clientName);
    expect(body.lineItems).toEqual(invoiceFixture.lineItems);
    expect(body.total).toBe(invoiceFixture.total);
    expect(body.recipientEmail).toBe('acme@example.com');

    // Dispatch called with UPDATE_INVOICE_STATUS
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_INVOICE_STATUS',
      payload: 'sent',
    });
  });

  it('shows a validation error and does not call fetch when email is empty', async () => {
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
    expect(screen.getByLabelText(/recipient email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows an error message when the API call fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
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

    expect(screen.getByRole('alert')).toHaveTextContent('Internal Server Error');
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
