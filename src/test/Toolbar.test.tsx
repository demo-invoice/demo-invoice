import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toolbar } from '../components/Toolbar';
import { InvoiceProvider } from '../context/InvoiceContext';
import { useInvoice } from '../context/InvoiceContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Renders Toolbar inside a real InvoiceProvider. */
function renderToolbar() {
  return render(
    <InvoiceProvider>
      <Toolbar />
    </InvoiceProvider>
  );
}

/** Seed component — dispatches actions on mount to populate state, then renders Toolbar. */
function SeededToolbar({
  invoiceNumber = 'INV-001',
}: {
  invoiceNumber?: string;
}) {
  const { dispatch } = useInvoice();
  React.useEffect(() => {
    dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: invoiceNumber });
    dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Alice' });
    dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'alice@example.com' });
    dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Bob' });
    dispatch({
      type: 'UPDATE_LINE_ITEM',
      id: '__SEED__',
      field: 'description',
      value: 'Consulting',
    });
  }, []);
  return <Toolbar />;
}

/** Renders SeededToolbar inside a real InvoiceProvider, but we need to seed
 *  the first line item id. We do this by rendering a wrapper that reads the
 *  real initial line item id and dispatches against it. */
function renderSeededToolbar(invoiceNumber = 'INV-001') {
  // We need to capture the initial line item id from context.
  // Use a wrapper component that reads state first.
  function Wrapper() {
    const { state, dispatch } = useInvoice();
    const seeded = React.useRef(false);
    if (!seeded.current) {
      seeded.current = true;
      const lineItemId = state.lineItems[0].id;
      dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: invoiceNumber });
      dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Alice' });
      dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'alice@example.com' });
      dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Bob' });
      dispatch({
        type: 'UPDATE_LINE_ITEM',
        id: lineItemId,
        field: 'description',
        value: 'Consulting',
      });
      dispatch({
        type: 'UPDATE_LINE_ITEM',
        id: lineItemId,
        field: 'quantity',
        value: 1,
      });
      dispatch({
        type: 'UPDATE_LINE_ITEM',
        id: lineItemId,
        field: 'unitPrice',
        value: 100,
      });
    }
    return <Toolbar />;
  }

  return render(
    <InvoiceProvider>
      <Wrapper />
    </InvoiceProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests — Download PDF button (not present)
// ---------------------------------------------------------------------------

describe('Toolbar — Download PDF button', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders a "Download PDF" button', () => {
    renderToolbar();
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Validation — invalid state
  // -------------------------------------------------------------------------

  it('shows validation errors and does NOT call window.print() when state is invalid', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderToolbar(); // empty state — invalid

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    expect(printSpy).not.toHaveBeenCalled();
    // At least one error message should be visible.
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays the invoice-number validation error message', () => {
    renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(screen.getByText(/invoice number is required/i)).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Valid state — window.print() is called
  // -------------------------------------------------------------------------

  it('calls window.print() when state is valid', () => {
    vi.spyOn(window, 'print').mockImplementation(() => undefined);

    function SeededToolbar() {
      const { state, dispatch } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        const lineItemId = state.lineItems[0].id;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Alice' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'alice@example.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Bob' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'description', value: 'Consulting' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'quantity', value: 1 });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'unitPrice', value: 100 });
      }
      return <Toolbar />;
    }

    render(
      <InvoiceProvider>
        <SeededToolbar />
      </InvoiceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // document.title is set to Invoice-{invoiceNumber}
  // -------------------------------------------------------------------------

  it('sets document.title to Invoice-{invoiceNumber} before calling window.print()', () => {
    vi.spyOn(window, 'print').mockImplementation(() => undefined);

    function SeededToolbar() {
      const { state, dispatch } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        const lineItemId = state.lineItems[0].id;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-042' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Alice' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'alice@example.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Bob' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'description', value: 'Consulting' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'quantity', value: 1 });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'unitPrice', value: 100 });
      }
      return <Toolbar />;
    }

    let titleDuringPrint = '';
    vi.spyOn(window, 'print').mockImplementation(() => {
      titleDuringPrint = document.title;
    });

    render(
      <InvoiceProvider>
        <SeededToolbar />
      </InvoiceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(titleDuringPrint).toBe('Invoice-INV-042');
  });

  // -------------------------------------------------------------------------
  // document.title is restored after 500 ms
  // -------------------------------------------------------------------------

  it('restores document.title after the 500ms timeout', () => {
    const originalTitle = document.title;
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
    vi.useFakeTimers();

    function SeededToolbar() {
      const { state, dispatch } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        const lineItemId = state.lineItems[0].id;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Alice' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'alice@example.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Bob' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'description', value: 'Consulting' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'quantity', value: 1 });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'unitPrice', value: 100 });
      }
      return <Toolbar />;
    }

    render(
      <InvoiceProvider>
        <SeededToolbar />
      </InvoiceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(document.title).toBe('Invoice-INV-001');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(document.title).toBe(originalTitle);
  });

  // -------------------------------------------------------------------------
  // isPrinting state — button label and disabled
  // -------------------------------------------------------------------------

  it('button shows "Preparing…" and is disabled while isPrinting is true', () => {
    // window.print is synchronous; isPrinting is set to true just before print
    // and reset after the 500ms timeout. We capture the DOM state inside print.
    let buttonTextDuringPrint = '';
    let buttonDisabledDuringPrint: boolean | null = null;

    function SeededToolbar() {
      const { state, dispatch } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        const lineItemId = state.lineItems[0].id;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Alice' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'alice@example.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Bob' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'description', value: 'Consulting' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'quantity', value: 1 });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'unitPrice', value: 100 });
      }
      return <Toolbar />;
    }

    vi.spyOn(window, 'print').mockImplementation(() => {
      const btn = document.querySelector('.download-btn') as HTMLButtonElement | null;
      if (btn) {
        buttonTextDuringPrint = btn.textContent ?? '';
        buttonDisabledDuringPrint = btn.disabled;
      }
    });

    render(
      <InvoiceProvider>
        <SeededToolbar />
      </InvoiceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(buttonTextDuringPrint).toMatch(/preparing/i);
    expect(buttonDisabledDuringPrint).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Button re-enabled after timeout
  // -------------------------------------------------------------------------

  it('button is re-enabled and label restored after 500ms timeout', () => {
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
    vi.useFakeTimers();

    function SeededToolbar() {
      const { state, dispatch } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        const lineItemId = state.lineItems[0].id;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Alice' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'alice@example.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Bob' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'description', value: 'Consulting' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'quantity', value: 1 });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'unitPrice', value: 100 });
      }
      return <Toolbar />;
    }

    render(
      <InvoiceProvider>
        <SeededToolbar />
      </InvoiceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const btn = screen.getByRole('button', { name: /download pdf/i });
    expect(btn).not.toBeDisabled();
    expect(btn.textContent).toMatch(/download pdf/i);
  });

  // -------------------------------------------------------------------------
  // Errors cleared on subsequent valid click
  // -------------------------------------------------------------------------

  it('clears previous validation errors when a valid click follows an invalid one', () => {
    vi.spyOn(window, 'print').mockImplementation(() => undefined);

    function ToggleToolbar() {
      const { state, dispatch } = useInvoice();
      const [seeded, setSeeded] = React.useState(false);

      function seed() {
        const lineItemId = state.lineItems[0].id;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Alice' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'alice@example.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Bob' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'description', value: 'Consulting' });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'quantity', value: 1 });
        dispatch({ type: 'UPDATE_LINE_ITEM', id: lineItemId, field: 'unitPrice', value: 100 });
        setSeeded(true);
      }

      return (
        <div>
          {!seeded && (
            <button onClick={seed} data-testid="seed-btn">
              Seed
            </button>
          )}
          <Toolbar />
        </div>
      );
    }

    render(
      <InvoiceProvider>
        <ToggleToolbar />
      </InvoiceProvider>
    );

    // First click — invalid state → errors shown
    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Seed valid state
    fireEvent.click(screen.getByTestId('seed-btn'));

    // Second click — valid state → errors cleared, print called
    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
