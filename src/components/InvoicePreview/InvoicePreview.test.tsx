import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { InvoicePreview } from './InvoicePreview';

/** Renders InvoicePreview inside the required provider. */
function renderPreview(): ReturnType<typeof render> {
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

  it('renders the logo placeholder', () => {
    renderPreview();
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('shows em-dash for empty invoice number', () => {
    renderPreview();
    // The em-dash placeholder for an empty invoice number
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    renderPreview();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Qty')).toBeInTheDocument();
    expect(screen.getByText('Unit Price')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders placeholder row when lineItems is empty', () => {
    renderPreview();
    // The em-dash in the empty tbody placeholder cell
    const cells = screen.getAllByRole('cell');
    const placeholderCell = cells.find((c) => c.getAttribute('colspan') === '4');
    expect(placeholderCell).toBeDefined();
  });

  it('does not render Bill To block when billToName is empty', () => {
    renderPreview();
    expect(screen.queryByText('Bill To')).not.toBeInTheDocument();
  });

  it('does not render Notes section when notes is empty', () => {
    renderPreview();
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('renders $0.00 totals with no line items', () => {
    renderPreview();
    const zeros = screen.getAllByText('$0.00');
    // subtotal, tax, grand total all $0.00
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });
});
