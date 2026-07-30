import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvoiceProvider } from '../context/InvoiceContext';
import { InvoicePreview } from '../components/InvoicePreview';

function renderPreview() {
  return render(
    <InvoiceProvider>
      <InvoicePreview />
    </InvoiceProvider>
  );
}

describe('InvoicePreview', () => {
  it('renders the INVOICE heading', () => {
    renderPreview();
    expect(screen.getByText('INVOICE')).toBeInTheDocument();
  });

  it('renders From and Bill To sections', () => {
    renderPreview();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('Bill To')).toBeInTheDocument();
  });

  it('renders the line items table headers', () => {
    renderPreview();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Qty')).toBeInTheDocument();
    expect(screen.getByText('Unit Price')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders Subtotal, Tax, and Total rows', () => {
    renderPreview();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText(/Tax/)).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('does not render logo img when logo is empty', () => {
    renderPreview();
    expect(screen.queryByRole('img', { name: /company logo/i })).not.toBeInTheDocument();
  });
});
