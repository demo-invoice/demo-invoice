import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceProvider } from '../context/InvoiceContext';
import { SendInvoiceModal } from '../components/SendInvoiceModal';

vi.mock('../services/emailService', () => ({
  sendInvoice: vi.fn(),
}));

import { sendInvoice } from '../services/emailService';
const mockSendInvoice = vi.mocked(sendInvoice);

function renderModal(onClose = vi.fn()) {
  return render(
    <InvoiceProvider>
      <SendInvoiceModal onClose={onClose} />
    </InvoiceProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SendInvoiceModal — rendering', () => {
  it('renders the dialog with correct aria attributes', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders the heading "Send Invoice by Email"', () => {
    renderModal();
    expect(screen.getByText('Send Invoice by Email')).toBeInTheDocument();
  });

  it('renders the Recipient Email label and input', () => {
    renderModal();
    expect(screen.getByLabelText(/recipient email/i)).toBeInTheDocument();
  });

  it('renders the Send Invoice submit button', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /send invoice/i })).toBeInTheDocument();
  });

  it('renders the Cancel button', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('input has placeholder "client@example.com"', () => {
    renderModal();
    expect(screen.getByLabelText(/recipient email/i)).toHaveAttribute('placeholder', 'client@example.com');
  });

  it('input has maxLength of 254', () => {
    renderModal();
    expect(screen.getByLabelText(/recipient email/i)).toHaveAttribute('maxLength', '254');
  });
});

describe('SendInvoiceModal — email validation', () => {
  it('shows validation error "Please enter a valid email address." on empty submit', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please enter a valid email address.');
    expect(mockSendInvoice).not.toHaveBeenCalled();
  });

  it('shows validation error for malformed email "not-an-email"', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please enter a valid email address.');
    expect(mockSendInvoice).not.toHaveBeenCalled();
  });

  it('clears validation error when user starts typing after a failed attempt', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    await screen.findByRole('alert');
    await user.type(screen.getByLabelText(/recipient email/i), 'a');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('marks input as aria-invalid when validation error is present', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    await screen.findByRole('alert');
    expect(screen.getByLabelText(/recipient email/i)).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('SendInvoiceModal — loading state', () => {
  it('disables the send button while request is in-flight', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockReturnValueOnce(new Promise(() => undefined));
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  it('shows "Sending…" text on the button while in-flight', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockReturnValueOnce(new Promise(() => undefined));
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(screen.getByRole('button', { name: /sending/i })).toHaveTextContent('Sending…');
  });

  it('disables the Cancel button while request is in-flight', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockReturnValueOnce(new Promise(() => undefined));
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('disables the email input while request is in-flight', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockReturnValueOnce(new Promise(() => undefined));
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(screen.getByLabelText(/recipient email/i)).toBeDisabled();
  });

  it('prevents duplicate API calls on rapid double-click', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockReturnValue(new Promise(() => undefined));
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    const btn = screen.getByRole('button', { name: /send invoice/i });
    await user.click(btn);
    await user.click(btn);
    await waitFor(() => {
      expect(mockSendInvoice).toHaveBeenCalledTimes(1);
    });
  });
});

describe('SendInvoiceModal — success feedback', () => {
  it('shows success toast with the exact message returned by the service', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockResolvedValueOnce({
      ok: true,
      message: 'Invoice sent to client@example.com.',
    });
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invoice sent to client@example.com.');
  });

  it('re-enables the send button after a successful send', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockResolvedValueOnce({
      ok: true,
      message: 'Invoice sent to client@example.com.',
    });
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: /send invoice/i })).not.toBeDisabled();
  });

  it('dismisses the toast when × is clicked', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockResolvedValueOnce({
      ok: true,
      message: 'Invoice sent to client@example.com.',
    });
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('SendInvoiceModal — error feedback', () => {
  it('shows error toast "Failed to send — please try again." on API failure', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockResolvedValueOnce({
      ok: false,
      message: 'Failed to send — please try again.',
    });
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to send — please try again.');
  });

  it('re-enables the send button after an error so the user can retry', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockResolvedValueOnce({
      ok: false,
      message: 'Failed to send — please try again.',
    });
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: /send invoice/i })).not.toBeDisabled();
  });
});

describe('SendInvoiceModal — cancel / close', () => {
  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(onClose);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
