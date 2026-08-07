import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailInvoiceModal } from './EmailInvoiceModal.jsx';

// Mock the email service so no real network calls are made.
vi.mock('../../services/emailService.js', () => ({
  sendInvoiceEmail: vi.fn(),
}));

import { sendInvoiceEmail } from '../../services/emailService.js';

const INVOICE_DATA = {
  invoiceNumber: 'INV-001',
  invoiceDate: '2024-01-15',
  lineItems: [{ description: 'Design work', amount: 500 }],
  subtotal: 500,
  tax: 50,
  total: 550,
};

function renderModal(overrides = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onSent: vi.fn(),
    invoiceData: INVOICE_DATA,
    ...overrides,
  };
  return { ...render(<EmailInvoiceModal {...props} />), props };
}

describe('EmailInvoiceModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <EmailInvoiceModal
        isOpen={false}
        onClose={vi.fn()}
        onSent={vi.fn()}
        invoiceData={INVOICE_DATA}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/recipient email/i)).toBeInTheDocument();
  });

  // ── Validation: empty email ────────────────────────────────────────────────

  it('shows "Email is required" when submitting with empty recipient', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  // ── Validation: invalid format ─────────────────────────────────────────────

  it('shows "Please enter a valid email address" for malformed email', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/recipient email/i), {
      target: { value: 'not-an-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows "Please enter a valid email address" for email missing TLD', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/recipient email/i), {
      target: { value: 'user@domain' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
  });

  // ── Successful send ────────────────────────────────────────────────────────

  it('calls sendInvoiceEmail and then onSent on successful submission', async () => {
    sendInvoiceEmail.mockResolvedValueOnce(undefined);
    const { props } = renderModal();

    fireEvent.change(screen.getByLabelText(/recipient email/i), {
      target: { value: 'client@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: 'Please find attached.' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send invoice/i }));
    });

    await waitFor(() => {
      expect(sendInvoiceEmail).toHaveBeenCalledWith(
        INVOICE_DATA,
        'client@example.com',
        'Please find attached.'
      );
      expect(props.onSent).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/invoice sent successfully/i)).toBeInTheDocument();
  });

  // ── Error / failure flow ───────────────────────────────────────────────────

  it('shows generic retry error when sendInvoiceEmail rejects with network error', async () => {
    sendInvoiceEmail.mockRejectedValueOnce(new Error('Network Error'));
    const { props } = renderModal();

    fireEvent.change(screen.getByLabelText(/recipient email/i), {
      target: { value: 'client@example.com' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send invoice/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/failed to send email\. please try again\./i)
      ).toBeInTheDocument();
    });
    expect(props.onSent).not.toHaveBeenCalled();
  });

  it('shows configuration error message when env vars are missing', async () => {
    sendInvoiceEmail.mockRejectedValueOnce(
      new Error('Email configuration missing — check environment variables (VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY).')
    );
    renderModal();

    fireEvent.change(screen.getByLabelText(/recipient email/i), {
      target: { value: 'client@example.com' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send invoice/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/email configuration missing/i)
      ).toBeInTheDocument();
    });
  });

  // ── Modal dismiss without side effects ────────────────────────────────────

  it('calls onClose and does NOT call sendInvoiceEmail when Cancel is clicked', () => {
    const { props } = renderModal();
    fireEvent.change(screen.getByLabelText(/recipient email/i), {
      target: { value: 'client@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
    expect(props.onSent).not.toHaveBeenCalled();
  });

  it('calls onClose and does NOT call sendInvoiceEmail when backdrop is clicked', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByRole('dialog'));
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('resets form fields when modal is reopened after being closed', () => {
    const { rerender, props } = renderModal();
    fireEvent.change(screen.getByLabelText(/recipient email/i), {
      target: { value: 'someone@example.com' },
    });
    // Close
    rerender(
      <EmailInvoiceModal
        isOpen={false}
        onClose={props.onClose}
        onSent={props.onSent}
        invoiceData={INVOICE_DATA}
      />
    );
    // Reopen
    rerender(
      <EmailInvoiceModal
        isOpen={true}
        onClose={props.onClose}
        onSent={props.onSent}
        invoiceData={INVOICE_DATA}
      />
    );
    expect(screen.getByLabelText(/recipient email/i)).toHaveValue('');
  });
});
