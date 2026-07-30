/**
 * LineItemList — renders all line-item rows and the Add Item button.
 *
 * Accessibility contract:
 * - Add button has aria-label="Add line item" (explicit accessible name).
 * - Each row receives its 1-based index so aria-labels are always current.
 * - After a row is removed, focus moves to the Add button (or the previous
 *   row's remove button) to prevent focus loss (WCAG 2.4.3).
 * - The Add button remains operable even when the list is empty.
 */
import { useRef } from 'react';
import { useInvoice } from '../../context/InvoiceContext';
import { LineItemRow } from './LineItemRow';
import styles from './LineItemList.module.css';

/**
 * Renders the line-item list with accessible add/remove controls.
 */
export function LineItemList() {
  const { state, dispatch } = useInvoice();
  const addButtonRef = useRef<HTMLButtonElement>(null);

  function handleAdd() {
    dispatch({ type: 'ADD_LINE_ITEM' });
  }

  /**
   * After a row is removed, move focus to the Add button to prevent
   * focus from landing on document.body (a WCAG 2.4.3 failure).
   */
  function handleRowRemoved() {
    // Use a microtask so the DOM has updated before we move focus.
    queueMicrotask(() => {
      addButtonRef.current?.focus();
    });
  }

  return (
    <section aria-label="Line items">
      <div role="list">
        {state.lineItems.map((item, idx) => (
          <div key={item.id} role="listitem">
            <LineItemRow
              item={item}
              index={idx + 1}
              isOnly={state.lineItems.length === 1}
              onRemoved={handleRowRemoved}
            />
          </div>
        ))}
      </div>

      <button
        ref={addButtonRef}
        type="button"
        onClick={handleAdd}
        className={styles.addButton}
        aria-label="Add line item"
      >
        + Add Item
      </button>
    </section>
  );
}
