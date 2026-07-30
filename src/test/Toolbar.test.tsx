import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InvoiceProvider } from '../context/InvoiceContext';
import { Toolbar } from '../components/Toolbar';

function renderToolbar() {
  return render(
    <InvoiceProvider>
      <Toolbar />
    </InvoiceProvider>
  );
}

describe('Toolbar — Download PDF button', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the Download PDF button with correct aria-label', () => {
    renderToolbar();
    expect(
      screen.getByRole('button', { name: 'Download invoice as PDF' })
    ).toBeInTheDocument();
  });

  it('renders the toolbar title "Invoice App"', () => {
    renderToolbar();
    expect(screen.getByText('Invoice App')).toBeInTheDocument();
  });

  it('button initial label is "Download PDF"', () => {
    renderToolbar();
    expect(
      screen.getByRole('button', { name: 'Download invoice as PDF' })
    ).toHaveTextContent('Download PDF');
  });

  it('button is not disabled on initial render', () => {
    renderToolbar();
    expect(
      screen.getByRole('button', { name: 'Download invoice as PDF' })
    ).not.toBeDisabled();
  });

  // ── Validation failure path ────────────────────────────────────────────────

  it('shows a role="alert" error list when state is empty and button is clicked', () => {
    renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('error list contains at least one <li> on validation failure', () => {
    renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    const alert = screen.getByRole('alert');
    expect(alert.querySelectorAll('li').length).toBeGreaterThan(0);
  });

  it('shows "Invoice number is required." error when invoiceNumber is empty', () => {
    renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    expect(screen.getByText('Invoice number is required.')).toBeInTheDocument();
  });

  it('does NOT call window.print() when validation fails', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    expect(printSpy).not.toHaveBeenCalled();
  });

  it('does not render the error list before any click', () => {
    renderToolbar();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // ── window.print() called on valid state ──────────────────────────────────
  // We compose a valid state by rendering the full App and filling the form,
  // but that is an integration concern. Instead we test the print path by
  // rendering a pre-filled context via a custom wrapper.

  it('calls window.print() when state is valid', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);

    // Build a wrapper that seeds the context with a valid invoice state
    // by dispatching actions before rendering Toolbar.
    function ValidStateWrapper({ children }: { children: React.ReactNode }) {
      return <InvoiceProvider>{children}</InvoiceProvider>;
    }

    // We use a helper component that dispatches into context on mount.
    function SeedAndToolbar() {
      const { dispatch } = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        ? (() => { throw new Error('do not use internals'); })()
        : null;
      // ↑ That approach is wrong. Use a proper seeding component instead.
      return null;
    }
    // Discard the above — use the correct pattern:
    void SeedAndToolbar;

    // Correct approach: a component that dispatches on mount then renders Toolbar.
    const { useInvoice } = require('../context/InvoiceContext');

    function SeededToolbar() {
      const { dispatch } = useInvoice();
      React.useEffect(() => {
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Acme Corp' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'billing@acme.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Client Co' });
        dispatch({
          type: 'UPDATE_LINE_ITEM',
          id: '',  // will be replaced below
          field: 'description',
          value: 'Consulting',
        });
      }, []);
      return <Toolbar />;
    }

    // The line item id is dynamic; use ADD_LINE_ITEM + UPDATE_LINE_ITEM approach
    // via a more controlled seeding component.
    function FullySeededToolbar() {
      const { dispatch, state } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Acme Corp' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'billing@acme.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Client Co' });
        // Seed the first (default) line item that already exists in initial state
        const firstId = state.lineItems[0]?.id;
        if (firstId) {
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'description', value: 'Consulting' });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'quantity', value: 2 });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'unitPrice', value: 500 });
        }
      }
      return <Toolbar />;
    }

    render(
      <InvoiceProvider>
        <FullySeededToolbar />
      </InvoiceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  // ── document.title manipulation ────────────────────────────────────────────

  it('sets document.title to Invoice-{invoiceNumber} before calling window.print()', () => {
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const { useInvoice } = require('../context/InvoiceContext');

    function SeededToolbar() {
      const { dispatch, state } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-042' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Sender' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'a@b.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Client' });
        const firstId = state.lineItems[0]?.id;
        if (firstId) {
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'description', value: 'Work' });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'quantity', value: 1 });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'unitPrice', value: 100 });
        }
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

    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    expect(titleDuringPrint).toBe('Invoice-INV-042');
  });

  it('restores document.title after the 500ms timeout', () => {
    const originalTitle = 'Invoice App';
    document.title = originalTitle;
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const { useInvoice } = require('../context/InvoiceContext');

    function SeededToolbar() {
      const { dispatch, state } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Sender' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'a@b.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Client' });
        const firstId = state.lineItems[0]?.id;
        if (firstId) {
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'description', value: 'Work' });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'quantity', value: 1 });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'unitPrice', value: 100 });
        }
      }
      return <Toolbar />;
    }

    render(
      <InvoiceProvider>
        <SeededToolbar />
      </InvoiceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    // Title is changed during print
    expect(document.title).toBe('Invoice-INV-001');
    // After 500ms timeout it should be restored
    act(() => { vi.advanceTimersByTime(500); });
    expect(document.title).toBe(originalTitle);
  });

  // ── Fallback title when invoiceNumber is empty ─────────────────────────────
  // (Cannot easily test this without a valid state — the validation guard fires
  //  first when invoiceNumber is empty, so this edge case is covered by the
  //  validation-failure tests above which confirm print is NOT called.)

  // ── isPrinting / button disabled state ────────────────────────────────────

  it('button shows "Preparing\u2026" and is disabled while isPrinting is true', () => {
    // window.print is synchronous; isPrinting is set to true just before it
    // and reset after the 500ms timeout. We capture the DOM state inside print.
    const { useInvoice } = require('../context/InvoiceContext');
    let buttonTextDuringPrint = '';
    let buttonDisabledDuringPrint: boolean | null = null;

    vi.spyOn(window, 'print').mockImplementation(() => {
      const btn = document.querySelector('button[aria-label="Download invoice as PDF"]');
      buttonTextDuringPrint = btn?.textContent ?? '';
      buttonDisabledDuringPrint = (btn as HTMLButtonElement)?.disabled ?? null;
    });

    function SeededToolbar() {
      const { dispatch, state } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Sender' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'a@b.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Client' });
        const firstId = state.lineItems[0]?.id;
        if (firstId) {
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'description', value: 'Work' });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'quantity', value: 1 });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'unitPrice', value: 100 });
        }
      }
      return <Toolbar />;
    }

    render(
      <InvoiceProvider>
        <SeededToolbar />
      </InvoiceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    expect(buttonTextDuringPrint).toBe('Preparing\u2026');
    expect(buttonDisabledDuringPrint).toBe(true);
  });

  it('button is re-enabled and label restored after 500ms timeout', () => {
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const { useInvoice } = require('../context/InvoiceContext');

    function SeededToolbar() {
      const { dispatch, state } = useInvoice();
      const seeded = React.useRef(false);
      if (!seeded.current) {
        seeded.current = true;
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Sender' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'a@b.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Client' });
        const firstId = state.lineItems[0]?.id;
        if (firstId) {
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'description', value: 'Work' });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'quantity', value: 1 });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'unitPrice', value: 100 });
        }
      }
      return <Toolbar />;
    }

    render(
      <InvoiceProvider>
        <SeededToolbar />
      </InvoiceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    act(() => { vi.advanceTimersByTime(500); });

    const btn = screen.getByRole('button', { name: 'Download invoice as PDF' });
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveTextContent('Download PDF');
  });

  // ── Error list cleared on successful validation ────────────────────────────

  it('clears previous validation errors when a valid click follows an invalid one', () => {
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const { useInvoice } = require('../context/InvoiceContext');

    function ToggleToolbar() {
      const { dispatch, state } = useInvoice();
      function seedValid() {
        dispatch({ type: 'UPDATE_FIELD', field: 'invoiceNumber', value: 'INV-001' });
        dispatch({ type: 'UPDATE_SENDER', field: 'name', value: 'Sender' });
        dispatch({ type: 'UPDATE_SENDER', field: 'email', value: 'a@b.com' });
        dispatch({ type: 'UPDATE_CLIENT', field: 'name', value: 'Client' });
        const firstId = state.lineItems[0]?.id;
        if (firstId) {
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'description', value: 'Work' });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'quantity', value: 1 });
          dispatch({ type: 'UPDATE_LINE_ITEM', id: firstId, field: 'unitPrice', value: 100 });
        }
      }
      return (
        <>
          <button onClick={seedValid} data-testid="seed">Seed</button>
          <Toolbar />
        </>
      );
    }

    render(
      <InvoiceProvider>
        <ToggleToolbar />
      </InvoiceProvider>
    );

    // First click — invalid state → errors shown
    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Seed valid state
    fireEvent.click(screen.getByTestId('seed'));

    // Second click — valid state → errors cleared
    fireEvent.click(screen.getByRole('button', { name: 'Download invoice as PDF' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
