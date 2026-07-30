/**
 * LineItemRow — a single line-item row in the invoice.
 *
 * Accessibility contract:
 * - Every input has an explicit <label> with htmlFor/id using the 1-based row index.
 * - The Remove button aria-label is derived from the current index on every render,
 *   so reindexing after row removal is automatic (no stale state).
 * - Validation errors are linked via aria-describedby.
 * - After removal, focus is managed by the parent (LineItemList).
 */
import { useRef } from 'react';
import { type LineItem, useInvoice } from '../../context/InvoiceContext';
import { ValidationError } from '../ValidationError/ValidationError';
import styles from './LineItemRow.module.css';

interface LineItemRowProps {
  item: LineItem;
  /** 1-based display index used for accessible labels. */
  index: number;
  /** Whether this is the only row (disables remove when true). */
  isOnly: boolean;
  /** Called after the row is removed so the parent can move focus. */
  onRemoved: () => void;
}

/**
 * Renders a single accessible line-item row.
 */
export function LineItemRow({ item, index, isOnly, onRemoved }: LineItemRowProps) {
  const { state, dispatch } = useInvoice();
  const errors = state.errors;

  const descId = `description-${index}`;
  const qtyId = `quantity-${index}`;
  const priceId = `unit-price-${index}`;
  const descErrorId = `${descId}-error`;
  const qtyErrorId = `${qtyId}-error`;
  const priceErrorId = `${priceId}-error`;

  const removeRef = useRef<HTMLButtonElement>(null);

  function handleUpdate(field: keyof Omit<LineItem, 'id'>, value: string) {
    dispatch({ type: 'UPDATE_LINE_ITEM', payload: { id: item.id, field, value } });
  }

  function handleRemove() {
    dispatch({ type: 'REMOVE_LINE_ITEM', payload: { id: item.id } });
    onRemoved();
  }

  return (
    <div className={styles.row} role="group" aria-label={`Line item ${index}`}>
      <div className={styles.field}>
        <label htmlFor={descId} className={styles.label}>
          Description
        </label>
        <input
          id={descId}
          type="text"
          value={item.description}
          onChange={(e) => handleUpdate('description', e.target.value)}
          className={styles.input}
          aria-describedby={errors[descErrorId] ? descErrorId : undefined}
          aria-invalid={errors[descErrorId] ? 'true' : undefined}
        />
        <ValidationError id={descErrorId} message={errors[descErrorId]} />
      </div>

      <div className={styles.field}>
        <label htmlFor={qtyId} className={styles.label}>
          Quantity
        </label>
        <input
          id={qtyId}
          type="number"
          min="0"
          value={item.quantity}
          onChange={(e) => handleUpdate('quantity', e.target.value)}
          className={styles.input}
          aria-describedby={errors[qtyErrorId] ? qtyErrorId : undefined}
          aria-invalid={errors[qtyErrorId] ? 'true' : undefined}
        />
        <ValidationError id={qtyErrorId} message={errors[qtyErrorId]} />
      </div>

      <div className={styles.field}>
        <label htmlFor={priceId} className={styles.label}>
          Unit Price
        </label>
        <input
          id={priceId}
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice}
          onChange={(e) => handleUpdate('unitPrice', e.target.value)}
          className={styles.input}
          aria-describedby={errors[priceErrorId] ? priceErrorId : undefined}
          aria-invalid={errors[priceErrorId] ? 'true' : undefined}
        />
        <ValidationError id={priceErrorId} message={errors[priceErrorId]} />
      </div>

      <button
        ref={removeRef}
        type="button"
        onClick={handleRemove}
        disabled={isOnly}
        className={styles.removeButton}
        aria-label={`Remove item ${index}`}
      >
        Remove
      </button>
    </div>
  );
}
