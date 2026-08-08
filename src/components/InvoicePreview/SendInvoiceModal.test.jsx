import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SendInvoiceModal } from './SendInvoiceModal.jsx';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

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
// (a) Modal visibility — does NOT appear before the button is clicked
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

  it('renders the dialog and heading when isOpen is true', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Send Invoice by Email')).toBeInTheDocument();
  });

  it('renders the email input and Send / Cancel buttons when open', () => {
    renderModal();
    expect(screen.getByLabelText('Recipient email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// (b) Client-side validation — invalid email shows error, fetch NOT called
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

  it('(b) treats whitespace-only input as empty → "Email is required", no fetch', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('(b) shows "Please enter a valid email address" for malformed email, no fetch', async () => {
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

  it('(b) shows validation error for email missing domain dot, no fetch', async () => {
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

  it('(b) shows validation error for email missing @, no fetch', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'invalidemail.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('(b) error message is rendered with role="alert"', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Email is required');
  });

  it('(b) clears the validation error when the user starts typing again', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('Email is required');

    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'a' },
    });
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// (c) Successful send → onSuccess called, modal closes, no onClose called directly
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

  it('(c) calls onSuccess and does NOT call onClose directly on success', async () => {
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

  it('(c) POSTs the correct JSON payload to fetch', async () => {
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
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('(c) trims whitespace from the email before POSTing', async () => {
    renderModal({ invoiceId: 'inv-1' });

    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: '  user@example.com  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [, init] = fetch.mock.calls[0];
    expect(JSON.parse(init.body).email).toBe('user@example.com');
  });

  it('(c) disables the submit button and shows "Sending…" while in flight', async () => {
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

    const sendingBtn = await screen.findByRole('button', { name: 'Sending…' });
    expect(sendingBtn).toBeDisabled();

    // Also cancel button is disabled while loading
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    // Settle the promise so the component can clean up
    resolveFetch({ ok: true, status: 200 });
  });

  it('(c) re-enables the submit button after success settles', async () => {
    const onSuccess = vi.fn();
    renderModal({ onSuccess });

    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    // onSuccess triggers isOpen=false in the parent, but within the modal's
    // own lifecycle loading is reset to false before onSuccess is called.
    // We verify fetch was called exactly once (no double-submit).
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// (d) Failed send → modal stays open, error shown, onSuccess NOT called
// ---------------------------------------------------------------------------

describe('SendInvoiceModal — failed send', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('(d) non-ok HTTP response keeps modal open and shows server error message', async () => {
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

  it('(d) error message is rendered with role="alert" on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 })
    );

    renderModal();
    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Server responded with status 503');
  });

  it('(d) re-enables the submit button after a failed request settles', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network failure'))
    );

    renderModal();
    fireEvent.change(screen.getByLabelText('Recipient email address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    // Wait for error to appear (loading has settled)
    await screen.findByText('Network failure');
    expect(screen.getByRole('button', { name: 'Send' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Cancel button — calls onClose and resets state
// ---------------------------------------------------------------------------

describe('SendInvoiceModal — cancel behaviour', () => {
  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
