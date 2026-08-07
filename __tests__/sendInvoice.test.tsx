import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SendEmailModal } from '../src/components/SendEmailModal/SendEmailModal.jsx';
import * as emailService from '../src/services/emailService.js';

// Mock InvoiceContext so SendEmailModal can dispatch without a real Provider.
vi.mock('../src/context/InvoiceContext.jsx', () => ({
  useInvoiceContext: () => ({ dispatch: vi.fn() }),
  useInvoice: () => ({ logoDataUrl: null, emailSent: false }),
  InvoiceProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock emailService to control success/failure in tests.
vi.mock('../src/services/emailService.js', () => ({
  sendInvoiceEmail: vi.fn(),
}));

const mockSendInvoiceEmail = emailService.sendInvoiceEmail as ReturnType<typeof vi.fn>;

const defaultProps = {
  onClose: vi.fn(),
  invoiceData: { invoiceNumber: 'INV-001' },
};

describe('SendEmailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading matching /send invoice by email/i', () => {
    render(<SendEmailModal {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: /send invoice by email/i })
    ).toBeInTheDocument();
  });

  it('renders a label matching /recipient email/i', () => {
    render(<SendEmailModal {...defaultProps} />);
    expect(screen.getByLabelText(/recipient email/i)).toBeInTheDocument();
  });

  it('renders a Send button', () => {
    render(<SendEmailModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: /^send$/i })).toBeInTheDocument();
  });

  it('renders a Cancel button', () => {
    render(<SendEmailModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked and does NOT call emailService', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SendEmailModal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows a validation error when submitting with an empty email', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /^send$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i);
    expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid email format', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/recipient email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /^send$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
    expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows "Invoice sent successfully!" after a successful send', async () => {
    mockSendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/recipient email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /^send$/i }));
    expect(await screen.findByText(/invoice sent successfully/i)).toBeInTheDocument();
  });

  it('calls sendInvoiceEmail with the correct recipient email on success', async () => {
    mockSendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/recipient email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /^send$/i }));
    await screen.findByText(/invoice sent successfully/i);
    expect(mockSendInvoiceEmail).toHaveBeenCalledOnce();
    expect(mockSendInvoiceEmail).toHaveBeenCalledWith(
      expect.objectContaining({ recipientEmail: 'test@example.com' })
    );
  });

  it('does NOT call sendInvoiceEmail before the form is submitted', () => {
    render(<SendEmailModal {...defaultProps} />);
    expect(mockSendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows an error alert after a failed send', async () => {
    mockSendInvoiceEmail.mockRejectedValueOnce(new Error('Network error'));
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/recipient email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /^send$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i);
  });

  it('shows a warning alert when invoiceData is not provided', () => {
    render(<SendEmailModal onClose={vi.fn()} invoiceData={undefined} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/no invoice data/i);
  });

  it('disables the Send button when invoiceData is undefined', () => {
    render(<SendEmailModal onClose={vi.fn()} invoiceData={undefined} />);
    expect(screen.getByRole('button', { name: /^send$/i })).toBeDisabled();
  });

  it('renders the dialog with role="dialog" and aria-modal', () => {
    render(<SendEmailModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('shows a Close button (not Cancel) after a successful send', async () => {
    mockSendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);
    await user.type(screen.getByLabelText(/recipient email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /^send$/i }));
    await screen.findByText(/invoice sent successfully/i);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when the Close button is clicked after success', async () => {
    mockSendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SendEmailModal {...defaultProps} onClose={onClose} />);
    await user.type(screen.getByLabelText(/recipient email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /^send$/i }));
    await screen.findByText(/invoice sent successfully/i);
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
