import { useInvoice } from '../context/InvoiceContext';

/**
 * Form for editing the active invoice.
 * Dispatches UPDATE_FIELD, SAVE_INVOICE, and RESET_INVOICE actions.
 */
export function InvoiceForm() {
  const { state, dispatch } = useInvoice();
  const { active } = state;

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="invoiceNumber">Invoice Number</label>
        <input
          id="invoiceNumber"
          type="text"
          value={active.invoiceNumber}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_FIELD',
              field: 'invoiceNumber',
              value: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label htmlFor="clientName">Client Name</label>
        <input
          id="clientName"
          type="text"
          value={active.clientName}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_FIELD',
              field: 'clientName',
              value: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label htmlFor="issueDate">Issue Date</label>
        <input
          id="issueDate"
          type="date"
          value={active.issueDate}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_FIELD',
              field: 'issueDate',
              value: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label htmlFor="total">Total</label>
        <input
          id="total"
          type="number"
          value={active.total}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_FIELD',
              field: 'total',
              value: e.target.valueAsNumber,
            })
          }
        />
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'SAVE_INVOICE' })}
      >
        Save Invoice
      </button>

      <button
        type="button"
        onClick={() => dispatch({ type: 'RESET_INVOICE' })}
      >
        New Invoice
      </button>
    </form>
  );
}
