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

  // ── Scenario 1: Successful send ──────────────────────────────────────────

  it('renders the heading "Send Invoice by Email"', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    const { container } = render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );
    const heading = container.querySelector('h2');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe('Send Invoice by Email');
  });

  it('pre-fills the email input with invoice.clientEmail', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    const { container } = render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );
    const input = container.querySelector('#recipient-email');
    expect(input.value).toBe('acme@example.com');
  });

  it('calls fetch with correct URL, method POST, and full invoice body on successful send', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });
    vi.stubGlobal('fetch', mockFetch);

    const { container } = render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/send-invoice');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body);
    expect(body.clientName).toBe('Acme Corp');
    expect(body.clientEmail).toBe('acme@example.com');
    expect(body.lineItems).toHaveLength(1);
    expect(body.lineItems[0].description).toBe('Consulting');
    expect(body.lineItems[0].quantity).toBe(2);
    expect(body.lineItems[0].unitPrice).toBe(500);
    expect(body.subtotal).toBe(1000);
    expect(body.tax).toBe(200);
    expect(body.total).toBe(1200);
    expect(body.invoiceNumber).toBe('INV-001');
    expect(body.invoiceDate).toBe('2024-01-15');
    expect(body.dueDate).toBe('2024-02-15');
    expect(body.status).toBe('draft');
    expect(body.recipientEmail).toBe('acme@example.com');
  });

  it('shows success confirmation message after successful send', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    }));

    render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(screen.getByText(/invoice sent successfully/i)).toBeInTheDocument()
    );

    // Form is gone; Close button is present
    expect(screen.queryByLabelText(/recipient email/i)).toBeNull();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('dispatches UPDATE_INVOICE_STATUS with payload "sent" on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    }));

    render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_INVOICE_STATUS',
        payload: 'sent',
      })
    );
  });

  // ── Scenario 2: Client-side validation errors ────────────────────────────

  it('shows validation error and does NOT call fetch when email is empty', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    const { container } = render(
      <SendEmailModal
        invoice={{ ...invoiceFixture, clientEmail: '' }}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    const input = container.querySelector('#recipient-email');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );

    expect(screen.getByRole('alert').textContent).toBe('Email address is required.');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('shows validation error and does NOT call fetch when email has no @', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    const { container } = render(
      <SendEmailModal
        invoice={{ ...invoiceFixture, clientEmail: '' }}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    const input = container.querySelector('#recipient-email');
    fireEvent.change(input, { target: { value: 'notanemail' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );

    expect(screen.getByRole('alert').textContent).toBe('Please enter a valid email address.');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('sets aria-invalid="true" on the email input when there is a validation error', async () => {
    vi.stubGlobal('fetch', vi.fn());

    const { container } = render(
      <SendEmailModal
        invoice={{ ...invoiceFixture, clientEmail: '' }}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    const input = container.querySelector('#recipient-email');
    expect(input.getAttribute('aria-invalid')).toBe('false');

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(input.getAttribute('aria-invalid')).toBe('true')
    );
  });

  // ── Scenario 3: API / network errors ────────────────────────────────────

  it('shows user-facing error message on network-level fetch rejection without crashing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const { container } = render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );

    expect(screen.getByRole('alert').textContent).toBe('Network failure');
    // Form is still visible — not success state
    expect(container.querySelector('#recipient-email')).not.toBeNull();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('shows user-facing error message on non-2xx API response without crashing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    }));

    const { container } = render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );

    expect(screen.getByRole('alert').textContent).toBe('Internal Server Error');
    expect(container.querySelector('#recipient-email')).not.toBeNull();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  // ── Loading state ────────────────────────────────────────────────────────

  it('disables both Send and Cancel buttons and shows "Sending\u2026" while loading', async () => {
    // Never resolves — keeps component in loading state
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Sending\u2026' })).toBeDisabled()
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  // ── Close button on success ──────────────────────────────────────────────

  it('calls onClose when the Close button is clicked after success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    }));

    render(
      <SendEmailModal
        invoice={invoiceFixture}
        dispatch={mockDispatch}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
