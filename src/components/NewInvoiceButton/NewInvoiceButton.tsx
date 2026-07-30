/**
 * NewInvoiceButton
 *
 * Resets the invoice to a blank state.  The reset flow works as follows:
 *
 * 1. User clicks the button.
 * 2. `dispatch({ type: 'RESET_INVOICE' })` is called — a typed action union
 *    member, never a raw string literal.
 * 3. The reducer calls `makeDefaultState()` at dispatch time, so the new
 *    Issue Date reflects the current date (not the date the app was loaded).
 * 4. The persistence useEffect in InvoiceContext detects `_lastAction ===
 *    'RESET_INVOICE'`, calls `localStorage.removeItem(INVOICE_STORAGE_KEY)`,
 *    and returns early — it does NOT call setItem, so the blank invoice is
 *    never re-persisted.
 *
 * This component does NOT touch localStorage directly.
 */

import { useInvoiceDispatch } from '../../context/InvoiceContext';

export function NewInvoiceButton() {
  const dispatch = useInvoiceDispatch();

  function handleClick() {
    // Typed action — no raw string literals.
    dispatch({ type: 'RESET_INVOICE' });
  }

  return (
    <button type="button" onClick={handleClick}>
      New Invoice
    </button>
  );
}
