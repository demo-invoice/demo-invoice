import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { NewInvoiceButton } from './NewInvoiceButton';

/**
 * Helper: renders NewInvoiceButton inside InvoiceProvider so the context
 * hook resolves correctly, then also renders a read-out of issueDate.
 */
import { useInvoice } from '../../context/InvoiceContext';

function IssueDateDisplay(): JSX.Element {
  const { state } = useInvoice();
  return <input data-testid="issue-date" readOnly value={state.issueDate} />;
}

function TestApp(): JSX.Element {
  return (
    <InvoiceProvider>
      <NewInvoiceButton />
      <IssueDateDisplay />
    </InvoiceProvider>
  );
}

afterEach(() => {
  cleanup();
});

describe('NewInvoiceButton', () => {
  it('renders the New Invoice button', () => {
    render(<TestApp />);
    expect(screen.getByRole('button', { name: /new invoice/i })).toBeInTheDocument();
  });

  it('shows confirmation dialog when clicked', () => {
    render(<TestApp />);
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('hides dialog on Cancel', () => {
    render(<TestApp />);
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  /**
   * AC 3b — REAL issueDate assertion.
   *
   * Clicks the New Invoice confirm button, reads the issueDate from the DOM
   * input value, and asserts it equals today's date in YYYY-MM-DD format.
   *
   * This test WILL fail if the reducer hard-codes issueDate to 1970-01-01
   * or any other static value, because makeDefaultState() is called at
   * dispatch time and must return new Date().toISOString().slice(0, 10).
   */
  it('AC 3b: issueDate equals today after clicking Confirm (real assertion)', () => {
    // Compute expected at test runtime — same tick as dispatch.
    const expectedDate = new Date().toISOString().slice(0, 10);

    render(<TestApp />);

    // Open confirmation dialog.
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));
    // Confirm — dispatches RESET_INVOICE which calls makeDefaultState().
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    const input = screen.getByTestId('issue-date') as HTMLInputElement;
    expect(input.value).toBe(expectedDate);
  });
});
