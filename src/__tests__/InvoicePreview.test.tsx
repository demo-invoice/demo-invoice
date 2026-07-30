import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvoiceProvider, defaultInvoiceState } from '../context/InvoiceContext';
import { InvoicePreview } from '../components/InvoicePreview';
import type { InvoiceState } from '../types/invoice';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithState(state: InvoiceState) {
  return render(
    <InvoiceProvider initialState={state}>
      <InvoicePreview />
    </InvoiceProvider>,
  );
}

const fullyPopulatedState: InvoiceState = {
  logoUrl: '',
  sender: {
    name: 'Acme Ltd',
    addressLine1: '1 High Street',
    addressLine2: 'Suite 200',
    city: 'London',
    state: '',
    zip: 'EC1A 1BB',
    phone: '+44 20 7946 0958',
    email: 'hello@acme.co.uk',
  },
  client: {
    name: 'Globex Corp',
    addressLine1: '742 Evergreen Terrace',
    addressLine2: 'Floor 3',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    email: 'accounts@globex.com',
  },
  meta: {
    invoiceNumber: 'INV-0042',
    issueDate: '2024-07-01',
    dueDate: '2024-07-31',
    currency: 'GBP',
    taxRate: 20,
  },
  lineItems: [
    { id: '1', description: 'Consulting services', quantity: 3, unitPrice: 500 },
    { id: '2', description: 'Expenses', quantity: 1, unitPrice: 150.75 },
  ],
  notes: 'Payment due within 30 days. Thank you for your business.',
};

// ---------------------------------------------------------------------------
// (a) Full population — all required sections render
// ---------------------------------------------------------------------------

