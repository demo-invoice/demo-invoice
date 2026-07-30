import './InvoiceForm.css';
import { useInvoice } from '../../context/InvoiceContext';
import { LineItemsTable } from '../LineItemsTable/LineItemsTable';

/**
 * Invoice form panel.
 *
 * Renders all editable invoice fields and delegates line-item editing
 * to LineItemsTable. Dispatches only typed InvoiceActions — never raw strings.
 */
export function InvoiceForm(): JSX.Element {
  const { state, dispatch } = useInvoice();

  return (
    <div className="invoice-form">
      <h2 className="invoice-form__heading">Invoice Details</h2>

      <div className="invoice-form__grid">
        {/* Client info */}
        <div className="invoice-form__field">
          <label htmlFor="clientName" className="invoice-form__label">
            Client Name
          </label>
          <input
            id="clientName"
            type="text"
            className="invoice-form__input"
            value={state.clientName}
            onChange={(e) =>
              dispatch({ type: 'SET_CLIENT_NAME', payload: e.target.value })
            }
            placeholder="Acme Corp"
          />
        </div>

        <div className="invoice-form__field">
          <label htmlFor="clientEmail" className="invoice-form__label">
            Client Email
          </label>
          <input
            id="clientEmail"
            type="email"
            className="invoice-form__input"
            value={state.clientEmail}
            onChange={(e) =>
              dispatch({ type: 'SET_CLIENT_EMAIL', payload: e.target.value })
            }
            placeholder="billing@acme.com"
          />
        </div>

        {/* Invoice meta */}
        <div className="invoice-form__field">
          <label htmlFor="invoiceNumber" className="invoice-form__label">
            Invoice #
          </label>
          <input
            id="invoiceNumber"
            type="text"
            className="invoice-form__input"
            value={state.invoiceNumber}
            onChange={(e) =>
              dispatch({ type: 'SET_INVOICE_NUMBER', payload: e.target.value })
            }
          />
        </div>

        <div className="invoice-form__field">
          <label htmlFor="issueDate" className="invoice-form__label">
            Issue Date
          </label>
          <input
            id="issueDate"
            type="date"
            className="invoice-form__input"
            value={state.issueDate}
            onChange={(e) =>
              dispatch({ type: 'SET_ISSUE_DATE', payload: e.target.value })
            }
          />
        </div>

        <div className="invoice-form__field">
          <label htmlFor="dueDate" className="invoice-form__label">
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            className="invoice-form__input"
            value={state.dueDate}
            onChange={(e) =>
              dispatch({ type: 'SET_DUE_DATE', payload: e.target.value })
            }
          />
        </div>
      </div>

      {/* Line items */}
      <div className="invoice-form__section">
        <h3 className="invoice-form__subheading">Line Items</h3>
        <LineItemsTable />
      </div>

      {/* Notes */}
      <div className="invoice-form__field invoice-form__field--full">
        <label htmlFor="notes" className="invoice-form__label">
          Notes
        </label>
        <textarea
          id="notes"
          className="invoice-form__textarea"
          rows={3}
          value={state.notes}
          onChange={(e) =>
            dispatch({ type: 'SET_NOTES', payload: e.target.value })
          }
          placeholder="Payment terms, thank-you note, etc."
        />
      </div>
    </div>
  );
}
