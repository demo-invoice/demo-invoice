import type { RefObject } from 'react';
import type { LineItem } from '../../types/invoice';
import { useInvoice } from '../../context/InvoiceContext';

interface LineItemRowProps {
  item: LineItem;
  index: number;
  /** Ref to the Add button — focused after this row is removed. */
  addItemButtonRef: RefObject<HTMLButtonElement>;
}

/**
 * A single invoice line item row with accessible labels and
 * a Remove button that returns focus to the Add button on removal.
 */
export function LineItemRow({ item, index, addItemButtonRef }: LineItemRowProps) {
  const { dispatch } = useInvoice();
  const n = index + 1;

  const removeLabel = item.description.trim()
    ? `Remove ${item.description.trim()}`
    : `Remove item ${n}`;

  function handleRemove() {
    dispatch({ type: 'REMOVE_LINE_ITEM', id: item.id });
    queueMicrotask(() => {
      addItemButtonRef.current?.focus();
    });
  }

  function handleFieldChange(
    field: 'description' | 'quantity' | 'rate',
    raw: string
  ) {
    if (field === 'description') {
      dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field, value: raw });
    } else {
      const num = parseFloat(raw);
      dispatch({
        type: 'UPDATE_LINE_ITEM',
        id: item.id,
        field,
        value: isNaN(num) ? 0 : num,
      });
    }
  }

  return (
    <tr>
      <td>
        <label htmlFor={`description-${index}`}>Description for item {n}</label>
        <input
          id={`description-${index}`}
          type="text"
          value={item.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
        />
      </td>
      <td>
        <label htmlFor={`quantity-${index}`}>Quantity for item {n}</label>
        <input
          id={`quantity-${index}`}
          type="number"
          min={0}
          value={item.quantity}
          onChange={(e) => handleFieldChange('quantity', e.target.value)}
        />
      </td>
      <td>
        <label htmlFor={`rate-${index}`}>Rate for item {n}</label>
        <input
          id={`rate-${index}`}
          type="number"
          min={0}
          step="0.01"
          value={item.rate}
          onChange={(e) => handleFieldChange('rate', e.target.value)}
        />
      </td>
      <td>
        <button type="button" aria-label={removeLabel} onClick={handleRemove}>
          Remove
        </button>
      </td>
    </tr>
  );
}