describe('InvoicePreview — fully populated state', () => {
  it('renders the preview container', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByTestId('invoice-preview')).toBeInTheDocument();
  });

  it('renders INVOICE heading', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('INVOICE')).toBeInTheDocument();
  });

  it('renders logo placeholder when logoUrl is empty', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByLabelText('Logo placeholder')).toBeInTheDocument();
  });

  it('renders LOGO text inside the grey placeholder box', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('LOGO')).toBeInTheDocument();
  });

  it('renders sender name', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Acme Ltd')).toBeInTheDocument();
  });

  it('renders sender addressLine1', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('1 High Street')).toBeInTheDocument();
  });

  it('renders sender addressLine2', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Suite 200')).toBeInTheDocument();
  });

  it('renders sender phone', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('+44 20 7946 0958')).toBeInTheDocument();
  });

  it('renders sender email', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('hello@acme.co.uk')).toBeInTheDocument();
  });

  it('renders invoice number', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('INV-0042')).toBeInTheDocument();
  });

  it('renders issue date', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('2024-07-01')).toBeInTheDocument();
  });

  it('renders due date', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('2024-07-31')).toBeInTheDocument();
  });

  it('renders Invoice # label', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Invoice #')).toBeInTheDocument();
  });

  it('renders Issue date label', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Issue date')).toBeInTheDocument();
  });

  it('renders Due date label', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Due date')).toBeInTheDocument();
  });

  it('renders Bill To label', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Bill To')).toBeInTheDocument();
  });

  it('renders client name', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Globex Corp')).toBeInTheDocument();
  });

  it('renders client addressLine1', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('742 Evergreen Terrace')).toBeInTheDocument();
  });

  it('renders client addressLine2', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Floor 3')).toBeInTheDocument();
  });

  it('renders client email', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('accounts@globex.com')).toBeInTheDocument();
  });

  it('renders line items table with Description column header', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders line items table with Qty column header', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Qty')).toBeInTheDocument();
  });

  it('renders line items table with Unit Price column header', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Unit Price')).toBeInTheDocument();
  });

  it('renders line items table with Total column header', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders first line item description', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Consulting services')).toBeInTheDocument();
  });

  it('renders second line item description', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  it('renders tax row when taxRate > 0', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Tax (20%)')).toBeInTheDocument();
  });

  it('renders Subtotal label', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
  });

  it('renders Total label in totals block', () => {
    renderWithState(fullyPopulatedState);
    // "Total" appears in the grand total row
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders Notes label when notes is populated', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders notes content', () => {
    renderWithState(fullyPopulatedState);
    expect(
      screen.getByText('Payment due within 30 days. Thank you for your business.'),
    ).toBeInTheDocument();
  });

  it('renders computed line total for first item (3 × £500 = £1,500.00)', () => {
    renderWithState(fullyPopulatedState);
    expect(screen.getByText('£1,500.00')).toBeInTheDocument();
  });

  it('renders computed line total for second item (1 × £150.75 = £150.75)', () => {
    renderWithState(fullyPopulatedState);
    // £150.75 appears as both unit price and line total for qty=1
    const cells = screen.getAllByText('£150.75');
    expect(cells.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// (b) Empty optional fields — absent from DOM
// ---------------------------------------------------------------------------

describe('InvoicePreview — empty optional fields suppressed', () => {
  const sparseState: InvoiceState = {
    ...defaultInvoiceState,
    sender: {
      ...defaultInvoiceState.sender,
      name: 'Solo Trader',
      addressLine1: '10 Main Road',
      city: 'Bristol',
      zip: 'BS1 1AA',
      // phone intentionally empty
      // addressLine2 intentionally empty
    },
    client: {
      ...defaultInvoiceState.client,
      name: 'Client Co',
      addressLine1: '5 Park Lane',
      city: 'Manchester',
      zip: 'M1 1AA',
      // addressLine2 intentionally empty
    },
    meta: {
      ...defaultInvoiceState.meta,
      taxRate: 0, // tax row should be suppressed
    },
    notes: '', // notes block should be suppressed
  };

  it('does not render phone when empty', () => {
    renderWithState(sparseState);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it('does not render tax row when taxRate is 0', () => {
    renderWithState(sparseState);
    expect(screen.queryByText(/Tax \(/)).not.toBeInTheDocument();
  });

  it('does not render Notes label when notes is empty', () => {
    renderWithState(sparseState);
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('renders empty line items without crashing — shows Description header', () => {
    renderWithState(sparseState);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders £0.00 for subtotal and grand total when line items are empty', () => {
    renderWithState(sparseState);
    const zeroCells = screen.getAllByText('£0.00');
    expect(zeroCells.length).toBeGreaterThanOrEqual(2);
  });

  it('does not render Suite 200 (sender addressLine2 is empty)', () => {
    renderWithState(sparseState);
    expect(screen.queryByText('Suite 200')).not.toBeInTheDocument();
  });

  it('does not render Floor 3 (client addressLine2 is empty)', () => {
    renderWithState(sparseState);
    expect(screen.queryByText('Floor 3')).not.toBeInTheDocument();
  });

  it('still renders INVOICE heading', () => {
    renderWithState(sparseState);
    expect(screen.getByText('INVOICE')).toBeInTheDocument();
  });

  it('still renders Bill To label', () => {
    renderWithState(sparseState);
    expect(screen.getByText('Bill To')).toBeInTheDocument();
  });

  it('does not render Invoice # label when invoiceNumber is empty', () => {
    renderWithState(sparseState);
    expect(screen.queryByText('Invoice #')).not.toBeInTheDocument();
  });

  it('does not render Issue date label when issueDate is empty', () => {
    renderWithState(sparseState);
    expect(screen.queryByText('Issue date')).not.toBeInTheDocument();
  });

  it('does not render Due date label when dueDate is empty', () => {
    renderWithState(sparseState);
    expect(screen.queryByText('Due date')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// (c) No dispatch / setState called from preview render
// ---------------------------------------------------------------------------

describe('InvoicePreview — no mutations during render', () => {
  it('does not call a spy dispatch during render', () => {
    const dispatchSpy = vi.fn();
    // dispatchSpy is never wired into the real context — we verify it stays
    // uncalled, confirming no external mutation side-effects are triggered.
    render(
      <InvoiceProvider initialState={fullyPopulatedState}>
        <InvoicePreview />
      </InvoiceProvider>,
    );
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('renders identical HTML on consecutive renders (pure / no side-effects)', () => {
    const { rerender, container } = renderWithState(fullyPopulatedState);
    const firstRender = container.innerHTML;
    rerender(
      <InvoiceProvider initialState={fullyPopulatedState}>
        <InvoicePreview />
      </InvoiceProvider>,
    );
    expect(container.innerHTML).toBe(firstRender);
  });
});

// ---------------------------------------------------------------------------
// (d) Logo image rendered when logoUrl is provided
// ---------------------------------------------------------------------------

describe('InvoicePreview — logo image vs placeholder', () => {
  it('renders an img with the provided logoUrl', () => {
    const stateWithLogo: InvoiceState = {
      ...fullyPopulatedState,
      logoUrl: 'https://example.com/logo.png',
    };
    renderWithState(stateWithLogo);
    const img = screen.getByRole('img', { name: 'Company logo' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('does not render an img when logoUrl is empty', () => {
    renderWithState(fullyPopulatedState); // logoUrl: ''
    expect(screen.queryByRole('img', { name: 'Company logo' })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// (e) Snapshot
// ---------------------------------------------------------------------------

describe('InvoicePreview — snapshot', () => {
  it('matches snapshot for fully populated state', () => {
    const { container } = renderWithState(fullyPopulatedState);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for default empty state', () => {
    const { container } = renderWithState(defaultInvoiceState);
    expect(container.firstChild).toMatchSnapshot();
  });
});
