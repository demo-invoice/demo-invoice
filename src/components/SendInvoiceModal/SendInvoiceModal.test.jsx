import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendInvoiceModal } from './SendInvoiceModal.jsx';
import { UPDATE_INVOICE_STATUS } from '../../context/InvoiceContext.jsx';

// ---------------------------------------------------------------------------
// Shared test fixtures
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

function renderModal(overrides = {}) {
  const dispatch = vi.fn();
  const onClose = vi.fn();
  const liveInvoice = { ...baseLiveInvoice, ...overrides };

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
// Scenario 1 — Validation error when email is blank or invalid
// ---------------------------------------------------------------------------
describe('SendInvoiceModal — validation', () => {
  it('shows the modal heading', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: 'Send Invoice by Email' })).toBeInTheDocument();
  });

  it('shows validation error and sets aria-invalid when email is cleared and form submitted', async () => {
    renderModal({ clientEmail: '' });
    const input = screen.getByLabelText('Recipient email');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
    });
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows validation error for a malformed email', async () => {
    renderModal({ clientEmail: '' });
    const input = screen.getByLabelText('Recipient email');
    fireEvent.change(input, { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
    });
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does NOT call dispatch or onClose when validation fails', async () => {
    const { dispatch, onClose } = renderModal({ clientEmail: '' });
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));
    await waitFor(() => screen.getByRole('alert'));
    expect(dispatch).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('pre-populates email from liveInvoice.clientEmail', () => {
    renderModal({ clientEmail: 'prefilled@example.com' });
    expect(screen.getByLabelText('Recipient email')).toHaveValue('prefilled@example.com');
  });
});

// ---------------------------------------------------------------------------
// Scenario 2 — Success path
// ---------------------------------------------------------------------------
describe('SendInvoiceModal — success path', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }));
  });

  it('dispatches UPDATE_INVOICE_STATUS with Sent and calls onClose on success', async () => {
    const { dispatch, onClose } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: UPDATE_INVOICE_STATUS, value: 'Sent' });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sends liveInvoice verbatim in the request body', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const [, options] = /** @type {[string, RequestInit]} */ (fetch.mock.calls[0]);
    const body = JSON.parse(/** @type {string} */ (options.body));

    expect(body.invoiceNumber).toBe('INV-001');
    expect(body.clientName).toBe('Acme Corp');
    expect(body.total).toBe(1100);
    expect(body.lineItems).toHaveLength(1);
  });

  it('disables the send button while in flight', async () => {
    // Delay resolution so we can assert the disabled state mid-flight
    let resolve;
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(
      new Promise((res) => { resolve = res; })
    ));

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));

    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();

    // Clean up
    resolve({ ok: true, json: async () => ({}) });
  });
});

// ---------------------------------------------------------------------------
// Scenario 3 — API error keeps modal open and shows error message
// ---------------------------------------------------------------------------
describe('SendInvoiceModal — API error', () => {
  it('shows error message and keeps modal open on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    }));

    const { dispatch, onClose } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));

    await waitFor(() => {
      expect(screen.getByTestId('api-error')).toHaveTextContent('Internal server error');
    });
    expect(dispatch).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('re-enables the send button after an API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Upstream failure' }),
    }));

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));

    await waitFor(() => screen.getByTestId('api-error'));
    expect(screen.getByRole('button', { name: 'Send Invoice' })).not.toBeDisabled();
  });

  it('shows a fallback message when the error response body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => { throw new Error('not json'); },
    }));

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));

    await waitFor(() => {
      expect(screen.getByTestId('api-error')).toHaveTextContent('Request failed with status 502');
    });
  });

  it('shows error message when fetch itself rejects (network failure)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send Invoice' }));

    await waitFor(() => {
      expect(screen.getByTestId('api-error')).toHaveTextContent('Network error');
    });
  });
});
