import { type ChangeEvent } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import type { InvoiceState } from '../../types/invoice';

/**
 * Form for editing the active invoice.
 * Reads from and writes to InvoiceContext.
 * No localStorage access here — persistence is handled exclusively by InvoiceContext.
 */
export function InvoiceForm() {
  const { active, dispatch } = useInvoice();

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof InvoiceState,
  ) {
    dispatch({ type: 'UPDATE_FIELD', field, value: e.target.value });
  }

  function handleSave() {
    dispatch({ type: 'SAVE_INVOICE' });
  }

  function handleNew() {
    dispatch({ type: 'RESET_INVOICE' });
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '320px' }}
    >
      <h2>Invoice</h2>

      <div>
        <label htmlFor="invoiceNumber">Invoice Number</label>
        <input
          id="invoiceNumber"
          type="text"
          value={active.invoiceNumber}
          onChange={(e) => handleChange(e, 'invoiceNumber')}
        />
      </div>

      <div>
        <label htmlFor="clientName">Client Name</label>
        <input
          id="clientName"
          type="text"
          value={active.clientName}
          onChange={(e) => handleChange(e, 'clientName')}
        />
      </div>

      <div>
        <label htmlFor="issueDate">Issue Date</label>
        <input
          id="issueDate"
          type="date"
          value={active.issueDate}
          onChange={(e) => handleChange(e, 'issueDate')}
        />
      </div>

      <div>
        <label htmlFor="total">Total</label>
        <input
          id="total"
          type="number"
          value={active.total}
          onChange={(e) =>
            dispatch({ type: 'UPDATE_FIELD', field: 'total', value: Number(e.target.value) })
          }
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={handleSave}>
          Save Invoice
        </button>
        <button type="button" onClick={handleNew}>
          New Invoice
        </button>
      </div>
    </form>
  );
}
