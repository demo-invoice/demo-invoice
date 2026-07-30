import type { LineItem } from '../../types/invoice';
import { useInvoice } from '../../context/InvoiceContext';
import { ValidationError } from '../InvoiceForm/ValidationError';

interface LineItemRowProps {
  item: LineItem;
  index: number;
  errors?: Record<string, string[]>;
}

/**
 * Renders a single line item row.
 * Uses item.id (stable UUID) for all HTML IDs — never array index.
 */
export function LineItemRow({ item, index, errors = {} }: LineItemRowProps) {
  const { dispatch } = useInvoice();

  const descId = `description-${item.id}`;
  const qtyId = `quantity-${item.id}`;
  const rateId = `rate-${item.id}`;
  const descErrorId = `description-error-${item.id}`;
  const qtyErrorId = `quantity-error-${item.id}`;
  const rateErrorId = `rate-error-${item.id}`;

  function updateField(field: keyof Omit<LineItem, 'id'>, value: string | number) {
    dispatch({ type: 'UPDATE_LINE_ITEM', payload: { id: item.id, field, value } });
  }

  return (
    <tr>
      {/* Description */}
      <td>
        <label htmlFor={descId} className="sr-only">
          Description for item {index + 1}
        </label>
        <input
          id={descId}
          type="text"
          value={item.description}
          onChange={(e) => updateField('description', e.target.value)}
          aria-describedby={descErrorId}
          aria-invalid={!!errors['description']}
          aria-label={`Description for item ${index + 1}`}
        />
        <span id={descErrorId}>
          <ValidationError messages={errors['description'] ?? []} />
        </span>
      </td>

      {/* Quantity */}
      <td>
        <label htmlFor={qtyId} className="sr-only">
          Quantity for item {index + 1}
        </label>
        <input
          id={qtyId}
          type="number"
          min={0}
          value={item.quantity}
          onChange={(e) => updateField('quantity', Number(e.target.value))}
          aria-describedby={qtyErrorId}
          aria-invalid={!!errors['quantity']}
          aria-label={`Quantity for item ${index + 1}`}
        />
        <span id={qtyErrorId}>
          <ValidationError messages={errors['quantity'] ?? []} />
        </span>
      </td>

      {/* Rate */}
      <td>
        <label htmlFor={rateId} className="sr-only">
          Rate for item {index + 1}
        </label>
        <input
          id={rateId}
          type="number"
          min={0}
          step="0.01"
          value={item.rate}
          onChange={(e) => updateField('rate', Number(e.target.value))}
          aria-describedby={rateErrorId}
          aria-invalid={!!errors['rate']}
          aria-label={`Rate for item ${index + 1}`}
        />
        <span id={rateErrorId}>
          <ValidationError messages={errors['rate'] ?? []} />
        </span>
      </td>

      {/* Amount (computed, read-only) */}
      <td aria-label={`Amount for item ${index + 1}`}>
        {(item.quantity * item.rate).toFixed(2)}
      </td>

      {/* Remove */}
      <td>
        <button
          type="button"
          aria-label={`Remove item ${index + 1}`}
          onClick={() =>
            dispatch({ type: 'REMOVE_LINE_ITEM', payload: { id: item.id } })
          }
        >
          Remove
        </button>
      </td>
    </tr>
  );
}
