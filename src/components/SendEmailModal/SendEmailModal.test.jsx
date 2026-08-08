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
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL = 'https://example.supabase.co/functions/v1';
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('SendEmailModal — rendering', () => {
  it('renders the heading exactly as "Send Invoice by Email"', () => {
    renderModal();
    expect(
      screen.getByRole('heading', { name: 'Send Invoice by Email' })
    ).toBeInTheDocument();
  });

  it('renders a Send button and a Cancel button', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /^send$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
  });

  it('pre-fills the email input from invoice.clientEmail', () => {
    renderModal({ clientEmail: 'prefilled@example.com' });
    expect(screen.getByRole('textbox')).toHaveValue('prefilled@example.com');
  });

  it('sets aria-invalid="false" on the input when there is no error', () => {
    renderModal();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('renders inside a dialog element with aria-modal="true"', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

// ---------------------------------------------------------------------------
// (a) Validation: invalid email → error shown, fetch NOT called
// ---------------------------------------------------------------------------

describe('SendEmailModal — validation', () => {
  it('shows an inline error and does not call fetch when email is empty', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderModal();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows an inline error and does not call fetch for whitespace-only input', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderModal();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows an inline error and does not call fetch for an address missing @', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderModal();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'notanemail' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows an inline error and does not call fetch for an address missing TLD', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderModal();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'user@nodot' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('clears the validation error when the user corrects the input', async () => {
    renderModal();

    // Trigger validation error
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Fix the input — error should clear
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'valid@example.com' } });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
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

    expect(screen.getByRole('textbox')).toHaveValue('client@example.com');

    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    // Loading state: Send button label changes to "Sending…" and buttons are disabled
    await waitFor(() => {
      const sendingBtn = screen.queryByRole('button', { name: /sending/i });
      expect(sendingBtn).toBeTruthy();
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: UPDATE_INVOICE_STATUS,
        payload: 'Sent',
      });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons while the request is in flight', async () => {
    let resolveResponse;
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(
      new Promise((res) => { resolveResponse = res; })
    );

    renderModal({ clientEmail: 'client@example.com' });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /^cancel$/i })).toBeDisabled();
    });

    // Resolve to avoid dangling promise
    resolveResponse(new Response(JSON.stringify({ ok: true }), { status: 200 }));
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
      screen.getByRole('heading', { name: 'Send Invoice by Email' })
    ).toBeInTheDocument();

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a generic status-based error on a non-200 response without JSON body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Bad Gateway', { status: 502 })
    );

    renderModal({ clientEmail: 'client@example.com' });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('shows an error message and keeps the modal open on a network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    renderModal({ clientEmail: 'client@example.com' });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('heading', { name: 'Send Invoice by Email' })
    ).toBeInTheDocument();

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a graceful error when VITE_SUPABASE_FUNCTIONS_URL is undefined', async () => {
    import.meta.env.VITE_SUPABASE_FUNCTIONS_URL = '';
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderModal({ clientEmail: 'client@example.com' });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Cancel button
// ---------------------------------------------------------------------------

describe('SendEmailModal — cancel', () => {
  it('calls onClose when the Cancel button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
