import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SendEmailModal } from './SendEmailModal.jsx';
import { UPDATE_INVOICE_STATUS } from '../../context/InvoiceContext.jsx';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockDispatch = vi.fn();

// Stub useInvoice so the modal can access dispatch without a real Provider.
vi.mock('../../context/InvoiceContext.jsx', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useInvoice: () => ({ dispatch: mockDispatch }),
  };
});

const baseInvoice = {
  invoiceNumber: 'INV-001',
  invoiceDate: '2024-01-01',
  dueDate: '2024-01-31',
  clientName: 'Acme Corp',
  clientEmail: '',
  lineItems: [
    { description: 'Design', quantity: 1, rate: 500, amount: 500 },
  ],
  subtotal: 500,
  tax: 50,
  total: 550,
  status: 'Draft',
};

const onClose = vi.fn();

function renderModal(invoiceOverrides = {}) {
  return render(
    <SendEmailModal
      invoice={{ ...baseInvoice, ...invoiceOverrides }}
      onClose={onClose}
    />
  );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  // Provide the env var for tests that reach the fetch call.
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL = 'https://example.supabase.co/functions/v1';
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// (a) Validation: invalid email → error shown, fetch NOT called
// ---------------------------------------------------------------------------

describe('SendEmailModal — validation', () => {
  it('shows an inline error and does not call fetch when email is empty', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderModal();

    // Clear the input to ensure it is empty
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows an inline error and does not call fetch for an address missing @', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderModal();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'notanemail' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// (b) Success path: fetch resolves 200 → modal closes, dispatch called
// ---------------------------------------------------------------------------

describe('SendEmailModal — success path', () => {
  it('closes the modal and dispatches UPDATE_INVOICE_STATUS on 200 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    renderModal({ clientEmail: 'client@example.com' });

    // The input is pre-filled from clientEmail prop
    expect(screen.getByRole('textbox')).toHaveValue('client@example.com');

    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    // Button should show loading state
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /sending/i })).toBeTruthy();
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: UPDATE_INVOICE_STATUS,
        payload: 'Sent',
      });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// (c) API error path: fetch resolves non-200 → error shown, modal stays open
// ---------------------------------------------------------------------------

describe('SendEmailModal — API error path', () => {
  it('shows an error message and keeps the modal open on a 500 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    renderModal({ clientEmail: 'client@example.com' });

    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Modal heading still visible — modal has not closed
    expect(
      screen.getByRole('heading', { name: /send invoice by email/i })
    ).toBeInTheDocument();

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a generic error message on a non-200 response without JSON body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Bad Gateway', { status: 502 })
    );

    renderModal({ clientEmail: 'client@example.com' });

    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
