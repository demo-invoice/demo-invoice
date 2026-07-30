/**
 * LineItemRow — a single row in the line-items table (LineItems folder variant).
 *
 * Accessibility contract:
 *   - Every input has a visually-hidden <label> (not just placeholder).
 *   - Remove button has a dynamic aria-label including the row number.
 *   - Validation errors wired via aria-describedby.
 */
import { useInvoice } from '../../context/InvoiceContext';
import { ValidationError } from '../ValidationError/ValidationError';

interface Props {
  id: string;
  index: number;
}

export function LineItemRow({ id, index }: Props) {
  const { state, dispatch } = useInvoice();
  const item = state.lineItems.find((li) => li.id === id);

  if (!item) return null;

  const rowNum = index + 1;

  const descErrorId = `line-${id}-desc-error`;
  const qtyErrorId = `line-${id}-qty-error`;
  const rateErrorId = `line-${id}-rate-error`;

  const descError = item.description.trim() === '' ? 'Description is required.' : '';
  const qtyError =
    item.quantity.trim() === '' || isNaN(Number(item.quantity))
      ? 'Valid quantity is required.'
      : '';
  const rateError =
    item.rate.trim() === '' || isNaN(Number(item.rate))
      ? 'Valid rate is required.'
      : '';

  return (
    <tr>
      <td>
        <label htmlFor={`line-${id}-desc`} className="sr-only">
          Description for item {rowNum}
        </label>
        <input
          id={`line-${id}-desc`}
          type="text"
          value={item.description}
          aria-describedby={descErrorId}
          aria-invalid={descError ? true : undefined}
          placeholder="Description"
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_LINE_ITEM',
              id,
              field: 'description',
              value: e.target.value,
            })
          }
        />
        <ValidationError id={descErrorId} message={descError} />
      </td>

      <td>
        <label htmlFor={`line-${id}-qty`} className="sr-only">
          Quantity for item {rowNum}
        </label>
        <input
          id={`line-${id}-qty`}
          type="text"
          inputMode="numeric"
          value={item.quantity}
          aria-describedby={qtyErrorId}
          aria-invalid={qtyError ? true : undefined}
          placeholder="Qty"
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_LINE_ITEM',
              id,
              field: 'quantity',
              value: e.target.value,
            })
          }
        />
        <ValidationError id={qtyErrorId} message={qtyError} />
      </td>

      <td>
        <label htmlFor={`line-${id}-rate`} className="sr-only">
          Rate for item {rowNum}
        </label>
        <input
          id={`line-${id}-rate`}
          type="text"
          inputMode="decimal"
          value={item.rate}
          aria-describedby={rateErrorId}
          aria-invalid={rateError ? true : undefined}
          placeholder="Rate"
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_LINE_ITEM',
              id,
              field: 'rate',
              value: e.target.value,
            })
          }
        />
        <ValidationError id={rateErrorId} message={rateError} />
      </td>

      <td>
        <button
          type="button"
          aria-label={`Remove item ${rowNum}`}
          onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', id })}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}
