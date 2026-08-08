import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SendInvoiceModal } from './SendInvoiceModal.jsx';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Renders the modal in its open state with sensible defaults. */
function renderModal(props = {}) {
  const defaults = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    invoiceId: 'inv-001',
  };
  return render(<SendInvoiceModal {...defaults} {...props} />);
}

// ---------------------------------------------------------------------------
// (a) Modal not visible before button click
// ---------------------------------------------------------------------------

describe('SendInvoiceModal — visibility', () => {
  it('(a) renders nothing when isOpen is false', () => {
    render(
      <SendInvoiceModal
        isOpen={false}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        invoiceId="inv-001"
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when isOpen is true', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// (b) Invalid email shows validation error, no fetch called
// ---------------------------------------------------------------------------

describe('SendInvoiceModal — client-side validation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('(b) shows "Email is required" for empty submission and does not call fetch', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('(b) treats whitespace-only input as empty and shows "Email is required"', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('(b) shows "Please enter a valid email address" for malformed email and does not call fetch', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('(b) shows validation error for email missing domain (no dot)', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'user@nodomain' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// (c) Mocked successful response → modal closes, success message shown
// ---------------------------------------------------------------------------

describe('SendInvoiceModal — successful send', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200 })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('(c) calls onSuccess and does not call onClose directly on success', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    renderModal({ onSuccess, onClose });

    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('(c) POSTs the correct payload to fetch', async () => {
    renderModal({ invoiceId: 'inv-42' });

    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [, init] = fetch.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      email: 'user@example.com',
      invoiceId: 'inv-42',
    });
  });

  it('(c) disables the submit button while loading', async () => {
    // Use a promise we control so we can inspect mid-flight state.
    let resolveFetch;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      )
    );

    renderModal();
    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    // Button should now show loading text and be disabled
    expect(await screen.findByRole('button', { name: 'Sending…' })).toBeDisabled();

    // Resolve so the component can clean up
    resolveFetch({ ok: true, status: 200 });
  });
});

// ---------------------------------------------------------------------------
// (d) Mocked failed response → modal stays open, error message shown
// ---------------------------------------------------------------------------

describe('SendInvoiceModal — failed send', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('(d) non-ok HTTP response keeps modal open and shows error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    const onSuccess = vi.fn();
    renderModal({ onSuccess });

    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(
      await screen.findByText('Server responded with status 500')
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('(d) network error (fetch rejects) keeps modal open and shows error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network failure'))
    );

    const onSuccess = vi.fn();
    renderModal({ onSuccess });

    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByText('Network failure')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
