import { useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { ValidationError } from '../ValidationError/ValidationError';
import { CurrencyDropdown } from '../CurrencyDropdown/CurrencyDropdown';
import { LineItems } from '../LineItems/LineItems';

/**
 * Validates the current invoice state and returns an array of error messages.
 */
function validate(clientName: string, lineItems: { description: string }[]): string[] {
  const errors: string[] = [];
  if (!clientName.trim()) {
    errors.push('Client name is required.');
  }
  if (lineItems.length === 0) {
    errors.push('At least one line item is required.');
  }
  return errors;
}

/**
 * Main invoice form.
 *
 * Live region content is driven exclusively via React state — no direct
 * DOM mutation, no assertiveLiveRef, no requestAnimationFrame.
 *
 * On every submit: CLEAR_ERRORS is dispatched first (resets live region),
 * then SET_ERRORS is dispatched so the live region re-announces even on
 * repeated identical submissions.
 */
export function InvoiceForm() {
  const { state, dispatch } = useInvoice();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Always clear first so the live region re-announces on repeated submits
    dispatch({ type: 'CLEAR_ERRORS' });
    const errors = validate(state.clientName, state.lineItems);
    dispatch({ type: 'SET_ERRORS', errors });
    if (errors.length === 0) {
      setSubmitted(true);
    }
  }

  return (
    <main>
      <h1>Invoice</h1>
      {submitted && (
        <p role="status" aria-live="polite">
          Invoice submitted successfully.
        </p>
      )}
      <form
        noValidate
        onSubmit={handleSubmit}
        aria-describedby="form-errors"
      >
        {/* Client name */}
        <div className="field-group">
          <label htmlFor="client-name">Client Name</label>
          <input
            id="client-name"
            type="text"
            value={state.clientName}
            aria-describedby="form-errors"
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'clientName', value: e.target.value })
            }
          />
        </div>

        {/* Notes */}
        <div className="field-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={state.notes}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })
            }
          />
        </div>

        {/* Currency */}
        <CurrencyDropdown />

        {/* Line items */}
        <LineItems />

        {/* Persistent live region — always in DOM, never conditionally mounted */}
        <ValidationError id="form-errors" messages={state.errors} />

        <button type="submit">Submit Invoice</button>
      </form>
    </main>
  );
}
