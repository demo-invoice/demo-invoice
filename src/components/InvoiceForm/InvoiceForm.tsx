import { type FormEvent } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { ValidationError } from '../ValidationError/ValidationError';
import { LineItemList } from './LineItemList';

/** Validates the invoice state and returns a map of field → error message. */
function validate(clientName: string, clientEmail: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!clientName.trim()) {
    errors['clientName'] = 'Client name is required.';
  }
  if (!clientEmail.trim()) {
    errors['clientEmail'] = 'Client email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    errors['clientEmail'] = 'Client email must be a valid email address.';
  }
  return errors;
}

/**
 * Main invoice form component.
 *
 * Every input has an explicit <label htmlFor> paired with a matching id.
 * Each input's aria-describedby points to its ValidationError id.
 *
 * handleSubmit dispatches CLEAR_ERRORS then SET_ERRORS on every attempt so
 * that live regions re-announce identical error messages on repeated
 * submissions (empty → text transition re-triggers the announcement).
 */
export function InvoiceForm() {
  const { state, dispatch } = useInvoice();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // CLEAR_ERRORS first so live region text node goes empty → text,
    // re-triggering announcement even when errors are identical.
    dispatch({ type: 'CLEAR_ERRORS' });
    const errors = validate(state.clientName, state.clientEmail);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return;
    }
    // TODO: submit invoice to API
    alert('Invoice submitted successfully!');
  }

  return (
    <main>
      <h1>Create Invoice</h1>
      <form onSubmit={handleSubmit} noValidate aria-label="Invoice form">
        <fieldset>
          <legend>Client Details</legend>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="clientName">Client name</label>
            <input
              id="clientName"
              type="text"
              value={state.clientName}
              aria-describedby="error-clientName"
              aria-required="true"
              autoComplete="name"
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'clientName', value: e.target.value })
              }
            />
            <ValidationError id="error-clientName" message={state.errors['clientName']} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="clientEmail">Client email</label>
            <input
              id="clientEmail"
              type="email"
              value={state.clientEmail}
              aria-describedby="error-clientEmail"
              aria-required="true"
              autoComplete="email"
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'clientEmail', value: e.target.value })
              }
            />
            <ValidationError id="error-clientEmail" message={state.errors['clientEmail']} />
          </div>
        </fieldset>

        <LineItemList />

        <button type="submit" style={{ marginTop: '1.5rem' }}>
          Submit Invoice
        </button>
      </form>
    </main>
  );
}
