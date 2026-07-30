import type { RefObject } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { ValidationError } from '../ValidationError/ValidationError';
import type { LineItem } from '../../context/InvoiceContext';

export interface LineItemRowProps {
  item: LineItem;
  index: number;
  /** Ref to the "Add Item" button in LineItemList — focus returns here after removal. */
  addItemButtonRef: RefObject<HTMLButtonElement>;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

/**
 * Renders a single line-item row with accessible labels and a remove button.
 * After dispatching REMOVE_LINE_ITEM, focus is returned to the "Add Item"
 * button via queueMicrotask so React has time to remove the row from the DOM
 * before focus moves.
 */
export function LineItemRow({ item, index, addItemButtonRef }: LineItemRowProps) {
  const { state, dispatch } = useInvoice();
  const n = index + 1;

  const descId = `error-line-${index}-description`;
  const qtyId = `error-line-${index}-quantity`;
  const priceId = `error-line-${index}-unitPrice`;

  function handleRemove() {
    dispatch({ type: 'REMOVE_LINE_ITEM', id: item.id });
    queueMicrotask(() => addItemButtonRef.current?.focus());
  }

  return (
    <div role="group" aria-label={`Line item ${n}`} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
      <div style={{ flex: '2 1 12rem' }}>
        <label htmlFor={`line-${index}-description`}>Description (item {n})</label>
        <input
          id={`line-${index}-description`}
          type="text"
          value={item.description}
          aria-describedby={descId}
          aria-required="true"
          onChange={(e) =>
            dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field: 'description', value: e.target.value })
          }
        />
        <ValidationError id={descId} message={state.errors[`line-${index}-description`]} />
      </div>

      <div style={{ flex: '1 1 5rem' }}>
        <label htmlFor={`line-${index}-quantity`}>Quantity (item {n})</label>
        <input
          id={`line-${index}-quantity`}
          type="number"
          min={1}
          value={item.quantity}
          aria-describedby={qtyId}
          aria-required="true"
          onChange={(e) =>
            dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field: 'quantity', value: e.target.value })
          }
        />
        <ValidationError id={qtyId} message={state.errors[`line-${index}-quantity`]} />
      </div>

      <div style={{ flex: '1 1 7rem' }}>
        <label htmlFor={`line-${index}-unitPrice`}>Unit price (item {n})</label>
        <input
          id={`line-${index}-unitPrice`}
          type="number"
          min={0}
          step={0.01}
          value={item.unitPrice}
          aria-describedby={priceId}
          aria-required="true"
          onChange={(e) =>
            dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field: 'unitPrice', value: e.target.value })
          }
        />
        <ValidationError id={priceId} message={state.errors[`line-${index}-unitPrice`]} />
      </div>

      <div style={{ flex: '1 1 6rem' }}>
        <label htmlFor={`line-${index}-currency`}>Currency (item {n})</label>
        {/* Native <select> is inherently keyboard-accessible; no custom ARIA widget needed. */}
        <select
          id={`line-${index}-currency`}
          value={item.currency}
          onChange={(e) =>
            dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field: 'currency', value: e.target.value })
          }
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <button
          type="button"
          aria-label={`Remove item ${n}`}
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
