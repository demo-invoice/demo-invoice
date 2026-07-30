/**
 * LineItemList — renders all line item rows and the Add Item button.
 *
 * The Add Item button has a descriptive aria-label ('Add line item').
 * Each row's remove button has a dynamic aria-label via LineItemRow.
 */
import styles from './LineItemList.module.css';
import { useInvoice } from '../../context/InvoiceContext';
import { LineItemRow } from './LineItemRow';

/**
 * Renders the list of line item rows and the button to add a new row.
 */
export function LineItemList() {
  const { state, dispatch } = useInvoice();

  return (
    <div className={styles.list}>
      {state.lineItems.map((item, index) => (
        <LineItemRow key={item.id} item={item} index={index} />
      ))}
      <button
        type="button"
        className={styles.addButton}
        aria-label="Add line item"
        onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
      >
        Add Item
      </button>
    </div>
  );
}
