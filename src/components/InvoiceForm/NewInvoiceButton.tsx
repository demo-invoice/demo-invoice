import React from 'react';
import { useInvoiceDispatch } from '../../context/InvoiceContext';
import { clearInvoiceState } from '../../context/invoiceStorage';

/**
 * "New Invoice" button.
 * Clears localStorage directly before dispatch so storage is wiped even if
 * the persistence useEffect guard fires with a stale closure.
 */
export function NewInvoiceButton(): React.JSX.Element {
  const dispatch = useInvoiceDispatch();

  function handleClick(): void {
    // Use native confirm — not blocked by popup blockers (it's synchronous/modal).
    const confirmed = window.confirm(
      'Start a new invoice? All current data will be cleared.',
    );
    if (!confirmed) return;

    // Belt-and-suspenders: clear storage before dispatch.
    clearInvoiceState();
    dispatch({ type: 'RESET_INVOICE' });
  }

  return (
    <button type="button" className="btn-danger" onClick={handleClick}>
      New Invoice
    </button>
  );
}
