import { useRef } from 'react';
import type { LineItem } from '../../types/invoice';
import { LineItemRow } from './LineItemRow';

interface LineItemListProps {
  items: LineItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => void;
  errors?: Record<string, { description?: string; quantity?: string; rate?: string }>;
}

export function LineItemList({
  items,
  onAdd,
  onRemove,
  onUpdate,
  errors = {},
}: LineItemListProps) {
  const addItemButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <section aria-label="Line items">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <LineItemRow
              key={item.id}
              item={item}
              index={index}
              errors={errors[item.id]}
              addItemButtonRef={addItemButtonRef}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </tbody>
      </table>
      <button
        ref={addItemButtonRef}
        type="button"
        aria-label="Add line item"
        onClick={onAdd}
      >
        Add line item
      </button>
    </section>
  );
}
