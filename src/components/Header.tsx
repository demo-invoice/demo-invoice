import { INVOICE_STORAGE_KEY } from '../constants/invoice';
import { useInvoice } from '../context/InvoiceContext';

/**
 * Application header.
 * Contains the "New Invoice" button which prompts the user for confirmation
 * before clearing all invoice data and removing the localStorage entry.
 */
export function Header() {
  const { dispatch } = useInvoice();

  /**
   * Handles the New Invoice button click.
   * 1. Shows a native confirm dialog.
   * 2. On OK: removes the localStorage key, then dispatches RESET_INVOICE.
   * 3. On Cancel: no side effects.
   */
  function handleNewInvoice() {
    const confirmed = window.confirm(
      'Start a new invoice? All current data will be cleared.',
    );
    if (!confirmed) return;

    localStorage.removeItem(INVOICE_STORAGE_KEY);
    dispatch({ type: 'RESET_INVOICE' });
  }

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Invoice App</h1>
      <button
        type="button"
        onClick={handleNewInvoice}
        style={styles.button}
        aria-label="Start a new invoice"
      >
        New Invoice
      </button>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    background: '#1e293b',
    color: '#f8fafc',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  button: {
    padding: '0.5rem 1rem',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
} as const;
