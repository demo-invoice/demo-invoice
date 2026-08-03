import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SendInvoiceButton } from '../components/invoice/SendInvoiceButton';
import type { Invoice } from '../types/invoice';

const testInvoice: Invoice = {
  invoiceNumber: 'INV-099',
  companyName: 'Acme Corp',
  clientName: 'Dave',
  clientEmail: '',
  issuedAt: '2024-05-01',
  dueAt: '',
  taxRate: 0,
  lineItems: [],
};

describe('SendInvoiceButton', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  it('renders the Send Invoice button', () => {
    render(<SendInvoiceButton invoice={testInvoice} />);
    expect(screen.getByRole('button', { name: /Send Invoice/i })).toBeInTheDocument();
  });

  it('modal is not visible before the button is clicked', () => {
    render(<SendInvoiceButton invoice={testInvoice} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the modal when the button is clicked', () => {
    render(<SendInvoiceButton invoice={testInvoice} />);
    fireEvent.click(screen.getByRole('button', { name: /Send Invoice/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('modal title contains the invoice number', () => {
    render(<SendInvoiceButton invoice={testInvoice} />);
    fireEvent.click(screen.getByRole('button', { name: /Send Invoice/i }));
    expect(screen.getByText(/Send Invoice #INV-099/i)).toBeInTheDocument();
  });

  it('dismisses the modal via the close (✕) button', () => {
    render(<SendInvoiceButton invoice={testInvoice} />);
    fireEvent.click(screen.getByRole('button', { name: /Send Invoice/i }));
    fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('dismisses the modal via the Cancel button', () => {
    render(<SendInvoiceButton invoice={testInvoice} />);
    fireEvent.click(screen.getByRole('button', { name: /Send Invoice/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('can reopen the modal after it has been closed', () => {
    render(<SendInvoiceButton invoice={testInvoice} />);
    fireEvent.click(screen.getByRole('button', { name: /Send Invoice/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    fireEvent.click(screen.getByRole('button', { name: /Send Invoice/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
