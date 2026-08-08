import React from 'react';
import { InvoiceContext } from '../../context/InvoiceContext.jsx';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InvoicePreview } from './InvoicePreview.jsx';

const baseInvoice = {
  invoiceNumber: 'INV-042',
  clientName: 'Acme Corp',
  clientEmail: 'acme@example.com',
  status: 'Draft',
  logoUrl: null,
  yourDetails: '',
  currency: 'USD',
  lineItems: [],
  dispatch: () => {},
};

function renderWithInvoice(invoiceOverrides = {}) {
  const invoice = { ...baseInvoice, ...invoiceOverrides };
  const mockDispatch = () => {};
  return render(
    <InvoiceContext.Provider value={{ ...invoice, dispatch: mockDispatch }}>
      <InvoicePreview />
    </InvoiceContext.Provider>
  );
}

describe('InvoicePreview', () => {
  it('renders invoice number when provided',
    () => {
      renderWithInvoice();
      expect(screen.getByText(/INV-042/)).toBeInTheDocument();
    }
  );

  it('renders the logo img when logoUrl is set', () => {
    renderWithInvoice({ logoUrl: 'https://example.com/logo.png' });
    expect(screen.getByRole('img', { name: /business logo/i })).toBeInTheDocument();
  });

  it('does not render logo img when logoUrl is null', () => {
    renderWithInvoice({ logoUrl: null });
    expect(screen.queryByRole('img', { name: /business logo/i })).not.toBeInTheDocument();
  });

  it('does not render logo img when logoUrl is empty string', () => {
    renderWithInvoice({ logoUrl: '' });
    expect(screen.queryByRole('img', { name: /business logo/i })).not.toBeInTheDocument();
  });

  it('renders placeholder when no logo is set', () => {
    renderWithInvoice();
    expect(screen.queryByRole('img', { name: /business logo/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Logo placeholder')).toBeInTheDocument();
  });
});
