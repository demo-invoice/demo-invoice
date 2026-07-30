import React from 'react';
import { SenderDetails }   from './SenderDetails';
import { ClientDetails }   from './ClientDetails';
import { LineItems }       from './LineItems';
import { TaxRate }         from './TaxRate';
import { LogoUpload }      from './LogoUpload';
import { NewInvoiceButton } from './NewInvoiceButton';
import { PdfDownload }     from '../PdfDownload/PdfDownload';
import { useInvoice, useInvoiceDispatch } from '../../context/InvoiceContext';

/** Top-level invoice form orchestrating all sub-sections. */
export function InvoiceForm(): React.JSX.Element {
  const { state } = useInvoice();
  const dispatch  = useInvoiceDispatch();

  return (
    <div className="invoice-form-container">
      <header className="form-header">
        <h1>Invoice Generator</h1>
        <NewInvoiceButton />
      </header>

      <main className="form-main">
        <LogoUpload />

        <div className="meta-row">
          <div className="field-group">
            <label htmlFor="invoiceNumber">Invoice #</label>
            <input
              id="invoiceNumber"
              type="text"
              value={state.invoiceNumber}
              onChange={e =>
                dispatch({ type: 'SET_INVOICE_NUMBER', payload: e.target.value })
              }
            />
          </div>
          <div className="field-group">
            <label htmlFor="issueDate">Issue Date</label>
            <input
              id="issueDate"
              type="date"
              value={state.issueDate}
              onChange={e =>
                dispatch({ type: 'SET_ISSUE_DATE', payload: e.target.value })
              }
            />
          </div>
          <div className="field-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={state.dueDate}
              onChange={e =>
                dispatch({ type: 'SET_DUE_DATE', payload: e.target.value })
              }
            />
          </div>
        </div>

        <div className="parties-row">
          <SenderDetails />
          <ClientDetails />
        </div>

        <LineItems />
        <TaxRate />

        <div className="field-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={4}
            value={state.notes}
            onChange={e => dispatch({ type: 'SET_NOTES', payload: e.target.value })}
          />
        </div>
      </main>

      <div className="sticky-action-bar">
        <PdfDownload />
      </div>
    </div>
  );
}
