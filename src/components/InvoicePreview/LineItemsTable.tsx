import type { LineItem } from '../../types/invoice';
import { formatCurrency } from '../../utils/invoiceTotals';
import styles from './InvoicePreview.module.css';

interface LineItemsTableProps {
  lineItems: LineItem[];
  currency: string;
}

/**
 * Renders the line-items table.
 * When lineItems is empty, only the header row is rendered — no crash.
 * Long descriptions wrap within the cell; the table never overflows the preview.
 *
 * Note on keys: index is acceptable here because this is a read-only preview
 * component — items are never reordered or individually removed by the user
 * within this component. The stable `id` field is preferred when available.
 */
export function LineItemsTable({
  lineItems,
  currency,
}: LineItemsTableProps): JSX.Element {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Description</th>
          <th className={styles.right}>Qty</th>
          <th className={styles.right}>Unit Price</th>
          <th className={styles.right}>Total</th>
        </tr>
      </thead>
      <tbody>
        {lineItems.map((item, index) => {
          const lineTotal = item.quantity * item.unitPrice;
          return (
            // Prefer stable id; fall back to index for read-only preview
            <tr key={item.id || index}>
              <td>{item.description}</td>
              <td className={styles.right}>{item.quantity}</td>
              <td className={styles.right}>
                {formatCurrency(item.unitPrice, currency)}
              </td>
              <td className={styles.right}>
                {formatCurrency(lineTotal, currency)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
