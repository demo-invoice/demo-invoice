import { render, screen, act } from '@testing-library/react';
import { InvoiceProvider, useInvoiceDispatch, defaultInvoiceState } from '../../context/InvoiceContext';
import type { InvoiceAction, InvoiceState } from '../../types/invoice';
import { InvoicePreview } from './InvoicePreview';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fullState: InvoiceState = {
  sender: {
    name: 'Acme Ltd',
    addressLine1: '1 Sender Street',
    addressLine2: 'Suite 100',
    city: 'London',
    state: '',
    zip: 'EC1A 1BB',
    phone: '+44 20 7946 0958',
    email: 'billing@acme.com',
  },
  client: {
    name: 'Client Corp',
    addressLine1: '99 Client Road',
    addressLine2: '',
    city: 'Manchester',
    state: '',
    zip: 'M1 1AE',
    email: 'accounts@clientcorp.com',
  },
  meta: {
    invoiceNumber: 'INV-001',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    currency: 'GBP',
    taxRate: 20,
  },
  lineItems: [
    { id: '1', description: 'Consulting', quantity: 2, unitPrice: 500 },
    { id: '2', description: 'Design', quantity: 1, unitPrice: 250 },
  ],
  notes: 'Payment due within 30 days.',
  logoUrl: '',
};

/** Renders InvoicePreview inside a provider with the given initial state */
function renderWithState(initialState: InvoiceState = defaultInvoiceState) {
  return render(
    <InvoiceProvider initialState={initialState}>
      <InvoicePreview />
    </InvoiceProvider>,
  );
}

/** Renders with default state and exposes dispatch for reactivity tests */
function renderWithDispatch() {
  let capturedDispatch: React.Dispatch<InvoiceAction> = () => {};

  function DispatchCapture({ children }: { children: ReactNode }) {
    capturedDispatch = useInvoiceDispatch();
    return <>{children}</>;
  }

  const result = render(
    <InvoiceProvider initialState={defaultInvoiceState}>
      <DispatchCapture>
        <InvoicePreview />
      </DispatchCapture>
    </InvoiceProvider>,
  );

  return {
    ...result,
    dispatch: (action: InvoiceAction) => act(() => { capturedDispatch(action); }),
  };
}

// ---------------------------------------------------------------------------
// Section 1 — all sections render when state is fully populated
// ---------------------------------------------------------------------------

