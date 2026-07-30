/**
 * InvoiceForm — top-level invoice form component.
 *
 * Accessibility contract:
 * - Every input has an explicit <label htmlFor> / id pairing.
 * - No placeholder-only labeling.
 * - Validation errors linked via aria-describedby.
 * - Form-level error summary uses aria-live="assertive" for submit-blocking errors.
 * - Only typed actions from InvoiceAction union are dispatched.
 * - Native <input type="date"> used for date fields (built-in keyboard nav).
 */
import { type FormEvent, useRef } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { CurrencyDropdown } from '../CurrencyDropdown/CurrencyDropdown';
import { LineItemList } from '../LineItems/LineItemList';
import { ValidationError } from '../ValidationError/ValidationError';
import styles from './InvoiceForm.module.css';

/** Validates the invoice state and returns a map of field → error message. */
function validate(state: ReturnType<typeof useInvoice>['state']): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!state.invoiceNumber.trim()) errs['invoiceNumber'] = 'Invoice number is required.';
  if (!state.date) errs['date'] = 'Invoice date is required.';
  if (!state.dueDate) errs['dueDate'] = 'Due date is required.';
  if (!state.clientName.trim()) errs['clientName'] = 'Client name is required.';
  state.lineItems.forEach((item, idx) => {
    const i = idx + 1;
    if (!item.description.trim())
      errs[`description-${i}-error`] = 'Description is required.';
    if (!item.quantity || Number(item.quantity) <= 0)
      errs[`quantity-${i}-error`] = 'Quantity must be greater than 0.';
    if (!item.unitPrice || Number(item.unitPrice) <= 0)
      errs[`unit-price-${i}-error`] = 'Unit price must be greater than 0.';
  });
  return errs;
}

/**
 * Renders the full invoice form with accessible fields and validation.
 */
export function InvoiceForm() {
  const { state, dispatch } = useInvoice();
  const summaryRef = useRef<HTMLDivElement>(null);

  function updateField(
    field: Parameters<typeof dispatch>[0] extends { type: 'UPDATE_FIELD'; payload: { field: infer F } } ? F : never,
    value: string,
  ) {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Clear previous errors first so aria-live re-announces on re-submit.
    dispatch({ type: 'CLEAR_ERRORS' });
    const errs = validate(state);
    if (Object.keys(errs).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: errs });
      summaryRef.current?.focus();
      return;
    }
    // TODO: submit invoice
    alert('Invoice submitted successfully!');
  }

  const hasErrors = Object.keys(state.errors).length > 0;
  const topLevelErrors = ['invoiceNumber', 'date', 'dueDate', 'clientName']
    .filter((k) => state.errors[k])
    .map((k) => state.errors[k]);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={styles.form}
      aria-label="Invoice form"
    >
      {hasErrors && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className={styles.errorSummary}
        >
          <strong>Please fix the following errors:</strong>
          <ul>
            {topLevelErrors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="invoiceNumber" className={styles.label}>
            Invoice Number
          </label>
          <input
            id="invoiceNumber"
            type="text"
            value={state.invoiceNumber}
            onChange={(e) => updateField('invoiceNumber', e.target.value)}
            className={styles.input}
            aria-describedby={state.errors['invoiceNumber'] ? 'invoiceNumber-error' : undefined}
            aria-invalid={state.errors['invoiceNumber'] ? 'true' : undefined}
            autoComplete="off"
          />
          <ValidationError id="invoiceNumber-error" message={state.errors['invoiceNumber']} />
        </div>

        <div className={styles.field}>
          <label htmlFor="clientName" className={styles.label}>
            Client Name
          </label>
          <input
            id="clientName"
            type="text"
            value={state.clientName}
            onChange={(e) => updateField('clientName', e.target.value)}
            className={styles.input}
            aria-describedby={state.errors['clientName'] ? 'clientName-error' : undefined}
            aria-invalid={state.errors['clientName'] ? 'true' : undefined}
            autoComplete="organization"
          />
          <ValidationError id="clientName-error" message={state.errors['clientName']} />
        </div>

        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>
            Invoice Date
          </label>
          <input
            id="date"
            type="date"
            value={state.date}
            onChange={(e) => updateField('date', e.target.value)}
            className={styles.input}
            aria-describedby={state.errors['date'] ? 'date-error' : undefined}
            aria-invalid={state.errors['date'] ? 'true' : undefined}
          />
          <ValidationError id="date-error" message={state.errors['date']} />
        </div>

        <div className={styles.field}>
          <label htmlFor="dueDate" className={styles.label}>
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            value={state.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
            className={styles.input}
            aria-describedby={state.errors['dueDate'] ? 'dueDate-error' : undefined}
            aria-invalid={state.errors['dueDate'] ? 'true' : undefined}
          />
          <ValidationError id="dueDate-error" message={state.errors['dueDate']} />
        </div>

        <CurrencyDropdown
          value={state.currency}
          onChange={(v) => updateField('currency', v)}
          error={state.errors['currency']}
        />
      </div>

      <LineItemList />

      <button type="submit" className={styles.submitButton}>
        Submit Invoice
      </button>
    </form>
  );
}
