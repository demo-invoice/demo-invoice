import { type ChangeEvent, type FormEvent, useRef } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { ValidationError } from './ValidationError';
import { CurrencyDropdown } from './CurrencyDropdown';
import { LineItems } from '../LineItems/LineItems';

/** Validates the invoice form and returns a map of field → error messages. */
function validate(
  state: ReturnType<typeof useInvoice>['state'],
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if (!state.invoiceNumber.trim()) {
    errors['invoiceNumber'] = ['Invoice number is required.'];
  }
  if (!state.issueDate) {
    errors['issueDate'] = ['Issue date is required.'];
  }
  if (!state.dueDate) {
    errors['dueDate'] = ['Due date is required.'];
  } else if (state.issueDate && state.dueDate < state.issueDate) {
    errors['dueDate'] = ['Due date must be on or after the issue date.'];
  }
  if (!state.clientName.trim()) {
    errors['clientName'] = ['Client name is required.'];
  }
  if (state.lineItems.length === 0) {
    errors['lineItems'] = ['At least one line item is required.'];
  }

  return errors;
}

/** Main invoice form with full accessibility compliance. */
export function InvoiceForm() {
  const { state, dispatch } = useInvoice();
  const liveRegionRef = useRef<HTMLDivElement>(null);

  function handleField(field: Parameters<typeof dispatch>[0] extends { type: 'SET_FIELD'; payload: { field: infer F } } ? F : never, value: string) {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
  }

  function handleChange(
    field: Parameters<typeof handleField>[0],
  ) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleField(field, e.target.value);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validate(state);

    // React 18 batching fix: clear first, then re-set after a tick so the
    // aria-live region empties and refills — triggering screen reader re-announcement.
    dispatch({ type: 'CLEAR_ERRORS' });
    setTimeout(() => {
      if (Object.keys(errors).length > 0) {
        dispatch({ type: 'SET_ERRORS', payload: errors });
      } else {
        // Success path — could submit to API here
        alert('Invoice submitted successfully!');
      }
    }, 0);
  }

  const e = state.errors;

  return (
    <main>
      <h1>Create Invoice</h1>

      {/* Persistent aria-live region — always in DOM so screen readers register it on load */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="additions text"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {Object.keys(e).length > 0 && (
          <span>
            Form has {Object.keys(e).length} error
            {Object.keys(e).length > 1 ? 's' : ''}. Please review and correct.
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Invoice Number */}
        <div className="field">
          <label htmlFor="invoiceNumber">Invoice Number</label>
          <input
            id="invoiceNumber"
            type="text"
            value={state.invoiceNumber}
            onChange={handleChange('invoiceNumber')}
            aria-describedby="invoiceNumber-error"
            aria-invalid={!!e['invoiceNumber']}
          />
          {/* Always in DOM — empty when no error so aria-describedby ref is valid */}
          <span id="invoiceNumber-error">
            <ValidationError messages={e['invoiceNumber'] ?? []} />
          </span>
        </div>

        {/* Issue Date */}
        <div className="field">
          <label htmlFor="issueDate">Issue Date</label>
          <input
            id="issueDate"
            type="date"
            value={state.issueDate}
            onChange={handleChange('issueDate')}
            aria-describedby="issueDate-error"
            aria-invalid={!!e['issueDate']}
          />
          <span id="issueDate-error">
            <ValidationError messages={e['issueDate'] ?? []} />
          </span>
        </div>

        {/* Due Date */}
        <div className="field">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={state.dueDate}
            onChange={handleChange('dueDate')}
            aria-describedby="dueDate-error"
            aria-invalid={!!e['dueDate']}
          />
          <span id="dueDate-error">
            <ValidationError messages={e['dueDate'] ?? []} />
          </span>
        </div>

        {/* Client Name */}
        <div className="field">
          <label htmlFor="clientName">Client Name</label>
          <input
            id="clientName"
            type="text"
            value={state.clientName}
            onChange={handleChange('clientName')}
            aria-describedby="clientName-error"
            aria-invalid={!!e['clientName']}
          />
          <span id="clientName-error">
            <ValidationError messages={e['clientName'] ?? []} />
          </span>
        </div>

        {/* Currency */}
        <div className="field">
          <label htmlFor="currency-btn">Currency</label>
          <CurrencyDropdown
            id="currency-btn"
            value={state.currency}
            onChange={(val) => handleField('currency', val)}
            aria-describedby="currency-error"
          />
          <span id="currency-error">
            <ValidationError messages={e['currency'] ?? []} />
          </span>
        </div>

        {/* Notes */}
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={state.notes}
            onChange={handleChange('notes')}
            rows={3}
            aria-describedby="notes-error"
          />
          <span id="notes-error">
            <ValidationError messages={e['notes'] ?? []} />
          </span>
        </div>

        {/* Line Items */}
        <section aria-labelledby="line-items-heading">
          <h2 id="line-items-heading">Line Items</h2>
          <LineItems />
          <span id="lineItems-error">
            <ValidationError messages={e['lineItems'] ?? []} />
          </span>
        </section>

        <button type="submit" style={{ marginTop: 16 }}>
          Submit Invoice
        </button>
      </form>
    </main>
  );
}
