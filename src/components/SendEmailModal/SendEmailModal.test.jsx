import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SendEmailModal } from './SendEmailModal.jsx';
import { InvoiceProvider } from '../../context/InvoiceContext.jsx';

const FUNCTIONS_URL = 'https://test.supabase.co/functions/v1';

function renderModal(props = {}) {
  const onClose = props.onClose ?? vi.fn();
  const invoice = props.invoice ?? { id: 'inv-001', total: 100 };
  return render(
    <InvoiceProvider>
      <SendEmailModal invoice={invoice} onClose={onClose} />
    </InvoiceProvider>
  );
}

describe('SendEmailModal', () => {
  beforeEach(() => {
    import.meta.env.VITE_SUPABASE_FUNCTIONS_URL = FUNCTIONS_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('(a) shows success state after a successful send', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    renderModal();

    expect(screen.getByRole('heading', { name: 'Send Invoice by Email' })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() =>
      expect(screen.getByText(/invoice sent successfully/i)).toBeInTheDocument()
    );
  });

  it('(b) shows validation error and aria-invalid=true when email is empty', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /send$/i }));

    const input = screen.getByLabelText(/recipient email/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
    expect(globalThis.fetch).not.toHaveBeenCalled?.();
  });

  it('(c) shows error message when the API returns a network error', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network failure'));

    renderModal();

    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i)
    );
  });
});
