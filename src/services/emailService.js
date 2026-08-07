/**
 * emailService.js
 *
 * Encapsulates all EmailJS + html2pdf.js logic for sending invoice emails.
 * No localStorage access. Credentials are read from Vite env variables:
 *   VITE_EMAILJS_SERVICE_ID
 *   VITE_EMAILJS_TEMPLATE_ID
 *   VITE_EMAILJS_PUBLIC_KEY
 */

import emailjs from '@emailjs/browser';
import html2pdf from 'html2pdf.js';

/**
 * Convert a Blob to a base64-encoded string (data URL stripped to raw base64).
 * @param {Blob} blob
 * @returns {Promise<string>} Raw base64 string (no data-URL prefix).
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = /** @type {string} */ (reader.result);
      // Strip the "data:application/pdf;base64," prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to convert PDF blob to base64.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate a PDF blob from a DOM element using html2pdf.js.
 * @param {HTMLElement} element - The invoice DOM node to render.
 * @returns {Promise<Blob>}
 */
async function generatePdfBlob(element) {
  const opt = {
    margin: 0.5,
    filename: 'invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  const blob = await html2pdf().set(opt).from(element).outputPdf('blob');
  return blob;
}

/**
 * Send an invoice as a PDF attachment to the given email address via EmailJS.
 *
 * Throws a descriptive Error if:
 *  - Required env variables are missing.
 *  - invoiceElement is null/undefined.
 *  - PDF generation fails.
 *  - EmailJS send fails.
 *
 * @param {string} recipientEmail - Validated recipient email address.
 * @param {HTMLElement} invoiceElement - The invoice DOM node to convert to PDF.
 * @returns {Promise<void>}
 */
export async function sendInvoiceEmail(recipientEmail, invoiceElement) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'Email service is not configured. Please set VITE_EMAILJS_SERVICE_ID, ' +
      'VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your environment.'
    );
  }

  if (!invoiceElement) {
    throw new Error(
      'Invoice element is unavailable. Please ensure the invoice is visible before sending.'
    );
  }

  let pdfBlob;
  try {
    pdfBlob = await generatePdfBlob(invoiceElement);
  } catch (err) {
    throw new Error(`Failed to generate invoice PDF: ${err instanceof Error ? err.message : String(err)}`);
  }

  let base64Pdf;
  try {
    base64Pdf = await blobToBase64(pdfBlob);
  } catch (err) {
    throw new Error(`Failed to encode invoice PDF: ${err instanceof Error ? err.message : String(err)}`);
  }

  const templateParams = {
    to_email: recipientEmail,
    pdf_attachment: base64Pdf,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
  } catch (err) {
    // Surface quota/rate-limit errors with a friendlier message
    const message = err && typeof err === 'object' && 'text' in err
      ? String(/** @type {any} */ (err).text)
      : (err instanceof Error ? err.message : String(err));

    if (message.toLowerCase().includes('limit') || message.toLowerCase().includes('quota')) {
      throw new Error('Email service limit reached. Please try again later.');
    }
    throw new Error(`Failed to send email: ${message}`);
  }
}
