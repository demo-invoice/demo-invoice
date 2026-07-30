import './LineItemsTable.css';
import { useInvoice } from '../../context/InvoiceContext';
import type { LineItem } from '../../context/InvoiceContext';

/** Formats a number as USD currency string. */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Renders the invoice line items as a responsive table.
 *
 * Mobile card layout (AC #4):
 * - Each line item occupies two rows:
 *   1. A description row spanning all columns.
 *   2. A sub-row (<tr class="line-item-sub-row-tr">) with a single
 *      <td colspan="4"> containing a flex div for Qty / Unit Price / Amount.
 *      This keeps valid HTML table structure while enabling the flex sub-row.
 */
export function LineItemsTable(): JSX.Element {
  const { state } = useInvoice();

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
          {state.lineItems.length === 0 && (
            <tr>
              <td className="line-items-table__empty" colSpan={4}>
                No line items yet.
              </td>
            </tr>
          )}
          {state.lineItems.map((item: LineItem) => (
            <>
              {/* Description row */}
              <tr key={`${item.id}-desc`} className="line-item-row">
                <td
                  className="line-items-table__td"
                  colSpan={4}
                  data-label="Description"
                >
                  {item.description}
                </td>
              </tr>
              {/* AC #4: numeric sub-row — valid HTML: single td with flex div inside */}
              <tr
                key={`${item.id}-nums`}
                className="line-item-sub-row-tr"
              >
                <td colSpan={4} className="line-items-table__td line-items-table__td--sub">
                  <div className="line-item-sub-row">
                    <span className="line-item-sub-row__cell">
                      <span className="line-item-sub-row__label">Qty</span>
                      {item.qty}
                    </span>
                    <span className="line-item-sub-row__cell">
                      <span className="line-item-sub-row__label">Unit Price</span>
                      {formatCurrency(item.unitPrice)}
                    </span>
                    <span className="line-item-sub-row__cell">
                      <span className="line-item-sub-row__label">Amount</span>
                      {formatCurrency(item.qty * item.unitPrice)}
                    </span>
                  </div>
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
