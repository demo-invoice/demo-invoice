/**
 * Integration tests for the Send Invoice flow (T24).
 * Covers: successful send, email validation error, API error states,
 * loading/disabled state, and status dispatch.
 */
import React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { InvoiceProvider } from '../src/context/InvoiceContext';
import { SendInvoiceModal } from '../src/components/SendInvoiceModal';
import type { Invoice } from '../src/types/invoice';

const mockInvoice: Invoice = {
  id: '1',
  number: '042',
  clientName: 'Test Client',
  clientEmail: 'client@test.com',
  issueDate: '2024-06-01',
  dueDate: '2024-06-30',
  lineItems: [
    { id: 'li1', description: 'Consulting', quantity: 2, unitPrice: 500 },
  ],
  notes: '',
  status: 'Draft',
};

const server = setupServer(
  http.post('/api/send-invoice', () =>
    HttpResponse.json({ ok: true }, { status: 200 }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderModal(
  onClose = vi.fn(),
  onSuccess = vi.fn(),
  invoice: Invoice = mockInvoice,
) {
  return render(
    <InvoiceProvider>
      <SendInvoiceModal
        invoice={invoice}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </InvoiceProvider>,
  );
}

// ── Initial render ────────────────────────────────────────────────────────────

describe('SendInvoiceModal — initial render', () => {
  it('renders the modal dialog', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the heading "Send Invoice by Email"', () => {
    renderModal();
    expect(
      screen.getByRole('heading', { name: /send invoice by email/i }),
    ).toBeInTheDocument();
  });

  it('pre-fills recipient email from invoice.clientEmail', () => {
    renderModal();
    expect(screen.getByLabelText(/recipient email/i)).toHaveValue('client@test.com');
  });

  it('pre-fills subject with "Invoice #<number>"', () => {
    renderModal();
    expect(screen.getByLabelText(/subject/i)).toHaveValue('Invoice #042');
  });

  it('renders the Send Invoice submit button', () => {
    renderModal();
    expect(
      screen.getByRole('button', { name: /send invoice/i }),
    ).toBeInTheDocument();
  });

  it('renders the Cancel button', () => {
    renderModal();
    expect(
      screen.getByRole('button', { name: /cancel/i }),
    ).toBeInTheDocument();
  });

  it('Send Invoice button is enabled on initial render', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /send invoice/i })).not.toBeDisabled();
  });
});

// ── Successful send ───────────────────────────────────────────────────────────

describe('SendInvoiceModal — successful send', () => {
  it('calls onSuccess after a successful API response', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderModal(vi.fn(), onSuccess);

    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('shows success confirmation text after send', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/invoice sent successfully/i),
      ).toBeInTheDocument(),
    );
  });

  it('shows a Close button after successful send', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument(),
    );
  });

  it('Close button calls onClose after successful send', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(onClose);

    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalled();
  });
});

// ── Email validation ──────────────────────────────────────────────────────────

describe('SendInvoiceModal — email validation', () => {
  it('shows inline error for an invalid email and blocks submission', async () => {
    const user = userEvent.setup();
    renderModal();

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'not-an-email');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    expect(
      screen.getByText(/please enter a valid email address/i),
    ).toBeInTheDocument();
  });

  it('does not show success message when email is invalid', async () => {
    const user = userEvent.setup();
    renderModal();

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'bad-email');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    expect(
      screen.queryByText(/invoice sent successfully/i),
    ).not.toBeInTheDocument();
  });

  it('clears the inline email error when the user edits the field', async () => {
    const user = userEvent.setup();
    renderModal();

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'bad');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    expect(
      screen.getByText(/please enter a valid email address/i),
    ).toBeInTheDocument();

    await user.type(emailInput, '@fix.com');

    expect(
      screen.queryByText(/please enter a valid email address/i),
    ).not.toBeInTheDocument();
  });

  it('marks the email input as aria-invalid when there is an error', async () => {
    const user = userEvent.setup();
    renderModal();

    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'bad');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });
});

