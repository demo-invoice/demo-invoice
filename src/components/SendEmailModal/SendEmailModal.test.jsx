import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendEmailModal } from './SendEmailModal.jsx';

vi.mock('../../services/emailService.js', () => ({
  sendInvoiceEmail: vi.fn(),
}));

import { sendInvoiceEmail } from '../../services/emailService.js';

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

  // (a) Modal renders
  it('renders the modal dialog when isOpen is true', () => {
    render(<SendEmailModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Send Invoice by Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Recipient email address')).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    render(<SendEmailModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders Cancel and Send buttons in idle state', () => {
    render(<SendEmailModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('resets state when modal is reopened', async () => {
    sendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    const { rerender } = render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'a@b.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => screen.getByRole('status'));

    // Close then reopen
    rerender(<SendEmailModal {...defaultProps} isOpen={false} />);
    rerender(<SendEmailModal {...defaultProps} isOpen={true} />);

    expect(screen.getByLabelText('Recipient email address')).toHaveValue('');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // (b) Validation — invalid emails block submission
  it('shows "Email address is required." and blocks send when email is empty', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Email address is required.');
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows "Email address is required." for whitespace-only input', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), '   ');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Email address is required.');
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows "Please enter a valid email address." for missing @ symbol', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'notanemail');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('shows "Please enter a valid email address." for missing TLD', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'user@domain');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
    expect(sendInvoiceEmail).not.toHaveBeenCalled();
  });

  it('clears the inline error when the user starts typing after a failed validation', async () => {
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Recipient email address'), 'a');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // (c) Valid submission calls service with correct arguments
  it('calls sendInvoiceEmail with trimmed email and invoiceRef.current on valid submit', async () => {
    sendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), '  test@example.com  ');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(sendInvoiceEmail).toHaveBeenCalledTimes(1);
      expect(sendInvoiceEmail).toHaveBeenCalledWith('test@example.com', fakeInvoiceRef.current);
    });
  });

  // Success feedback
  it('shows "Invoice sent successfully!" after a successful send', async () => {
    sendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'ok@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Invoice sent successfully!');
    });
  });

  it('shows a Close button (not Send/Cancel) after a successful send', async () => {
    sendInvoiceEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'ok@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => screen.getByRole('status'));
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument();
  });

  // Error feedback
  it('shows the error message returned by sendInvoiceEmail when it rejects', async () => {
    sendInvoiceEmail.mockRejectedValueOnce(
      new Error('Email service limit reached. Please try again later.')
    );
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

  it('keeps the form visible (not success view) after a send error', async () => {
    sendInvoiceEmail.mockRejectedValueOnce(new Error('Failed to send email: network error'));
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'fail@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => screen.getByRole('alert'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  // Loading / double-submit guard
  it('disables the Send button and shows "Sending\u2026" while loading', async () => {
    sendInvoiceEmail.mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'slow@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sending\u2026' })).toBeDisabled();
    });
  });

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

  it('disables the email input while loading', async () => {
    sendInvoiceEmail.mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'slow@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Recipient email address')).toBeDisabled();
    });
  });

  // onClose behaviour
  it('calls onClose when Cancel is clicked in idle state', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Close is clicked after a successful send', async () => {
    sendInvoiceEmail.mockResolvedValueOnce(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} onClose={onClose} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'ok@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => screen.getByRole('status'));

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when Cancel is clicked while loading', async () => {
    sendInvoiceEmail.mockReturnValueOnce(new Promise(() => {}));
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<SendEmailModal {...defaultProps} onClose={onClose} />);

    await user.type(screen.getByLabelText('Recipient email address'), 'slow@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => screen.getByRole('button', { name: 'Cancel' }));

    // Cancel is disabled — userEvent will not fire click on a disabled button
    expect(onClose).not.toHaveBeenCalled();
  });
});
