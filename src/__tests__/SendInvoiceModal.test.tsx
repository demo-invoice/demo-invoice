import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SendInvoiceModal } from '../components/invoice/SendInvoiceModal';
import type { Invoice } from '../types/invoice';

const testInvoice: Invoice = {
  invoiceNumber: 'INV-007',
  companyName: 'Acme Corp',
  clientName: 'Carol',
  clientEmail: '',
  issuedAt: '2024-03-01',
  dueAt: '2024-03-31',
  taxRate: 0,
  lineItems: [],
};

describe('SendInvoiceModal', () => {
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  it('renders the modal with correct title', () => {
    render(<SendInvoiceModal invoice={testInvoice} onClose={onClose} />);
    expect(screen.getByText(/Send Invoice #INV-007/i)).toBeInTheDocument();
  });

  it('renders recipient, subject, and message fields', () => {
    render(<SendInvoiceModal invoice={testInvoice} onClose={onClose} />);
    expect(screen.getByLabelText(/Recipient email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  it('Send button is disabled when recipient is empty', () => {
    render(<SendInvoiceModal invoice={testInvoice} onClose={onClose} />);
    expect(screen.getByRole('button', { name: /Send Invoice/i })).toBeDisabled();
  });

  it('Send button is disabled when recipient is invalid', () => {
    render(<SendInvoiceModal invoice={testInvoice} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Recipient email/i), {
      target: { value: 'not-an-email' },
    });
    expect(screen.getByRole('button', { name: /Send Invoice/i })).toBeDisabled();
  });

  it('shows inline validation error for invalid email', () => {
    render(<SendInvoiceModal invoice={testInvoice} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Recipient email/i), {
      target: { value: 'bad' },
    });
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
  });

  it('Send button is enabled with a valid email', () => {
    render(<SendInvoiceModal invoice={testInvoice} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Recipient email/i), {
      target: { value: 'valid@example.com' },
    });
    expect(screen.getByRole('button', { name: /Send Invoice/i })).not.toBeDisabled();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<SendInvoiceModal invoice={testInvoice} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the close (✕) button is clicked', () => {
    render(<SendInvoiceModal invoice={testInvoice} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('pre-populates recipient from invoice.clientEmail', () => {
    const invoiceWithEmail = { ...testInvoice, clientEmail: 'carol@example.com' };
    render(<SendInvoiceModal invoice={invoiceWithEmail} onClose={onClose} />);
    expect(screen.getByLabelText(/Recipient email/i)).toHaveValue('carol@example.com');
  });
});
