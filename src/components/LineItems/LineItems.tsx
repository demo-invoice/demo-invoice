/**
 * LineItems — renders the list of invoice line items.
 *
 * Accessibility contract:
 *   - "Add line item" button has aria-label="Add line item"
 *   - Each remove button has aria-label="Remove item {n}" (1-based, re-indexed
 *     on every render so removing a middle row keeps labels contiguous)
 *   - Each field has an explicit <label> via aria-label (table column headers
 *     serve as visible labels; aria-label provides the SR association per row)
 */
import { useInvoice, type LineItem } from '../../context/InvoiceContext';
import { ValidationError } from '../ValidationError/ValidationError';
import styles from './LineItems.module.css';

interface RowErrors {
  description?: string;
  quantity?: string;
  rate?: string;
}

interface Props {
  errors?: Record<string, RowErrors>;
}

/** Renders a single line-item row. */
function LineItemRow({
  item,
  index,
  errors,
}: {
  item: LineItem;
  index: number;
  errors?: RowErrors;
}) {
  const { dispatch } = useInvoice();
  const n = index + 1;
  const itemLabel = item.description.trim() || `item ${n}`;

  const update = (field: keyof Omit<LineItem, 'id'>, value: string) =>
    dispatch({ type: 'UPDATE_LINE_ITEM', id: item.id, field, value });

  const descErrorId = `line-item-${item.id}-description-error`;
  const qtyErrorId = `line-item-${item.id}-quantity-error`;
  const rateErrorId = `line-item-${item.id}-rate-error`;

  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <label htmlFor={`line-item-${item.id}-description`} className={styles.srOnly}>
          Description for {itemLabel}
        </label>
        <input
          id={`line-item-${item.id}-description`}
          type="text"
          value={item.description}
          onChange={(e) => update('description', e.target.value)}
          aria-describedby={descErrorId}
          aria-invalid={!!errors?.description}
          className={styles.input}
          placeholder="Description"
        />
        <ValidationError id={descErrorId} message={errors?.description} />
      </td>

      <td className={styles.cell}>
        <label htmlFor={`line-item-${item.id}-quantity`} className={styles.srOnly}>
          Quantity for {itemLabel}
        </label>
        <input
          id={`line-item-${item.id}-quantity`}
          type="number"
          min="0"
          value={item.quantity}
          onChange={(e) => update('quantity', e.target.value)}
          aria-describedby={qtyErrorId}
          aria-invalid={!!errors?.quantity}
          className={styles.input}
          placeholder="0"
        />
        <ValidationError id={qtyErrorId} message={errors?.quantity} />
      </td>

      <td className={styles.cell}>
        <label htmlFor={`line-item-${item.id}-rate`} className={styles.srOnly}>
          Rate for {itemLabel}
        </label>
        <input
          id={`line-item-${item.id}-rate`}
          type="number"
          min="0"
          step="0.01"
          value={item.rate}
          onChange={(e) => update('rate', e.target.value)}
          aria-describedby={rateErrorId}
          aria-invalid={!!errors?.rate}
          className={styles.input}
          placeholder="0.00"
        />
        <ValidationError id={rateErrorId} message={errors?.rate} />
      </td>

      <td className={styles.cell}>
        <button
          type="button"
          aria-label={`Remove ${itemLabel}`}
          className={styles.removeBtn}
          onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', id: item.id })}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

/** Renders the full line-items table with Add button. */
export function LineItems({ errors }: Props) {
  const { state, dispatch } = useInvoice();

  return (
    <section aria-labelledby="line-items-heading" className={styles.section}>
      <h2 id="line-items-heading" className={styles.heading}>
        Line Items
      </h2>

      {state.lineItems.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Quantity</th>
              <th scope="col">Rate</th>
              <th scope="col">
                <span className={styles.srOnly}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {state.lineItems.map((item, index) => (
              <LineItemRow
                key={item.id}
                item={item}
                index={index}
                errors={errors?.[item.id]}
              />
            ))}
          </tbody>
        </table>
      )}

      <button
        type="button"
        aria-label="Add line item"
        className={styles.addBtn}
        onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
      >
        + Add line item
      </button>
    </section>
  );
}
