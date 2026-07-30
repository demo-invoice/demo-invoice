/**
 * InvoiceForm — main invoice entry form.
 *
 * Accessibility contract:
 * - Every input has an associated <label> via htmlFor/id.
 * - Validation errors are linked via aria-describedby and announced via role="alert".
 * - The Add Item button has aria-label="Add line item".
 * - Each Remove button has a dynamic aria-label reflecting its 1-based position.
 * - Currency is a native <select> for full keyboard support.
 */
import { type FormEvent } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { CurrencyDropdown } from '../CurrencyDropdown/CurrencyDropdown';
import { LineItemRow } from '../LineItemRow/LineItemRow';
import { ValidationError } from '../ValidationError/ValidationError';
import styles from './InvoiceForm.module.css';

/**
 * Validates top-level invoice header fields and returns an errors map.
 * Returns an empty object when all fields are valid.
 */
function validateHeader({
  invoiceNumber,
  date,
  dueDate,
  clientName,
}: {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!invoiceNumber.trim()) {
    errors.invoiceNumber = 'Invoice number is required.';
  }
  if (!date.trim()) {
    errors.date = 'Date is required.';
  }
  if (!dueDate.trim()) {
    errors.dueDate = 'Due date is required.';
  }
  if (!clientName.trim()) {
    errors.clientName = 'Client name is required.';
  }

  return errors;
}

/**
 * Validates line items and returns an errors map keyed by
 * `description-<id>`, `quantity-<id>`, `unitPrice-<id>`.
 */
function validateLineItems(
  lineItems: Array<{ id: string; description: string; quantity: string; unitPrice: string }>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  lineItems.forEach((item) => {
    if (!item.description.trim()) {
      errors[`description-${item.id}`] = 'Description is required.';
    }
    const qty = parseFloat(item.quantity);
    if (!item.quantity || isNaN(qty) || qty <= 0) {
      errors[`quantity-${item.id}`] = 'Quantity must be greater than 0.';
    }
    const price = parseFloat(item.unitPrice);
    if (!item.unitPrice || isNaN(price) || price <= 0) {
      errors[`unitPrice-${item.id}`] = 'Unit price must be greater than 0.';
    }
  });

  return errors;
}

export function InvoiceForm() {
  const { state, dispatch } = useInvoice();
  const { invoiceNumber, date, dueDate, clientName, currency, lineItems, errors } = state;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const headerErrors = validateHeader({ invoiceNumber, date, dueDate, clientName });
    const lineItemErrors = validateLineItems(lineItems);
    const allErrors = { ...headerErrors, ...lineItemErrors };

    if (Object.keys(allErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: allErrors });
      return;
    }

    dispatch({ type: 'CLEAR_ERRORS' });
    // TODO: submit invoice
  }

  function handleFieldChange(field: 'invoiceNumber' | 'date' | 'dueDate' | 'clientName' | 'currency', value: string) {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  }

  return (
    <div className={styles.container}>
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Invoice form"
        className={styles.form}
      >
        <h1 className={styles.heading}>Create Invoice</h1>

        {/* ── Header fields ── */}
        <section aria-labelledby="header-heading" className={styles.section}>
          <h2 id="header-heading" className={styles.sectionHeading}>
            Invoice Details
          </h2>

          <div className={styles.field}>
            <label htmlFor="invoice-number" className={styles.label}>
              Invoice Number
            </label>
            <input
              id="invoice-number"
              type="text"
              value={invoiceNumber}
              onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
              className={styles.input}
              aria-describedby={errors.invoiceNumber ? 'invoice-number-error' : undefined}
              aria-invalid={errors.invoiceNumber ? 'true' : undefined}
            />
            <ValidationError
              id="invoice-number-error"
              message={errors.invoiceNumber}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="date" className={styles.label}>
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              className={styles.input}
              aria-describedby={errors.date ? 'date-error' : undefined}
              aria-invalid={errors.date ? 'true' : undefined}
            />
            <ValidationError id="date-error" message={errors.date} />
          </div>

          <div className={styles.field}>
            <label htmlFor="due-date" className={styles.label}>
              Due Date
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => handleFieldChange('dueDate', e.target.value)}
              className={styles.input}
              aria-describedby={errors.dueDate ? 'due-date-error' : undefined}
              aria-invalid={errors.dueDate ? 'true' : undefined}
            />
            <ValidationError id="due-date-error" message={errors.dueDate} />
          </div>

          <div className={styles.field}>
            <label htmlFor="client-name" className={styles.label}>
              Client Name
            </label>
            <input
              id="client-name"
              type="text"
              value={clientName}
              onChange={(e) => handleFieldChange('clientName', e.target.value)}
              className={styles.input}
              aria-describedby={errors.clientName ? 'client-name-error' : undefined}
              aria-invalid={errors.clientName ? 'true' : undefined}
            />
            <ValidationError id="client-name-error" message={errors.clientName} />
          </div>

          <CurrencyDropdown
            value={currency}
            onChange={(value) => handleFieldChange('currency', value)}
            error={errors.currency}
          />
        </section>

        {/* ── Line items ── */}
        <section aria-labelledby="line-items-heading" className={styles.section}>
          <h2 id="line-items-heading" className={styles.sectionHeading}>
            Line Items
          </h2>

          <div className={styles.lineItems}>
            {lineItems.map((item, index) => (
              <LineItemRow
                key={item.id}
                item={item}
                index={index}
                totalItems={lineItems.length}
                errors={errors}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Add line item"
            className={styles.addButton}
            onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
          >
            + Add Item
          </button>
        </section>

        <button type="submit" className={styles.submitButton}>
          Submit Invoice
        </button>
      </form>
    </div>
  );
}
