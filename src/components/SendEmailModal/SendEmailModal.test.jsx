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
  return {
    onClose,
    ...render(
      <InvoiceProvider>
        <SendEmailModal invoice={invoice} onClose={onClose} />
      </InvoiceProvider>
    ),
  };
}

describe('SendEmailModal', () => {
  beforeEach(() => {
    import.meta.env.VITE_SUPABASE_FUNCTIONS_URL = FUNCTIONS_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────

  it('renders the modal heading with the exact required text', () => {
    renderModal();
    expect(
      screen.getByRole('heading', { name: 'Send Invoice by Email' })
    ).toBeInTheDocument();
  });

  it('renders the email input and action buttons in idle state', () => {
    renderModal();
    expect(screen.getByLabelText(/recipient email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('email input has aria-invalid=false initially', () => {
    renderModal();
    const input = screen.getByLabelText(/recipient email address/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  // ── (b) Validation errors ────────────────────────────────────────────────

  it('(b) shows validation error and aria-invalid=true when email is empty on submit', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /send$/i }));

    const input = screen.getByLabelText(/recipient email address/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/email address is required/i);
  });

  it('(b) shows validation error and aria-invalid=true for a malformed email', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    const input = screen.getByLabelText(/recipient email address/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/please enter a valid email address/i);
  });

  it('(b) does not call fetch when validation fails', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /send$/i }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('(b) clears the validation error when the user starts typing again', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /send$/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/recipient email address/i), 'a');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    const input = screen.getByLabelText(/recipient email address/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  // ── (a) Successful send ──────────────────────────────────────────────────

  it('(a) shows success message after a successful send', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() =>
      expect(screen.getByText(/invoice sent successfully/i)).toBeInTheDocument()
    );
  });

  it('(a) success state shows the recipient email address', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() =>
      expect(screen.getByText(/client@example.com/i)).toBeInTheDocument()
    );
  });

  it('(a) success state shows a Close button', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    );
  });

  it('(a) calls fetch with the correct URL, method, and payload', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    const invoice = { id: 'inv-42', total: 250 };
    renderModal({ invoice });

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${FUNCTIONS_URL}/send-invoice`);
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.email).toBe('client@example.com');
    expect(body.invoice).toEqual(invoice);
  });

  // ── (c) Network / API errors ─────────────────────────────────────────────

  it('(c) shows a network error message when fetch throws', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network failure'));

    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i)
    );
  });

  it('(c) shows an error message when the API returns a non-2xx status', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Resend API error (422).' }), { status: 422 })
    );

    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/resend api error/i)
    );
  });

  it('(c) shows the error body message from a non-2xx response', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Recipient address rejected.' }), { status: 400 })
    );

    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/recipient address rejected/i)
    );
  });

  // ── Loading / double-submit prevention ───────────────────────────────────

  it('disables the submit button while the request is in flight', async () => {
    const user = userEvent.setup();
    let resolveFetch;
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(
      new Promise((resolve) => { resolveFetch = resolve; })
    );

    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();

    // Resolve to avoid act() warnings
    resolveFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await waitFor(() => screen.getByText(/invoice sent successfully/i));
  });

  it('shows "Sending\u2026" label on the submit button while loading', async () => {
    const user = userEvent.setup();
    let resolveFetch;
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(
      new Promise((resolve) => { resolveFetch = resolve; })
    );

    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();

    resolveFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await waitFor(() => screen.getByText(/invoice sent successfully/i));
  });

  // ── VITE_SUPABASE_FUNCTIONS_URL not configured ───────────────────────────

  it('shows a config error when VITE_SUPABASE_FUNCTIONS_URL is not set', async () => {
    import.meta.env.VITE_SUPABASE_FUNCTIONS_URL = '';
    const user = userEvent.setup();

    renderModal();

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /email service is not configured/i
      )
    );
  });

  // ── onClose callback ─────────────────────────────────────────────────────

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Close is clicked after a successful send', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    renderModal({ onClose });

    await user.type(screen.getByLabelText(/recipient email address/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send$/i }));
    await waitFor(() => screen.getByRole('button', { name: /close/i }));

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
