import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { InvoicePreview } from './InvoicePreview';
import { useInvoiceStore } from '../../store/invoiceStore';
import type { InvoiceState } from '../../types/invoice';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fully-populated mock state for snapshot and computed-value tests. */
const fullState: InvoiceState = {
  sender: {
    companyName: 'Acme Ltd',
    addressLine1: '1 High Street',
    addressLine2: 'Suite 4',
    city: 'London',
    postcode: 'EC1A 1BB',
    country: 'United Kingdom',
    phone: '+44 20 7946 0958',
    email: 'hello@acme.example',
  },
  client: {
    name: 'Globex Corp',
    addressLine1: '742 Evergreen Terrace',
    addressLine2: 'Floor 2',
    city: 'Springfield',
    postcode: 'SP1 2AB',
    country: 'United States',
  },
  meta: {
    invoiceNumber: 'INV-0042',
    issueDate: '2024-07-01',
    dueDate: '2024-07-31',
    taxRate: 20,
    currency: 'GBP',
    notes: 'Payment via bank transfer only.',
  },
  lineItems: [
    { id: '1', description: 'Consulting services', quantity: 3, unitPrice: 500 },
    { id: '2', description: 'Expenses', quantity: 1, unitPrice: 150 },
  ],
};

/** Resets the Zustand store to a known state before each test. */
function seedStore(state: InvoiceState): void {
  useInvoiceStore.setState(state);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InvoicePreview', () => {
  beforeEach(() => {
    seedStore(fullState);
  });

  // -------------------------------------------------------------------------
  // 1. Snapshot
  // -------------------------------------------------------------------------
  it('matches snapshot with fully-populated state', () => {
    const { container } = render(<InvoicePreview />);
    expect(container.firstChild).toMatchSnapshot();
  });

  // -------------------------------------------------------------------------
  // 2. Reactive invoice number — store change reflects without manual trigger
  // -------------------------------------------------------------------------
  it('reflects invoice number change in the store without manual refresh', () => {
    render(<InvoicePreview />);

    // Verify initial value
    expect(screen.getByText('INV-0042')).toBeInTheDocument();

    // Mutate the store directly — the component must re-render automatically
    useInvoiceStore.getState().setMeta({ invoiceNumber: 'INV-9999' });

    // React Testing Library re-queries the live DOM
    expect(screen.getByText('INV-9999')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 3. Optional fields absent from DOM when empty
  // -------------------------------------------------------------------------
  it('hides phone, notes, and addr2 when they are empty', () => {
    seedStore({
      ...fullState,
      sender: { ...fullState.sender, phone: '', addressLine2: '' },
      client: { ...fullState.client, addressLine2: '' },
      meta: { ...fullState.meta, notes: '' },
    });

    render(<InvoicePreview />);

    // Phone should not appear
    expect(screen.queryByText('+44 20 7946 0958')).not.toBeInTheDocument();

    // Notes section heading should not appear
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();

    // addr2 values should not appear
    expect(screen.queryByText('Suite 4')).not.toBeInTheDocument();
    expect(screen.queryByText('Floor 2')).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 4. Computed totals match expected values
  // -------------------------------------------------------------------------
  it('displays correct per-row totals and summary block values', () => {
    render(<InvoicePreview />);

    // Line item totals: 3×500=1500, 1×150=150
    // Subtotal: 1650, Tax 20%: 330, Grand total: 1980
    // GBP formatting via en-GB locale
    expect(screen.getByText('£1,500.00')).toBeInTheDocument();
    expect(screen.getByText('£150.00')).toBeInTheDocument();
    expect(screen.getByText('£1,650.00')).toBeInTheDocument(); // subtotal
    expect(screen.getByText('£330.00')).toBeInTheDocument();   // tax
    expect(screen.getByText('£1,980.00')).toBeInTheDocument(); // grand total
  });

  // -------------------------------------------------------------------------
  // 5. Empty line items — no crash, totals show £0.00
  // -------------------------------------------------------------------------
  it('renders table header only and shows £0.00 totals for empty line items', () => {
    seedStore({ ...fullState, lineItems: [] });
    render(<InvoicePreview />);

    // Table headers still present
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Qty')).toBeInTheDocument();

    // All totals are zero — there will be multiple £0.00 cells
    const zeroCells = screen.getAllByText('£0.00');
    expect(zeroCells.length).toBeGreaterThanOrEqual(3); // subtotal, tax, grand total
  });

  // -------------------------------------------------------------------------
  // 6. Tax rate 0 — tax row still renders
  // -------------------------------------------------------------------------
  it('renders the tax row even when taxRate is 0', () => {
    seedStore({ ...fullState, meta: { ...fullState.meta, taxRate: 0 } });
    render(<InvoicePreview />);

    expect(screen.getByText('Tax (0%)')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 7. Empty invoice number / dates → em-dash placeholder
  // -------------------------------------------------------------------------
  it('shows em-dash placeholders for empty invoice number and dates', () => {
    seedStore({
      ...fullState,
      meta: { ...fullState.meta, invoiceNumber: '', issueDate: '', dueDate: '' },
    });
    render(<InvoicePreview />);

    // Three em-dashes: invoice number, issue date, due date
    const dashes = screen.getAllByText('\u2014');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });

  // -------------------------------------------------------------------------
  // 8. Accessibility attributes on wrapper
  // -------------------------------------------------------------------------
  it('has correct aria attributes on the preview wrapper', () => {
    render(<InvoicePreview />);
    const region = screen.getByRole('region', { name: 'Invoice preview' });
    expect(region).toHaveAttribute('aria-live', 'polite');
  });
});
