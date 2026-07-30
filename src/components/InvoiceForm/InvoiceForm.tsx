/**
 * InvoiceForm — main invoice form component.
 *
 * Accessible form with labelled inputs, keyboard navigation,
 * and validation error announcements via aria-describedby.
 */
import styles from './InvoiceForm.module.css';
import { useInvoice } from '../../context/InvoiceContext';
import { CurrencyDropdown } from '../CurrencyDropdown/CurrencyDropdown';
import { LineItemList } from '../LineItems/LineItemList';
import { ValidationError } from '../ValidationError/ValidationError';

/**
 * Renders the full invoice creation form.
 */
export function InvoiceForm() {
  const { state, dispatch } = useInvoice();
  const { invoiceNumber, date, dueDate, clientName, currency, errors } = state;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required.';
    if (!date.trim()) newErrors.date = 'Issue date is required.';
    if (!dueDate.trim()) newErrors.dueDate = 'Due date is required.';
    if (!clientName.trim()) newErrors.clientName = 'Client name is required.';
    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: newErrors });
    } else {
      dispatch({ type: 'CLEAR_ERRORS' });
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.title}>Create Invoice</h1>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="invoiceNumber" className={styles.label}>
            Invoice Number
          </label>
          <input
            id="invoiceNumber"
            name="invoiceNumber"
            type="text"
            className={styles.input}
            value={invoiceNumber}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { field: 'invoiceNumber', value: e.target.value },
              })
            }
            aria-describedby={errors.invoiceNumber ? 'invoiceNumber-error' : undefined}
            aria-invalid={errors.invoiceNumber ? 'true' : undefined}
          />
          <ValidationError id="invoiceNumber-error" message={errors.invoiceNumber} />
        </div>

        <div className={styles.field}>
          <label htmlFor="clientName" className={styles.label}>
            Client Name
          </label>
          <input
            id="clientName"
            name="clientName"
            type="text"
            className={styles.input}
            value={clientName}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { field: 'clientName', value: e.target.value },
              })
            }
            aria-describedby={errors.clientName ? 'clientName-error' : undefined}
            aria-invalid={errors.clientName ? 'true' : undefined}
          />
          <ValidationError id="clientName-error" message={errors.clientName} />
        </div>

        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>
            Issue Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className={styles.input}
            value={date}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { field: 'date', value: e.target.value },
              })
            }
            aria-describedby={errors.date ? 'date-error' : undefined}
            aria-invalid={errors.date ? 'true' : undefined}
          />
          <ValidationError id="date-error" message={errors.date} />
        </div>

        <div className={styles.field}>
          <label htmlFor="dueDate" className={styles.label}>
            Due Date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className={styles.input}
            value={dueDate}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { field: 'dueDate', value: e.target.value },
              })
            }
            aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
            aria-invalid={errors.dueDate ? 'true' : undefined}
          />
          <ValidationError id="dueDate-error" message={errors.dueDate} />
        </div>
      </div>

      <CurrencyDropdown
        value={currency}
        onChange={(value) =>
          dispatch({
            type: 'UPDATE_FIELD',
            payload: { field: 'currency', value },
          })
        }
        error={errors.currency}
      />

      <LineItemList />

      <button type="submit" className={styles.submitButton}>
        Save Invoice
      </button>
    </form>
  );
}
