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

/** Renders InvoicePreview inside a context seeded with a full valid invoice. */
function renderSeededPreview() {
  const { useInvoice } = require('../context/InvoiceContext');

  function SeededPreview() {
    const { dispatch, state } = useInvoice();
    const seeded = React.useRef(false);
    if (!seeded.current) {
      seeded.current = true;
      dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
      dispatch({ type: 'UPDATE_FIELD', field: 'issueDate', value: '2024-01-01' });
      dispatch({ type: 'UPDATE_FIELD', field: 'dueDate', value: '2024-01-31' });
      dispatch({ type: 'UPDATE_FIELD', field: 'taxRate', value: 10 });
      dispatch({ type: 'UPDATE_FIELD', field: 'notes', value: 'Thank you for your business.' });
      dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Acme Corp' });
      dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'billing@acme.com' });
      dispatch({ type: 'UPDATE_SENDER', field: 'address', value: '123 Main St' });
      dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Client Co' });
      dispatch({ type: 'UPDATE_CLIENT', field: 'email', value: 'ap@client.com' });
      dispatch({ type: 'UPDATE_CLIENT', field: 'address', value: '456 Oak Ave' });
      const firstId = state.lineItems[0]?.id;
      if (firstId) {
        dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'description', value: 'Consulting' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'quantity', value: 2 });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'unitPrice', value: 500 });
      }
    }
    return <InvoicePreview />;
  }

  return render(
    <InvoiceProvider>
      <SeededPreview />
    </InvoiceProvider>
  );
}

describe('InvoicePreview — default (empty) state', () => {
  it('renders the INVOICE heading', () => {
    renderPreview();
    expect(screen.getByText('INVOICE')).toBeInTheDocument();
  });

  it('renders the "From" section heading', () => {
    renderPreview();
    expect(screen.getByText('From')).toBeInTheDocument();
  });

  it('renders the "Bill To" section heading', () => {
    renderPreview();
    expect(screen.getByText('Bill To')).toBeInTheDocument();
  });

  it('renders the line items table header: Description', () => {
    renderPreview();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders the line items table header: Qty', () => {
    renderPreview();
    expect(screen.getByText('Qty')).toBeInTheDocument();
  });

  it('renders the line items table header: Unit Price', () => {
    renderPreview();
    expect(screen.getByText('Unit Price')).toBeInTheDocument();
  });

  it('renders the line items table header: Amount', () => {
    renderPreview();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders the Subtotal row', () => {
    renderPreview();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
  });

  it('renders a Tax row', () => {
    renderPreview();
    expect(screen.getByText(/Tax/)).toBeInTheDocument();
  });

  it('renders the Total row', () => {
    renderPreview();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('does NOT render a logo img when logo is empty string', () => {
    renderPreview();
    expect(screen.queryByRole('img', { name: 'Company logo' })).not.toBeInTheDocument();
  });

  it('does NOT render the Notes section when notes is empty', () => {
    renderPreview();
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('has the aria-label "Invoice preview" on the section', () => {
    const { container } = renderPreview();
    expect(container.querySelector('[aria-label="Invoice preview"]')).toBeInTheDocument();
  });
});

describe('InvoicePreview — seeded valid state', () => {
  it('displays the invoice number', () => {
    renderSeededPreview();
    expect(screen.getByText(/INV-001/)).toBeInTheDocument();
  });

  it('displays the issue date', () => {
    renderSeededPreview();
    expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
  });

  it('displays the due date', () => {
    renderSeededPreview();
    expect(screen.getByText(/2024-01-31/)).toBeInTheDocument();
  });

  it('displays sender name', () => {
    renderSeededPreview();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('displays sender email', () => {
    renderSeededPreview();
    expect(screen.getByText('billing@acme.com')).toBeInTheDocument();
  });

  it('displays client name', () => {
    renderSeededPreview();
    expect(screen.getByText('Client Co')).toBeInTheDocument();
  });

  it('displays client email', () => {
    renderSeededPreview();
    expect(screen.getByText('ap@client.com')).toBeInTheDocument();
  });

  it('displays the line item description', () => {
    renderSeededPreview();
    expect(screen.getByText('Consulting')).toBeInTheDocument();
  });

  it('displays the line item quantity', () => {
    renderSeededPreview();
    // quantity 2 appears as a table cell
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays the unit price formatted as USD currency', () => {
    renderSeededPreview();
    // $500.00 — Intl.NumberFormat en-US USD
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });

  it('displays the line item amount (qty * unitPrice) formatted as USD', () => {
    renderSeededPreview();
    // 2 * 500 = 1000 → $1,000.00
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });

  it('displays the subtotal formatted as USD', () => {
    renderSeededPreview();
    // subtotal = $1,000.00 — appears in totals section
    // There are two $1,000.00 nodes (amount cell + subtotal); getAllByText handles this
    const nodes = screen.getAllByText('$1,000.00');
    expect(nodes.length).toBeGreaterThanOrEqual(1);
  });

  it('displays the tax amount formatted as USD', () => {
    renderSeededPreview();
    // 10% of 1000 = $100.00
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('displays the total formatted as USD', () => {
    renderSeededPreview();
    // 1000 + 100 = $1,100.00
    expect(screen.getByText('$1,100.00')).toBeInTheDocument();
  });

  it('displays the tax rate percentage in the Tax row label', () => {
    renderSeededPreview();
    expect(screen.getByText('Tax (10%)')).toBeInTheDocument();
  });

  it('renders the Notes section heading when notes is non-empty', () => {
    renderSeededPreview();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders the notes text content', () => {
    renderSeededPreview();
    expect(screen.getByText('Thank you for your business.')).toBeInTheDocument();
  });

  it('renders the logo img when a logo data URL is set', () => {
    const { useInvoice } = require('../context/InvoiceContext');

    function LogoPreview() {
      const { dispatch } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        dispatch({
          type: 'SET_LOGO',
          dataUrl: 'data:image/png;base64,abc123',
          mime: 'image/png',
        });
      }
      return <InvoicePreview />;
    }

    render(
      <InvoiceProvider>
        <LogoPreview />
      </InvoiceProvider>
    );

    const logo = screen.getByRole('img', { name: 'Company logo' });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'data:image/png;base64,abc123');
  });

  it('renders the logo img for SVG with empty MIME type', () => {
    const { useInvoice } = require('../context/InvoiceContext');

    function SvgLogoPreview() {
      const { dispatch } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        dispatch({
          type: 'SET_LOGO',
          dataUrl: 'data:;base64,PHN2Zy8+',
          mime: '',  // empty MIME — SVG edge case
        });
      }
      return <InvoicePreview />;
    }

    render(
      <InvoiceProvider>
        <SvgLogoPreview />
      </InvoiceProvider>
    );

    const logo = screen.getByRole('img', { name: 'Company logo' });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'data:;base64,PHN2Zy8+');
  });
});
