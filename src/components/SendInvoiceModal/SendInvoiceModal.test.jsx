import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendInvoiceModal } from './SendInvoiceModal.jsx';
import { UPDATE_INVOICE_STATUS } from '../../context/InvoiceContext.jsx';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

/** @type {import('./SendInvoiceModal.jsx').LiveInvoice} */
const baseLiveInvoice = {
  invoiceNumber: 'INV-001',
  clientName: 'Acme Corp',
  clientEmail: 'client@acme.com',
  lineItems: [{ description: 'Consulting', quantity: 2, unitPrice: 500 }],
  subtotal: 1000,
  tax: 100,
  total: 1100,
  invoiceDate: '2024-01-01',
  dueDate: '2024-01-31',
  status: 'Draft',
  logoDataUrl: null,
};

function renderModal(invoiceOverrides = {}) {
  const dispatch = vi.fn();
  const onClose = vi.fn();
  const liveInvoice = { ...baseLiveInvoice, ...invoiceOverrides };
  render(
    <SendInvoiceModal
      liveInvoice={liveInvoice}
      dispatch={dispatch}
      onClose={onClose}
    />
  );
  return { dispatch, onClose };
}

// ---------------------------------------------------------------------------
// Heading / structure
// ---------------------------------------------------------------------------
describe('SendInvoiceModal — structure', () => {
  it('renders the heading exactly as "Send Invoice by Email"', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: 'Send Invoice by Email' })).toBeInTheDocument();
  });

  it('renders a dialog with aria-modal="true"', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('pre-populates the email input from liveInvoice.clientEmail', () => {
    renderModal({ clientEmail: 'prefilled@example.com' });
    expect(screen.getByLabelText('Recipient email')).toHaveValue('prefilled@example.com');
  });

  it('sets aria-invalid to "false" when email is valid and untouched', () => {
    renderModal();
    expect(screen.getByLabelText('Recipient email')).toHaveAttribute('aria-invalid', 'false');
  });
});

// ---------------------------------------------------------------------------
// Scenario 1 — Client-side validation
// ---------------------------------------------------------------------------
describe('SendInvoiceModal — validation', () => {
  it('shows validation alert and aria-invalid="true" when email is blank on submit', async () => {
    renderModal({ clientEmail: '' });
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.')
    );
    expect(screen.getByLabelText('Recipient email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows validation alert for a malformed email on submit', async () => {
    renderModal({ clientEmail: '' });
    fireEvent.change(screen.getByLabelText('Recipient email'), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.')
    );
    expect(screen.getByLabelText('Recipient email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does NOT call dispatch or onClose when validation fails', async () => {
    const { dispatch, onClose } = renderModal({ clientEmail: '' });
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() => screen.getByRole('alert'));
    expect(dispatch).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows validation error on blur when email is invalid', async () => {
    renderModal({ clientEmail: '' });
    const input = screen.getByLabelText('Recipient email');
    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.blur(input);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.')
    );
  });
});

// ---------------------------------------------------------------------------
// Scenario 2 — Success path
// ---------------------------------------------------------------------------
describe('SendInvoiceModal — success path', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) })
    );
  });

  it('dispatches UPDATE_INVOICE_STATUS with "Sent" on success', async () => {
    const { dispatch } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith({ type: UPDATE_INVOICE_STATUS, value: 'Sent' })
    );
  });

  it('calls onClose after a successful send', async () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('sends all liveInvoice fields verbatim in the request body', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [, options] = fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.invoiceNumber).toBe('INV-001');
    expect(body.clientName).toBe('Acme Corp');
    expect(body.total).toBe(1100);
    expect(body.subtotal).toBe(1000);
    expect(body.tax).toBe(100);
    expect(body.invoiceDate).toBe('2024-01-01');
    expect(body.dueDate).toBe('2024-01-31');
    expect(body.lineItems).toHaveLength(1);
    expect(body.lineItems[0].description).toBe('Consulting');
  });

  it('disables the send button and shows "Sending\u2026" while in flight', async () => {
    let resolve;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise((res) => { resolve = res; }))
    );
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    expect(screen.getByRole('button', { name: 'Sending\u2026' })).toBeDisabled();
    // clean up
    resolve({ ok: true, json: async () => ({}) });
  });
});

// ---------------------------------------------------------------------------
// Scenario 3 — API error keeps modal open and shows error message
// ---------------------------------------------------------------------------
describe('SendInvoiceModal — API error', () => {
  it('shows the API error message and keeps modal open on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })
    );
    const { dispatch, onClose } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() =>
      expect(screen.getByTestId('api-error')).toHaveTextContent('Internal server error')
    );
    expect(dispatch).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('re-enables the send button after an API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Upstream failure' }),
      })
    );
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() => screen.getByTestId('api-error'));
    expect(screen.getByRole('button', { name: 'Send Invoice' })).not.toBeDisabled();
  });

  it('shows fallback message when error response body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => { throw new Error('not json'); },
      })
    );
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() =>
      expect(screen.getByTestId('api-error')).toHaveTextContent('Request failed with status 502')
    );
  });

  it('shows error message when fetch itself rejects (network failure)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() =>
      expect(screen.getByTestId('api-error')).toHaveTextContent('Network error')
    );
  });
});
