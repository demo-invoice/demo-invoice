import { useRef } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { LineItemRow } from './LineItemRow';

/**
 * Renders the list of line-item rows and the "Add Item" button.
 * The addItemButtonRef is forwarded to each row so that after a row is
 * removed, focus returns to the "Add Item" button (WCAG 2.4.3).
 */
export function LineItemList()
{
  const addItemButtonRef = useRef<HTMLButtonElement>(null);
  const { state, dispatch } = useInvoice();

  return (
    <div>
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
        aria-label="Add line item"
        onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
      >
        Add Item
      </button>
    </div>
  );
}
