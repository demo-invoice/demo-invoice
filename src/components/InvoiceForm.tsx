import React from 'react';
import { useInvoice } from '../context/InvoiceContext';

/**
 * Form for editing the active invoice.
 *
 * - String fields (invoiceNumber, clientName, issueDate) dispatch UPDATE_STRING_FIELD.
 * - Number field (total) dispatches UPDATE_NUMBER_FIELD.
 * - "Save Invoice" dispatches SAVE_INVOICE.
 * - "New Invoice" dispatches RESET_INVOICE.
 */
export function InvoiceForm(): React.JSX.Element {
  const { state, dispatch } = useInvoice();
  const { active } = state;

  /** Handle change for text/date inputs — dispatches UPDATE_STRING_FIELD. */
  function handleStringChange(
    field: 'invoiceNumber' | 'clientName' | 'issueDate',
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    dispatch({ type: 'UPDATE_STRING_FIELD', field, value: e.target.value });
  }

  /** Handle change for the total number input — dispatches UPDATE_NUMBER_FIELD. */
  function handleTotalChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const parsed = parseFloat(e.target.value);
    dispatch({
      type: 'UPDATE_NUMBER_FIELD',
      field: 'total',
      value: isNaN(parsed) ? 0 : parsed,
    });
  }

  function handleSave(): void {
    dispatch({ type: 'SAVE_INVOICE' });
  }

  function handleReset(): void {
    dispatch({ type: 'RESET_INVOICE' });
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} aria-label="Invoice form">
      <h2>Invoice</h2>

      <div>
        <label htmlFor="invoiceNumber">Invoice Number</label>
        <input
          id="invoiceNumber"
          type="text"
          value={active.invoiceNumber}
          onChange={(e) => handleStringChange('invoiceNumber', e)}
        />
      </div>

      <div>
        <label htmlFor="clientName">Client Name</label>
        <input
          id="clientName"
          type="text"
          value={active.clientName}
          onChange={(e) => handleStringChange('clientName', e)}
        />
      </div>

      <div>
        <label htmlFor="issueDate">Issue Date</label>
        <input
          id="issueDate"
          type="date"
          value={active.issueDate}
          onChange={(e) => handleStringChange('issueDate', e)}
        />
      </div>

      <div>
        <label htmlFor="total">Total</label>
        <input
          id="total"
          type="number"
          step="0.01"
          value={active.total}
          onChange={handleTotalChange}
        />
      </div>

      <button type="button" onClick={handleSave}>
        Save Invoice
      </button>

      <button type="button" onClick={handleReset}>
        New Invoice
      </button>
    </form>
  );
}