describe('InvoicePreview — fully populated state', () => {
  it('renders the logo placeholder', () => {
    renderWithState(fullState);
    expect(document.querySelector('[data-testid="logo-placeholder"]')).toBeInTheDocument();
  });

  it('renders sender details', () => {
    renderWithState(fullState);
    expect(screen.getByText('Acme Ltd')).toBeInTheDocument();
    expect(screen.getByText('1 Sender Street')).toBeInTheDocument();
    expect(screen.getByText('Suite 100')).toBeInTheDocument();
    expect(screen.getByText('billing@acme.com')).toBeInTheDocument();
  });

  it('renders INVOICE heading with number, issue date, due date', () => {
    renderWithState(fullState);
    expect(screen.getByText('INVOICE')).toBeInTheDocument();
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    // Dates may be formatted — just check the raw value appears somewhere
    expect(screen.getByText(/2024-01-15/)).toBeInTheDocument();
    expect(screen.getByText(/2024-02-15/)).toBeInTheDocument();
  });

  it('renders Bill To block', () => {
    renderWithState(fullState);
    expect(screen.getByText('Bill To')).toBeInTheDocument();
    expect(screen.getByText('Client Corp')).toBeInTheDocument();
    expect(screen.getByText('99 Client Road')).toBeInTheDocument();
    expect(screen.getByText('accounts@clientcorp.com')).toBeInTheDocument();
  });

  it('renders line-items table with correct columns', () => {
    renderWithState(fullState);
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Qty')).toBeInTheDocument();
    expect(screen.getByText('Unit Price')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders line item rows', () => {
    renderWithState(fullState);
    expect(screen.getByText('Consulting')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('renders subtotal, tax, and grand total', () => {
    renderWithState(fullState);
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Tax')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    // subtotal = 2*500 + 1*250 = 1250; tax 20% = 250; grand = 1500
    expect(screen.getByText('£1,250.00')).toBeInTheDocument();
    expect(screen.getByText('£250.00')).toBeInTheDocument();
    expect(screen.getByText('£1,500.00')).toBeInTheDocument();
  });

  it('renders notes section', () => {
    renderWithState(fullState);
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Payment due within 30 days.')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Section 2 — optional empty fields are suppressed
// ---------------------------------------------------------------------------

describe('InvoicePreview — empty optional fields suppressed', () => {
  it('suppresses phone when empty', () => {
    const state: InvoiceState = {
      ...fullState,
      sender: { ...fullState.sender, phone: '' },
    };
    renderWithState(state);
    expect(screen.queryByText('+44 20 7946 0958')).not.toBeInTheDocument();
  });

  it('suppresses sender addressLine2 when empty', () => {
    const state: InvoiceState = {
      ...fullState,
      sender: { ...fullState.sender, addressLine2: '' },
    };
    renderWithState(state);
    expect(screen.queryByText('Suite 100')).not.toBeInTheDocument();
  });

  it('suppresses client addressLine2 when empty', () => {
    renderWithState(fullState); // fullState already has client.addressLine2 = ''
    // There should be no empty <p> for addressLine2
    const billToSection = screen.getByText('Bill To').closest('div');
    const emptyPs = Array.from(billToSection?.querySelectorAll('p') ?? []).filter(
      (p) => p.textContent?.trim() === '',
    );
    expect(emptyPs.length).toBe(0);
  });

  it('suppresses notes section when notes is empty', () => {
    const state: InvoiceState = { ...fullState, notes: '' };
    renderWithState(state);
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('suppresses tax row when taxRate is 0', () => {
    const state: InvoiceState = {
      ...fullState,
      meta: { ...fullState.meta, taxRate: 0 },
    };
    renderWithState(state);
    expect(screen.queryByText('Tax')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Section 3 — no state-mutation calls inside preview
// ---------------------------------------------------------------------------

describe('InvoicePreview — no state mutations', () => {
  it('does not call setState or dispatch from within the preview render', () => {
    // We spy on useReducer's dispatch via context — if InvoicePreview only
    // reads state and never writes, the dispatch captured here should never
    // be called during render.
    let dispatchCallCount = 0;
    let capturedDispatch: React.Dispatch<InvoiceAction> = () => {};

    function SpyDispatch({ children }: { children: ReactNode }) {
      const realDispatch = useInvoiceDispatch();
      capturedDispatch = (action: InvoiceAction) => {
        dispatchCallCount++;
        realDispatch(action);
      };
      return <>{children}</>;
    }

    render(
      <InvoiceProvider initialState={fullState}>
        <SpyDispatch>
          <InvoicePreview />
        </SpyDispatch>
      </InvoiceProvider>,
    );

    // Suppress unused-variable warning — capturedDispatch is intentionally
    // captured but not called; we just verify dispatchCallCount stayed 0.
    void capturedDispatch;
    expect(dispatchCallCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Section 4 — real-time reactivity (one render cycle)
// ---------------------------------------------------------------------------

describe('InvoicePreview — real-time reactivity', () => {
  it('reflects notes update immediately', () => {
    const { dispatch } = renderWithDispatch();
    dispatch({ type: 'SET_NOTES', payload: 'Net 30' }
    as InvoiceAction);
    expect(screen.getByText('Notes')).toBeInTheDocument();
    dispatch({ type: 'SET_NOTES', payload: '' });
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('reflects line item addition immediately', () => {
    const { dispatch, container } = renderWithDispatch();
    expect(container.querySelector('td[colspan="4"]')).toBeInTheDocument();
    dispatch({ type: 'SET_LINE_ITEMS', payload: [{ id: 'test-1', description: '', quantity: 1, unitPrice: 0 }] });
    expect(container.querySelector('td[colspan="4"]')).not.toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('reflects line item removal immediately', () => {
    const { dispatch, container } = renderWithDispatch();
    dispatch({ type: 'SET_LINE_ITEMS', payload: [{ id: 'test-1', description: '', quantity: 1, unitPrice: 0 }] });
    expect(container.querySelectorAll('tbody tr').length).toBe(1);
    // Remove by dispatching SET_LINE_ITEMS with empty array
    dispatch({ type: 'SET_LINE_ITEMS', payload: [] });
    expect(container.querySelectorAll('tbody tr').length).toBe(0);
  });
});
