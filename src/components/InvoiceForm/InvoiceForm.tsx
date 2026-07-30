import './InvoiceForm.css';
import { useInvoice } from '../../context/InvoiceContext';

/**
 * Form for editing invoice header fields.
 * Each input dispatches a typed action to the shared invoice reducer.
 */
export function InvoiceForm(): JSX.Element {
  const { state, dispatch } = useInvoice();

  return (
    <form className="invoice-form" noValidate>
      <h2 className="invoice-form__title">Invoice Details</h2>

      <label className="invoice-form__label" htmlFor="clientName">
        Client Name
        <input
          id="clientName"
          className="invoice-form__input"
          type="text"
          value={state.clientName}
          onChange={(e) =>
            dispatch({ type: 'SET_CLIENT_NAME', payload: e.target.value })
          }
        />
      </label>

      <label className="invoice-form__label" htmlFor="clientEmail">
        Client Email
        <input
          id="clientEmail"
          className="invoice-form__input"
          type="email"
          value={state.clientEmail}
          onChange={(e) =>
            dispatch({ type: 'SET_CLIENT_EMAIL', payload: e.target.value })
          }
        />
      </label>

      <label className="invoice-form__label" htmlFor="invoiceNumber">
        Invoice Number
        <input
          id="invoiceNumber"
          className="invoice-form__input"
          type="text"
          value={state.invoiceNumber}
          onChange={(e) =>
            dispatch({ type: 'SET_INVOICE_NUMBER', payload: e.target.value })
          }
        />
      </label>

      <label className="invoice-form__label" htmlFor="issueDate">
        Issue Date
        <input
          id="issueDate"
          className="invoice-form__input"
          type="date"
          value={state.issueDate}
          onChange={(e) =>
            dispatch({ type: 'SET_ISSUE_DATE', payload: e.target.value })
          }
        />
      </label>

      <label className="invoice-form__label" htmlFor="dueDate">
        Due Date
        <input
          id="dueDate"
          className="invoice-form__input"
          type="date"
          value={state.dueDate}
          onChange={(e) =>
            dispatch({ type: 'SET_DUE_DATE', payload: e.target.value })
          }
        />
      </label>

      <label className="invoice-form__label" htmlFor="notes">
        Notes
        <textarea
          id="notes"
          className="invoice-form__textarea"
          value={state.notes}
          rows={3}
          onChange={(e) =>
            dispatch({ type: 'SET_NOTES', payload: e.target.value })
          }
        />
      </label>
    </form>
  );
}
