/**
 * LineItemRow — a single line item row in the invoice.
 *
 * Each field has an explicit <label> associated via htmlFor/id.
 * The remove button has a dynamic aria-label reflecting its 1-based position.
 */
import styles from './LineItemRow.module.css';
import { useInvoice, type LineItem } from '../../context/InvoiceContext';

interface LineItemRowProps {
  item: LineItem;
  index: number;
}

/**
 * Renders a single line item row with accessible labelled inputs and a remove button.
 */
export function LineItemRow({ item, index }: LineItemRowProps) {
  const { dispatch } = useInvoice();
  const position = index + 1;

  return (
    <div className={styles.row}>
      <div className={styles.field}>
        <label htmlFor={`description-${item.id}`} className={styles.label}>
          Description
        </label>
        <input
          id={`description-${item.id}`}
          type="text"
          className={styles.input}
          value={item.description}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_LINE_ITEM',
              payload: { id: item.id, field: 'description', value: e.target.value },
            })
          }
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={`quantity-${item.id}`} className={styles.label}>
          Quantity
        </label>
        <input
          id={`quantity-${item.id}`}
          type="number"
          className={styles.input}
          value={item.quantity}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_LINE_ITEM',
              payload: { id: item.id, field: 'quantity', value: e.target.value },
            })
          }
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={`unitPrice-${item.id}`} className={styles.label}>
          Unit Price
        </label>
        <input
          id={`unitPrice-${item.id}`}
          type="number"
          className={styles.input}
          value={item.unitPrice}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_LINE_ITEM',
              payload: { id: item.id, field: 'unitPrice', value: e.target.value },
            })
          }
        />
      </div>

      <button
        type="button"
        className={styles.removeButton}
        aria-label={`Remove item ${position}`}
        onClick={() =>
          dispatch({ type: 'REMOVE_LINE_ITEM', payload: { id: item.id } })
        }
      >
        Remove
      </button>
    </div>
  );
}
