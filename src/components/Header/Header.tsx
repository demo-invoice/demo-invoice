import { useInvoice } from '../../context/InvoiceContext';
import { INVOICE_STORAGE_KEY } from '../../context/InvoiceContext';
import './Header.css';

/**
 * App header containing the title and the New Invoice action button.
 * Prompts the user for confirmation before clearing all invoice data.
 */
export function Header() {
  const { dispatch } = useInvoice();

  function handleNewInvoice() {
    const confirmed = window.confirm(
      'This will clear all current invoice data. Are you sure?',
    );
    if (!confirmed) return;

    localStorage.removeItem(INVOICE_STORAGE_KEY);
    dispatch({ type: 'RESET_INVOICE' });
  }

  return (
    <header className="app-header">
      <h1 className="app-header__title">Demo Invoice</h1>
      <button
        type="button"
        className="app-header__new-btn"
        aria-label="Start a new invoice"
        onClick={handleNewInvoice}
      >
        New Invoice
      </button>
    </header>
  );
}
