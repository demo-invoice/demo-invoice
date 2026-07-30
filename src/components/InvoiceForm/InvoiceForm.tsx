import { useRef } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { LineItemList } from '../LineItems/LineItemList';
import { CurrencyDropdown } from '../CurrencyDropdown/CurrencyDropdown';
import { ValidationError } from './ValidationError';
import type { SetFieldAction } from '../../types/invoice';
import { v4 as uuidv4 } from 'uuid';

function validate(state: ReturnType<typeof useInvoice>['state']) {
  const errors: Record<string, string[]> = {};

  if (!state.invoiceNumber.trim()) {
    errors.invoiceNumber = ['Invoice number is required.'];
  }
  if (!state.issueDate.trim()) {
    errors.issueDate = ['Issue date is required.'];
  }
  if (!state.dueDate.trim()) {
    errors.dueDate = ['Due date is required.'];
  }
  if (!state.clientName.trim()) {
    errors.clientName = ['Client name is required.'];
  }
  if (state.lineItems.length === 0) {
    errors.lineItems = ['At least one line item is required.'];
  }

  return errors;
}

export function InvoiceForm() {
  const { state, dispatch } = useInvoice();
  const liveRegionRef = useRef<HTMLDivElement>(null);

  function setField(field: SetFieldAction['payload']['field'], value: string) {
    const action: SetFieldAction = { type: 'SET_FIELD', payload: { field, value } };
    dispatch(action);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate(state);

    // Clear first, then set after a tick so React 18 batching doesn't suppress re-announcement
    dispatch({ type: 'CLEAR_ERRORS' });
    setTimeout(() => {
      dispatch({ type: 'SET_ERRORS', payload: errors });
    }, 0);
  }

  const hasErrors = Object.keys(state.errors).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Invoice form">
      {/* Persistent aria-live region — always in DOM */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        id="form-errors"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
      >
        {hasErrors && 'Please correct the errors below.'}
      </div>

      <h1>Invoice</h1>

      {/* Invoice Number */}
      <div className="field">
        <label htmlFor="invoiceNumber">Invoice Number</label>
        <input
          id="invoiceNumber"
          type="text"
          value={state.invoiceNumber}
          onChange={(e) => setField('invoiceNumber', e.target.value)}
          aria-describedby="invoiceNumber-error"
          aria-invalid={!!state.errors.invoiceNumber}
        />
        <span id="invoiceNumber-error">
          <ValidationError messages={state.errors.invoiceNumber ?? []} />
        </span>
      </div>

      {/* Issue Date */}
      <div className="field">
        <label htmlFor="issueDate">Issue Date</label>
        <input
          id="issueDate"
          type="date"
          value={state.issueDate}
          onChange={(e) => setField('issueDate', e.target.value)}
          aria-describedby="issueDate-error"
          aria-invalid={!!state.errors.issueDate}
        />
        <span id="issueDate-error">
          <ValidationError messages={state.errors.issueDate ?? []} />
        </span>
      </div>

      {/* Due Date */}
      <div className="field">
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="date"
          value={state.dueDate}
          onChange={(e) => setField('dueDate', e.target.value)}
          aria-describedby="dueDate-error"
          aria-invalid={!!state.errors.dueDate}
        />
        <span id="dueDate-error">
          <ValidationError messages={state.errors.dueDate ?? []} />
        </span>
      </div>

      {/* Client Name */}
      <div className="field">
        <label htmlFor="clientName">Client Name</label>
        <input
          id="clientName"
          type="text"
          value={state.clientName}
          onChange={(e) => setField('clientName', e.target.value)}
          aria-describedby="clientName-error"
          aria-invalid={!!state.errors.clientName}
        />
        <span id="clientName-error">
          <ValidationError messages={state.errors.clientName ?? []} />
        </span>
      </div>

      {/* Currency */}
      <div className="field">
        <label htmlFor="currency-combobox">Currency</label>
        <CurrencyDropdown
          id="currency-combobox"
          value={state.currency}
          onChange={(val) => setField('currency', val)}
          aria-describedby="currency-error"
        />
        <span id="currency-error">
          <ValidationError messages={state.errors.currency ?? []} />
        </span>
      </div>

      {/* Notes */}
      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={state.notes}
          onChange={(e) => setField('notes', e.target.value)}
          aria-describedby="notes-error"
        />
        <span id="notes-error">
          <ValidationError messages={state.errors.notes ?? []} />
        </span>
      </div>

      {/* Line Items */}
      <LineItemList />
      {state.errors.lineItems && (
        <ValidationError messages={state.errors.lineItems} id="lineItems-error" />
      )}

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          aria-label="Add item"
          onClick={() =>
            dispatch({
              type: 'ADD_LINE_ITEM',
              payload: { id: uuidv4(), description: '', quantity: 0, rate: 0 },
            })
          }
        >
          Add Item
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <button type="submit">Submit Invoice</button>
      </div>
    </form>
  );
}
