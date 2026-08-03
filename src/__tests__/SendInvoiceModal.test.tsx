import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceProvider } from '../context/InvoiceContext';
import { SendInvoiceModal } from '../components/SendInvoiceModal';

// Mock emailService so tests don't make real HTTP calls
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

describe('SendInvoiceModal', () => {
  it('renders the email input and Send Invoice button', () => {
    renderModal();
    expect(screen.getByLabelText(/recipient email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send invoice/i })).toBeInTheDocument();
  });

  it('shows inline validation error for empty submission', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
    expect(mockSendInvoice).not.toHaveBeenCalled();
  });

  it('shows inline validation error for malformed email', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
    expect(mockSendInvoice).not.toHaveBeenCalled();
  });

  it('disables the send button while request is in-flight', async () => {
    const user = userEvent.setup();
    // Never resolves during this test — simulates in-flight
    mockSendInvoice.mockReturnValueOnce(new Promise(() => undefined));

    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  it('shows success toast with recipient address on successful send', async () => {
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

  it('shows error toast on API failure', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockResolvedValueOnce({
      ok: false,
      message: 'Failed to send — please try again.',
    });

    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');
    await user.click(screen.getByRole('button', { name: /send invoice/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to send/i);
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(onClose);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call sendInvoice on rapid double-click (button disabled after first)', async () => {
    const user = userEvent.setup();
    mockSendInvoice.mockReturnValue(new Promise(() => undefined));

    renderModal();
    await user.type(screen.getByLabelText(/recipient email/i), 'client@example.com');

    const btn = screen.getByRole('button', { name: /send invoice/i });
    await user.click(btn);
    // Button is now disabled; second click should be a no-op
    await user.click(btn);

    await waitFor(() => {
      expect(mockSendInvoice).toHaveBeenCalledTimes(1);
    });
  });
});
