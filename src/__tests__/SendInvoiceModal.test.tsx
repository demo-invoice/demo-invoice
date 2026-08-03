import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SendInvoiceModal } from '../components/invoice/SendInvoiceModal';
import type { Invoice } from '../types/invoice';

const baseInvoice: Invoice = {
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

  it('renders the modal dialog', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the modal title with the invoice number', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    expect(screen.getByText(/Send Invoice #INV-007/i)).toBeInTheDocument();
  });

  it('renders the recipient email input', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    expect(screen.getByLabelText(/Recipient email/i)).toBeInTheDocument();
  });

  it('renders the subject input', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
  });

  it('renders the message textarea', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  it('Send Invoice button is disabled when recipient is empty', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    expect(screen.getByRole('button', { name: /Send Invoice/i })).toBeDisabled();
  });

  it('Send Invoice button is disabled when recipient is malformed', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Recipient email/i), {
      target: { value: 'not-an-email' },
    });
    expect(screen.getByRole('button', { name: /Send Invoice/i })).toBeDisabled();
  });

  it('shows inline validation error text for a malformed email', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Recipient email/i), {
      target: { value: 'bad' },
    });
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
  });

  it('inline validation error has role=alert', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Recipient email/i), {
      target: { value: 'bad' },
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('Send Invoice button is enabled when recipient is a valid email', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Recipient email/i), {
      target: { value: 'valid@example.com' },
    });
    expect(screen.getByRole('button', { name: /Send Invoice/i })).not.toBeDisabled();
  });

  it('calls onClose when the Cancel button is clicked', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the close (✕) button is clicked', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('pre-populates recipient input from invoice.clientEmail', () => {
    const invoiceWithEmail = { ...baseInvoice, clientEmail: 'carol@example.com' };
    render(<SendInvoiceModal invoice={invoiceWithEmail} onClose={onClose} />);
    expect(screen.getByLabelText(/Recipient email/i)).toHaveValue('carol@example.com');
  });

  it('subject input placeholder reflects invoice number and company name', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    const subjectInput = screen.getByLabelText(/Subject/i);
    expect(subjectInput).toHaveAttribute(
      'placeholder',
      'Invoice #INV-007 from Acme Corp',
    );
  });

  it('recipient input has placeholder client@example.com', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    expect(screen.getByLabelText(/Recipient email/i)).toHaveAttribute(
      'placeholder',
      'client@example.com',
    );
  });

  it('modal has aria-modal=true', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('modal is labelled by the title element', () => {
    render(<SendInvoiceModal invoice={baseInvoice} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});
