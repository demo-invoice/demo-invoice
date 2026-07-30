import React from 'react';
import { jsPDF } from 'jspdf';
import { useInvoice } from '../../context/InvoiceContext';

/**
 * Builds a jsPDF document from the current invoice state.
 * Returns the PDF as a Blob.
 */
function buildPdf(state: ReturnType<typeof useInvoice>['state']): Blob {
  const doc = new jsPDF();
  const lm = 14; // left margin
  let y = 20;

  doc.setFontSize(22);
  doc.text('INVOICE', lm, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(`Invoice #: ${state.invoiceNumber}`, lm, y); y += 7;
  doc.text(`Issue Date: ${state.issueDate}`, lm, y);   y += 7;
  doc.text(`Due Date:   ${state.dueDate}`, lm, y);     y += 12;

  doc.setFontSize(12);
  doc.text('From', lm, y); y += 6;
  doc.setFontSize(10);
  doc.text(state.senderName,    lm, y); y += 5;
  doc.text(state.senderEmail,   lm, y); y += 5;
  doc.text(state.senderAddress, lm, y); y += 10;

  doc.setFontSize(12);
  doc.text('Bill To', lm, y); y += 6;
  doc.setFontSize(10);
  doc.text(state.clientName,    lm, y); y += 5;
  doc.text(state.clientEmail,   lm, y); y += 5;
  doc.text(state.clientAddress, lm, y); y += 10;

  // Line items header
  doc.setFontSize(11);
  doc.text('Description',  lm,  y);
  doc.text('Qty',          120, y);
  doc.text('Unit Price',   140, y);
  doc.text('Total',        170, y);
  y += 5;
  doc.line(lm, y, 196, y); y += 5;

  doc.setFontSize(10);
  let subtotal = 0;
  for (const li of state.lineItems) {
    const lineTotal = li.quantity * li.unitPrice;
    subtotal += lineTotal;
    doc.text(li.description,                    lm,  y);
    doc.text(String(li.quantity),               120, y);
    doc.text(li.unitPrice.toFixed(2),           140, y);
    doc.text(lineTotal.toFixed(2),              170, y);
    y += 6;
  }

  y += 4;
  const tax   = subtotal * (state.taxRate / 100);
  const total = subtotal + tax;
  doc.text(`Subtotal: ${subtotal.toFixed(2)}`,                  140, y); y += 6;
  doc.text(`Tax (${state.taxRate}%): ${tax.toFixed(2)}`,        140, y); y += 6;
  doc.setFontSize(11);
  doc.text(`Total: ${total.toFixed(2)}`,                        140, y); y += 10;

  if (state.notes) {
    doc.setFontSize(10);
    doc.text('Notes:', lm, y); y += 5;
    doc.text(state.notes, lm, y);
  }

  return doc.output('blob');
}

/**
 * PDF download button.
 *
 * Cross-browser strategy:
 *  1. Create an object URL from the Blob.
 *  2. Try programmatic anchor.click() (Chrome, Firefox, Android Chrome).
 *  3. Fall back to window.open(blobUrl) for Safari, which may block
 *     programmatic clicks on dynamically created anchors.
 *
 * Known limitation: Safari in sandboxed iframes (e.g. StackBlitz) may block
 * window.open() as well. See docs/known-issues.md.
 */
export function PdfDownload(): React.JSX.Element {
  const { state } = useInvoice();

  function handleDownload(): void {
    let blobUrl = '';
    try {
      const blob = buildPdf(state);
      blobUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = `invoice-${state.invoiceNumber || 'draft'}.pdf`;

      // Some browsers require the element to be in the DOM.
      anchor.style.display = 'none';
      document.body.appendChild(anchor);

      try {
        anchor.click();
      } catch {
        // Safari fallback: open in new tab.
        window.open(blobUrl, '_blank');
      }

      document.body.removeChild(anchor);
    } catch (err) {
      console.error('PdfDownload: failed to generate PDF', err);
    } finally {
      // Always revoke to avoid memory leaks, even if download failed.
      if (blobUrl) {
        // Delay revocation slightly so the browser can initiate the download.
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
      }
    }
  }

  return (
    <button type="button" className="btn-primary" onClick={handleDownload}>
      Download PDF
    </button>
  );
}
