import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InvoicePreview } from './InvoicePreview.jsx';
import { InvoiceProvider } from '../../context/InvoiceContext.jsx';

const baseInvoice = {
  invoiceNumber: 'INV-042',
  clientName: 'Acme Corp',
  clientEmail: 'acme@example.com',
  status: 'Draft',
  logoUrl: 'data:image/png;base64,logo123',
  lineItems: [],
  yourDetails: '',
  currency: 'USD',
};

describe('InvoicePreview', () => {
  it('renders the invoice number from context', () => {
    render(
      <InvoiceProvider initialState={baseInvoice}><InvoicePreview /></InvoiceProvider>
    );
    expect(screen.getByText(/INV-042/)).toBeInTheDocument();
  });

  it('renders the logo img when logoUrl is set in context', () => {
    render(
      <InvoiceProvider initialState={baseInvoice}><InvoicePreview /></InvoiceProvider>
    );
    expect(screen.getByRole('img', { name: /business logo/i })).toBeInTheDocument();
  });

  it('does not render a logo img when logoUrl is null', () => {
    const stateWithoutLogo = { ...baseInvoice, logoUrl: null };
    render(
      <InvoiceProvider initialState={stateWithoutLogo}><InvoicePreview /></InvoiceProvider>
    );
    expect(screen.queryByRole('img', { name: /business logo/i })).not.toBeInTheDocument();
  });
});
