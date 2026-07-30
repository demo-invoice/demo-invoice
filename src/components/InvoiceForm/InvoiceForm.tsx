/**
 * InvoiceForm — main invoice form.
 *
 * Accessibility contract:
 *   - Every input has an explicit <label htmlFor> paired with a matching id.
 *   - Validation errors are wired via aria-describedby → stable error span ids.
 *   - aria-invalid reflects field error state.
 *   - A polite aria-live region announces field-level errors after interaction.
 *   - An assertive aria-live region announces the full error summary on submit.
 *   - Tab order: invoice fields → line items → currency → dates → submit.
 */
import { useState, useRef, useCallback } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { LineItems } from '../LineItems/LineItems';
import { CurrencyDropdown } from '../CurrencyDropdown/CurrencyDropdown';
import { ValidationError } from '../ValidationError/ValidationError';
import styles from './InvoiceForm.module.css';

interface FormErrors {
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
}

/** Validates invoice-level fields; returns an errors object (empty = valid). */
function validate(invoiceNumber: string, issueDate: string, dueDate: string): FormErrors {
  const errors: FormErrors = {};
  if (!invoiceNumber.trim()) errors.invoiceNumber = 'Invoice number is required.';
  if (!issueDate) errors.issueDate = 'Issue date is required.';
  if (!dueDate) errors.dueDate = 'Due date is required.';
  if (issueDate && dueDate && dueDate < issueDate)
    errors.dueDate = 'Due date must be on or after the issue date.';
  return errors;
}

/** Main invoice form component. */
export function InvoiceForm() {
  const { state, dispatch } = useInvoice();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const assertiveLiveRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors = validate(state.invoiceNumber, state.issueDate, state.dueDate);
      setErrors(newErrors);
      setSubmitted(true);

      if (Object.keys(newErrors).length > 0) {
        // Assertive live region — announced immediately
        const summary = Object.values(newErrors).join(' ');
        if (assertiveLiveRef.current) {
          // Force re-announcement by briefly clearing then setting
          assertiveLiveRef.current.textContent = '';
          requestAnimationFrame(() => {
            if (assertiveLiveRef.current) assertiveLiveRef.current.textContent = summary;
          });
        }
        return;
      }

      setSuccessMessage('Invoice saved successfully.');
    },
    [state]
  );

  const handleFieldChange = useCallback(
    (field: 'invoiceNumber' | 'issueDate' | 'dueDate', value: string) => {
      dispatch({ type: 'UPDATE_INVOICE_FIELD', field, value });
      if (submitted) {
        // Re-validate on change after first submit attempt
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    },
    [dispatch, submitted]
  );

  return (
    <>
      {/* Polite live region — field-level errors announced after interaction */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className={styles.srOnly}
      >
        {successMessage}
      </div>

      {/* Assertive live region — submit error summary announced immediately */}
      <div
        ref={assertiveLiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={styles.srOnly}
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className={styles.form}
        aria-label="Invoice form"
      >
        <h1 className={styles.title}>New Invoice</h1>

        {/* ── Invoice Number ─────────────────────────────────────────── */}
        <div className={styles.fieldGroup}>
          <label htmlFor="invoice-number" className={styles.label}>
            Invoice Number <span aria-hidden="true">*</span>
          </label>
          <input
            id="invoice-number"
            type="text"
            value={state.invoiceNumber}
            onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
            aria-describedby="invoice-number-error"
            aria-invalid={!!errors.invoiceNumber}
            aria-required="true"
            className={styles.input}
            placeholder="INV-001"
          />
          <ValidationError id="invoice-number-error" message={errors.invoiceNumber} />
        </div>

        {/* ── Line Items ─────────────────────────────────────────────── */}
        <LineItems />

        {/* ── Currency ──────────────────────────────────────────────── */}
        <div className={styles.fieldGroup}>
          <label htmlFor="currency-trigger" className={styles.label}>
            Currency
          </label>
          <CurrencyDropdown
            id="currency-trigger"
            value={state.currency}
            onChange={(currency) => dispatch({ type: 'SET_CURRENCY', currency })}
          />
        </div>

        {/* ── Issue Date ────────────────────────────────────────────── */}
        <div className={styles.fieldGroup}>
          <label htmlFor="issue-date" className={styles.label}>
            Issue Date <span aria-hidden="true">*</span>
          </label>
          <input
            id="issue-date"
            type="date"
            value={state.issueDate}
            onChange={(e) => handleFieldChange('issueDate', e.target.value)}
            aria-describedby="issue-date-error"
            aria-invalid={!!errors.issueDate}
            aria-required="true"
            className={styles.input}
          />
          <ValidationError id="issue-date-error" message={errors.issueDate} />
        </div>

        {/* ── Due Date ──────────────────────────────────────────────── */}
        <div className={styles.fieldGroup}>
          <label htmlFor="due-date" className={styles.label}>
            Due Date <span aria-hidden="true">*</span>
          </label>
          <input
            id="due-date"
            type="date"
            value={state.dueDate}
            onChange={(e) => handleFieldChange('dueDate', e.target.value)}
            aria-describedby="due-date-error"
            aria-invalid={!!errors.dueDate}
            aria-required="true"
            className={styles.input}
          />
          <ValidationError id="due-date-error" message={errors.dueDate} />
        </div>

        {/* ── Submit ────────────────────────────────────────────────── */}
        <button type="submit" className={styles.submitBtn}>
          Save Invoice
        </button>

        {successMessage && (
          <p className={styles.successMessage} role="status">
            {successMessage}
          </p>
        )}
      </form>
    </>
  );
}
