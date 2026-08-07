import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendEmailModal } from './SendEmailModal.jsx';

// Mock the entire emailService module to prevent real network calls
vi.mock('../../services/emailService.js', () => ({
  sendInvoiceEmail: vi.fn(),
}));

import { sendInvoiceEmail } from '../../services/emailService.js';

/** A stable fake ref pointing to a dummy DOM element */
const fakeInvoiceRef = { current: document.createElement('div') };

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  invoiceRef: fakeInvoiceRef,
};

describe('SendEmailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // (a) Visibility
  it('renders the modal when isOpen is true', () => {
    render(<SendEmailModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Recipient email address')).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    render(<SendEmailModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // (b) Invalid email — inline error, no service call
  it('shows an inline error and does NOT call sendInvoiceEmail when email is empty', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Email address is required.');
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows an inline error and does NOT call sendInvoiceEmail for an invalid email format', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows an inline error for whitespace-only input', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), '   ');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Email address is required.');
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  // (c) Valid submission calls service with correct recipient
  it('calls sendInvoiceEmail with the trimmed recipient email on valid submission', async () => {
    sendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), '  test@example.com  ');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(sendInvoiceEmail).toHaveBeenCalledTimes(1);
      expect(sendInvoiceEmail).toHaveBeenCalledWith(
        'test@example.com',
        fakeInvoiceRef.current
      );
    });
  });

  // (d) Success message after resolved send
  it('shows a success message after the email is sent successfully', async () => {
    sendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'success@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Invoice sent successfully!');
    });
  });

  // (e) Error message after rejected send
  it('shows a descriptive error message when sendInvoiceEmail rejects', async () => {
    sendInvoiceEmail.mockRejectedValueOnce(new Error('Email service limit reached. Please try again later.'));
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'fail@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Email service limit reached. Please try again later.'
      );
    });
  });

  // Double-submit guard
  it('disables the Send button while loading to prevent double-submit', async () => {
    // Never resolves during this test
    sendInvoiceEmail.mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'slow@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    });
  });

  // Cancel blocked during loading
  it('disables the Cancel button while loading', async () => {
    sendInvoiceEmail.mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'slow@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });
});
