import { useRef } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { LineItemRow } from './LineItemRow';

/**
 * Renders the list of line-item rows and the "Add Item" button.
 *
 * Holds a ref to the "Add Item" button and passes it down to each
 * LineItemRow so that after a row is removed, focus can be programmatically
 * returned to this button — preventing focus from dropping to document.body.
 */
export function LineItemList() {
  const { state, dispatch } = useInvoice();
  const addItemButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <section aria-label="Line items">
      <h2 id="line-items-heading">Line Items</h2>
      {state.lineItems.map((item, index) => (
        <LineItemRow
          key={item.id}
          item={item}
          index={index}
          addItemButtonRef={addItemButtonRef}
        />
      ))}
      <button
        ref={addItemButtonRef}
        type="button"
        onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
      >
        Add Item
      </button>
    </section>
  );
}
