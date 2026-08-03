/**
 * Integration tests for the Send Invoice flow.
 *
 * Uses MSW v2 to intercept /api/send-invoice and Vitest + React Testing Library
 * to drive the UI.
 */
import React from 'react';
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
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

function renderModal(onClose = () => {}, onSuccess = () => {}) {
  return render(
    <InvoiceProvider>
      <SendInvoiceModal
        invoice={mockInvoice}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </InvoiceProvider>,
  );
}

describe('SendInvoiceModal — successful send', () => {
  it('pre-fills subject with Invoice #<number>', () => {
    renderModal();
    expect(screen.getByLabelText(/subject/i)).toHaveValue('Invoice #042');
  });

  it('submits and shows success message', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderModal(undefined, onSuccess);

    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    await waitFor(() =>
      expect(screen.getByText(/invoice sent successfully/i)).toBeInTheDocument(),
    );
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});

describe('SendInvoiceModal — email validation', () => {
  it('shows inline error and does not call API when email is invalid', async () => {
    const user = userEvent.setup();
    // Override server to error if called — test should not reach it
    server.use(
      http.post('/api/send-invoice', () =>
        HttpResponse.json({ error: 'Should not be called' }, { status: 500 }),
      ),
    );

    renderModal();
    const emailInput = screen.getByLabelText(/recipient email/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'not-an-email');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    expect(
      screen.getByText(/please enter a valid email address/i),
    ).toBeInTheDocument();
    // Success message must NOT appear
    expect(
      screen.queryByText(/invoice sent successfully/i),
    ).not.toBeInTheDocument();
  });
});

describe('SendInvoiceModal — API error', () => {
  it('shows descriptive error message when email service fails', async () => {
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
        screen.getByText(/email service not configured/i),
      ).toBeInTheDocument(),
    );
  });

  it('re-enables Send button after a failed request', async () => {
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
});