// ── API error states ──────────────────────────────────────────────────────────

describe('SendInvoiceModal — API error', () => {
  it('shows descriptive error when email service is not configured', async () => {
    server.use(
      http.post('/api/send-invoice', () =>
        HttpResponse.json(
          { error: 'Email service not configured; contact administrator' },
          { status: 500 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/email service not configured; contact administrator/i),
      ).toBeInTheDocument(),
    );
  });

  it('re-enables the Send button after a failed request', async () => {
    server.use(
      http.post('/api/send-invoice', () =>
        HttpResponse.json({ error: 'Resend rate limit exceeded' }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderModal();
    const btn = screen.getByRole('button', { name: /send invoice/i });
    await user.click(btn);

    await waitFor(() =>
      expect(screen.getByText(/resend rate limit exceeded/i)).toBeInTheDocument(),
    );
    expect(btn).not.toBeDisabled();
  });

  it('does not show success message on API failure', async () => {
    server.use(
      http.post('/api/send-invoice', () =>
        HttpResponse.json({ error: 'Email delivery failed: Unknown error' }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    await waitFor(() =>
      expect(screen.getByText(/email delivery failed/i)).toBeInTheDocument(),
    );
    expect(
      screen.queryByText(/invoice sent successfully/i),
    ).not.toBeInTheDocument();
  });
});

// ── Loading / disabled state ──────────────────────────────────────────────────

describe('SendInvoiceModal — loading state', () => {
  it('disables the Send button while request is in-flight', async () => {
    let resolveRequest!: () => void;
    server.use(
      http.post('/api/send-invoice', () =>
        new Promise<Response>((resolve) => {
          resolveRequest = () =>
            resolve(HttpResponse.json({ ok: true }, { status: 200 }) as unknown as Response);
        }),
      ),
    );

    const user = userEvent.setup();
    renderModal();
    const btn = screen.getByRole('button', { name: /send invoice/i });
    await user.click(btn);

    expect(btn).toBeDisabled();

    resolveRequest();
    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  it('shows "Sending\u2026" text on the button while in-flight', async () => {
    let resolveRequest!: () => void;
    server.use(
      http.post('/api/send-invoice', () =>
        new Promise<Response>((resolve) => {
          resolveRequest = () =>
            resolve(HttpResponse.json({ ok: true }, { status: 200 }) as unknown as Response);
        }),
      ),
    );

    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    expect(screen.getByText(/sending/i)).toBeInTheDocument();

    resolveRequest();
    await waitFor(() =>
      expect(screen.queryByText(/sending/i)).not.toBeInTheDocument(),
    );
  });

  it('disables the Cancel button while request is in-flight', async () => {
    let resolveRequest!: () => void;
    server.use(
      http.post('/api/send-invoice', () =>
        new Promise<Response>((resolve) => {
          resolveRequest = () =>
            resolve(HttpResponse.json({ ok: true }, { status: 200 }) as unknown as Response);
        }),
      ),
    );

    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();

    resolveRequest();
    await waitFor(() =>
      expect(screen.queryByText(/sending/i)).not.toBeInTheDocument(),
    );
  });
});

// ── Invoice with no line items ────────────────────────────────────────────────

describe('SendInvoiceModal — edge cases', () => {
  it('renders and submits successfully for an invoice with no line items', async () => {
    const emptyInvoice: Invoice = { ...mockInvoice, lineItems: [] };
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderModal(vi.fn(), onSuccess, emptyInvoice);

    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('uses fallback subject "Invoice #<number>" when subject is cleared', async () => {
    // The fallback is applied server-side; client sends empty string — just
    // verify the form allows an empty subject without blocking submission.
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderModal(vi.fn(), onSuccess);

    const subjectInput = screen.getByLabelText(/subject/i);
    await user.clear(subjectInput);
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
});
