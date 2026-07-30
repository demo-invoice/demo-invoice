import { v4 as uuidv4 } from 'uuid';
import { useInvoice } from '../../context/InvoiceContext';
import { LineItemList } from './LineItemList';

/**
 * Container component for line items.
 * Dispatches ADD_LINE_ITEM with a stable UUID payload.
 */
export function LineItems() {
  const { state, dispatch } = useInvoice();

  function handleAddItem() {
    dispatch({
      type: 'ADD_LINE_ITEM',
      payload: {
        id: uuidv4(),
        description: '',
        quantity: 1,
        rate: 0,
      },
    });
  }

  return (
    <div>
      <LineItemList items={state.lineItems} />
      <button
        type="button"
        aria-label="Add item"
        onClick={handleAddItem}
        style={{ marginTop: 8 }}
      >
        + Add item
      </button>
    </div>
  );
}
