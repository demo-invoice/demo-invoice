import './LineItemsTable.css';
import { useInvoice } from '../../context/InvoiceContext';
import type { LineItem } from '../../context/InvoiceContext';

/** Format a number as USD currency string. */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/** Calculate the line total for a single item. */
function lineTotal(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

/**
 * LineItemsTable
 *
 * Renders invoice line items as a `<table>` on desktop.
 * On mobile (via CSS) each `<tr>` collapses into a card:
 * - `<thead>` is hidden
 * - description spans the full card width
 * - qty / price / amount appear in a flex sub-row
 * - `data-label` attributes + CSS `::before` provide accessible column labels
 */
export function LineItemsTable(): JSX.Element {
  const { state, dispatch } = useInvoice();

  const subtotal = state.lineItems.reduce(
    (sum, item) => sum + lineTotal(item),
    0,
  );

  return (
    <div className="line-items-wrapper">
      <table className="line-items-table">
        <thead className="line-items-table__head">
          <tr>
            <th scope="col" className="line-items-table__th line-items-table__th--desc">
              Description
            </th>
            <th scope="col" className="line-items-table__th line-items-table__th--num">
              Qty
            </th>
            <th scope="col" className="line-items-table__th line-items-table__th--num">
              Unit Price
            </th>
            <th scope="col" className="line-items-table__th line-items-table__th--num">
              Amount
            </th>
            <th scope="col" className="line-items-table__th line-items-table__th--action">
              <span className="sr-only">Remove</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {state.lineItems.map((item) => (
            <tr key={item.id} className="line-items-table__row">
              {/* Description — full width on mobile card */}
              <td
                className="line-items-table__td line-items-table__td--desc"
                data-label="Description"
              >
                <input
                  type="text"
                  className="line-items-table__input"
                  value={item.description}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_LINE_ITEM',
                      payload: { id: item.id, field: 'description', value: e.target.value },
                    })
                  }
                  placeholder="Item description"
                  aria-label="Description"
                />
              </td>

              {/* Sub-row wrapper: qty / price / amount rendered side-by-side on mobile */}
              <td
                className="line-items-table__td line-items-table__td--num"
                data-label="Qty"
              >
                <input
                  type="number"
                  className="line-items-table__input line-items-table__input--num"
                  value={item.quantity}
                  min={0}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_LINE_ITEM',
                      payload: {
                        id: item.id,
                        field: 'quantity',
                        value: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  aria-label="Quantity"
                />
              </td>

              <td
                className="line-items-table__td line-items-table__td--num"
                data-label="Unit Price"
              >
                <input
                  type="number"
                  className="line-items-table__input line-items-table__input--num"
                  value={item.unitPrice}
                  min={0}
                  step={0.01}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_LINE_ITEM',
                      payload: {
                        id: item.id,
                        field: 'unitPrice',
                        value: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  aria-label="Unit price"
                />
              </td>

              <td
                className="line-items-table__td line-items-table__td--num line-items-table__td--amount"
                data-label="Amount"
              >
                {formatCurrency(lineTotal(item))}
              </td>

              <td className="line-items-table__td line-items-table__td--action">
                <button
                  type="button"
                  className="line-items-table__remove-btn"
                  onClick={() =>
                    dispatch({ type: 'REMOVE_LINE_ITEM', payload: item.id })
                  }
                  aria-label={`Remove line item: ${item.description || 'unnamed'}`}
                  disabled={state.lineItems.length === 1}
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          {/* Add row — display:block on mobile so it doesn't cause table overflow */}
          <tr className="line-items-table__add-row">
            <td colSpan={5} className="line-items-table__td">
              <button
                type="button"
                className="line-items-table__add-btn"
                onClick={() => dispatch({ type: 'ADD_LINE_ITEM' })}
              >
                + Add Line Item
              </button>
            </td>
          </tr>

          <tr className="line-items-table__subtotal-row">
            <td
              colSpan={3}
              className="line-items-table__td line-items-table__td--subtotal-label"
            >
              Subtotal
            </td>
            <td
              colSpan={2}
              className="line-items-table__td line-items-table__td--subtotal-value"
            >
              {formatCurrency(subtotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
