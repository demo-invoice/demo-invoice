import type { RefObject } from 'react';
import type { LineItem } from '../../types/invoice';
import { ValidationError } from '../ValidationError/ValidationError';

interface LineItemRowProps {
  item: LineItem;
  index: number;
  errors?: { description?: string; quantity?: string; rate?: string };
  addItemButtonRef: RefObject<HTMLButtonElement>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => void;
}

export function LineItemRow({
  item,
  index,
  errors,
  addItemButtonRef,
  onRemove,
  onUpdate,
}: LineItemRowProps) {
  const descTrimmed = (item.description ?? '').trim();
  const label = descTrimmed || `item ${index + 1}`;

  const handleRemove = () => {
    onRemove(item.id);
    queueMicrotask(() => addItemButtonRef.current?.focus());
  };

  return (
    <tr>
      <td>
        <label htmlFor={`desc-${item.id}`}>Description for {label}</label>
        <input
          id={`desc-${item.id}`}
          type="text"
          value={item.description}
          aria-describedby={`desc-error-${item.id}`}
          onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
        />
        <ValidationError id={`desc-error-${item.id}`} messages={errors?.description ? [errors.description] : []} />
      </td>
      <td>
        <label htmlFor={`qty-${item.id}`}>Quantity for {label}</label>
        <input
          id={`qty-${item.id}`}
          type="number"
          value={String(item.quantity).trim()}
          aria-describedby={`qty-error-${item.id}`}
          onChange={(e) => onUpdate(item.id, 'quantity', Number(e.target.value))}
        />
        <ValidationError id={`qty-error-${item.id}`} messages={errors?.quantity ? [errors.quantity] : []} />
      </td>
      <td>
        <label htmlFor={`rate-${item.id}`}>Rate for {label}</label>
        <input
          id={`rate-${item.id}`}
          type="number"
          value={String(item.rate).trim()}
          aria-describedby={`rate-error-${item.id}`}
          onChange={(e) => onUpdate(item.id, 'rate', Number(e.target.value))}
        />
        <ValidationError id={`rate-error-${item.id}`} messages={errors?.rate ? [errors.rate] : []} />
      </td>
      <td>
        {(item.quantity * item.rate).toFixed(2)}
      </td>
      <td>
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={handleRemove}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}
