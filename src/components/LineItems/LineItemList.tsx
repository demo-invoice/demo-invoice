import type { LineItem } from '../../types/invoice';
import { LineItemRow } from './LineItemRow';

interface LineItemListProps {
  items: LineItem[];
}

/**
 * Renders the table of line item rows.
 */
export function LineItemList({ items }: LineItemListProps) {
  if (items.length === 0) {
    return <p>No line items yet. Use "Add item" to add one.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th scope="col">Description</th>
          <th scope="col">Quantity</th>
          <th scope="col">Rate</th>
          <th scope="col">Amount</th>
          <th scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <LineItemRow key={item.id} item={item} index={index} />
        ))}
      </tbody>
    </table>
  );
}
