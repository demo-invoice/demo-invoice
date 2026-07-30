import { useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext';

/**
 * Button that resets the current invoice to a fresh default state.
 * Shows a confirmation dialog before dispatching RESET_INVOICE.
 */
export function NewInvoiceButton(): JSX.Element {
  const { dispatch } = useInvoice();
  const [confirming, setConfirming] = useState(false);

  function handleClick(): void {
    setConfirming(true);
  }

  function handleConfirm(): void {
    dispatch({ type: 'RESET_INVOICE' });
    setConfirming(false);
  }

  function handleCancel(): void {
    setConfirming(false);
  }

  return (
    <div>
      <button onClick={handleClick}>New Invoice</button>
      {confirming && (
        <div role="dialog" aria-modal="true" aria-label="Confirm new invoice">
          <p>This will clear the current invoice. Continue?</p>
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}
