import './LineItemsTable.css';
import { useInvoice } from '../../context/InvoiceContext';
import type { LineItem } from '../../context/InvoiceContext';

/**
 * Displays the invoice line items in a table with add/remove controls.
 * On mobile the rows reflow to a card layout via CSS.
 */
export function LineItemsTable(): JSX.Element {
  const { state, dispatch } = useInvoice();

  function handleAdd() {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      qty: 1,
      unitPrice: 0,
    };
    dispatch({ type: 'ADD_LINE_ITEM', payload: newItem });
  }

  function handleRemove(id: string) {
    dispatch({ type: 'REMOVE_LINE_ITEM', payload: id });
  }

  function handleUpdate(item: LineItem) {
    dispatch({ type: 'UPDATE_LINE_ITEM', payload: item });
  }

  return (
    <div className="line-items-wrapper">
      <h2 className="line-items__title">Line Items</h2>
      <table className="line-items-table">
        <thead>
          <tr>
            <th className="line-items-table__th">Description</th>
            <th className="line-items-table__th">Qty</th>
            <th className="line-items-table__th">Unit Price</th>
            <th className="line-items-table__th">Amount</th>
          </tr>
        </thead>
        <tbody>
          {state.lineItems.length === 0 ? (
            <tr>
              <td className="line-items-table__empty" colSpan={4}>
                No line items yet.
              </td>
            </tr>
          ) : (
            state.lineItems.map((item) => (
              <tr key={item.id} className="line-items-table__row">
                <td className="line-items-table__td">
                  <input
                    className="line-items-table__input"
                    type="text"
                    aria-label="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleUpdate({ ...item, description: e.target.value })
                    }
                  />
                </td>
                <div className="line-item-sub-row">
                  <td className="line-items-table__td">
                    <input
                      className="line-items-table__input"
                      type="number"
                      aria-label="Qty"
                      value={item.qty}
                      min={0}
                      onChange={(e) =>
                        handleUpdate({ ...item, qty: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="line-items-table__td">
                    <input
                      className="line-items-table__input"
                      type="number"
                      aria-label="Unit Price"
                      value={item.unitPrice}
                      min={0}
                      step={0.01}
                      onChange={(e) =>
                        handleUpdate({
                          ...item,
                          unitPrice: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="line-items-table__td">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(item.qty * item.unitPrice)}
                  </td>
                </div>
                <td className="line-items-table__td">
                  <button
                    className="line-items-table__remove-btn"
                    type="button"
                    aria-label="Remove line item"
                    onClick={() => handleRemove(item.id)}
                  >
                    &times;
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="line-items-table__subtotal-row">
            <td className="line-items-table__td--subtotal-label" colSpan={3}>Subtotal</td>
            <td className="line-items-table__td--subtotal-value">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                state.lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
              )}
            </td>
          </tr>
        </tfoot>
      </table>
      <button
        className="line-items-table__add-btn"
        type="button"
        onClick={handleAdd}
      >
        + Add Line Item
      </button>
    </div>
  );
}
