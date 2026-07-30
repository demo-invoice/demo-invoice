import { useRef } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { LineItemRow } from './LineItemRow';

/**
 * Renders the line items table with an accessible Add button.
 * The Add button receives focus after any row is removed.
 */
export function LineItems() {
  const { state, dispatch } = useInvoice();
  const addItemButtonRef = useRef<HTMLButtonElement>(null);

  function handleAdd() {
    dispatch({ type: 'ADD_LINE_ITEM' });
  }

  return (
    <section aria-label="Line items">
      {state.lineItems.length > 0 && (
        <table>
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Quantity</th>
              <th scope="col">Rate</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.lineItems.map((item, index) => (
              <LineItemRow
                key={item.id}
                item={item}
                index={index}
                addItemButtonRef={addItemButtonRef}
              />
            ))}
          </tbody>
        </table>
      )}
      <button
        ref={addItemButtonRef}
        type="button"
        aria-label="Add line item"
        onClick={handleAdd}
      >
        Add line item
      </button>
    </section>
  );
}
