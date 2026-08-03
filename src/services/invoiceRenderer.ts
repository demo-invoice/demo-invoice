import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { BrandingRecord } from '../shared/brandingDefaults';
import { getDefaultBranding } from './brandingService';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  clientName: string;
  items: Array<{ description: string; amount: number }>;
  total: number;
}

const FONTS_DIR = path.resolve(process.cwd(), 'assets', 'fonts');

/**
 * Resolves the absolute path to a bundled TTF font file.
 * Returns null if the file does not exist on disk.
 */
function resolveFontPath(fontFamily: string): string | null {
  const fontPath = path.join(FONTS_DIR, `${fontFamily}.ttf`);
  return fs.existsSync(fontPath) ? fontPath : null;
}

/**
 * Renders an invoice PDF as a Buffer.
 *
 * @param invoice - Invoice data to render.
 * @param branding - Optional branding (colors + font). Falls back to BRANDING_DEFAULTS.
 * @returns A Promise resolving to the PDF as a Buffer.
 */
export function renderInvoicePDF(
  invoice: InvoiceData,
  branding?: Partial<BrandingRecord>,
): Promise<Buffer> {
  const defaults = getDefaultBranding();
  const resolved: BrandingRecord = {
    primary_color: branding?.primary_color ?? defaults.primary_color,
    secondary_color: branding?.secondary_color ?? defaults.secondary_color,
    font_family: branding?.font_family ?? defaults.font_family,
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // --- Font loading with ENOENT fallback ---
    const fontPath = resolveFontPath(resolved.font_family);
    if (fontPath) {
      doc.registerFont(resolved.font_family, fontPath);
      doc.font(resolved.font_family);
    } else {
      console.warn(
        `[invoiceRenderer] Font file not found for "${resolved.font_family}". ` +
          'Falling back to Helvetica.',
      );
      doc.font('Helvetica');
    }

    // --- Header bar (primary_color) ---
    doc
      .rect(0, 0, doc.page.width, 80)
      .fill(resolved.primary_color);

    doc
      .fillColor('#FFFFFF')
      .fontSize(24)
      .text('INVOICE', 50, 25);

    doc
      .fillColor('#000000')
      .fontSize(12)
      .text(`Invoice #: ${invoice.invoiceNumber}`, 50, 100)
      .text(`Date: ${invoice.date}`, 50, 118)
      .text(`Client: ${invoice.clientName}`, 50, 136);

    // --- Accent border (secondary_color) ---
    doc
      .moveTo(50, 160)
      .lineTo(doc.page.width - 50, 160)
      .strokeColor(resolved.secondary_color)
      .lineWidth(2)
      .stroke();

    // --- Line items ---
    let y = 175;
    for (const item of invoice.items) {
      doc
        .fillColor('#000000')
        .fontSize(11)
        .text(item.description, 50, y)
        .text(`$${item.amount.toFixed(2)}`, 450, y, { align: 'right' });
      y += 20;
    }

    // --- Totals row (primary_color) ---
    doc
      .moveTo(50, y + 5)
      .lineTo(doc.page.width - 50, y + 5)
      .strokeColor(resolved.secondary_color)
      .lineWidth(1)
      .stroke();

    doc
      .rect(50, y + 10, doc.page.width - 100, 28)
      .fill(resolved.primary_color);

    doc
      .fillColor('#FFFFFF')
      .fontSize(13)
      .text(`Total: $${invoice.total.toFixed(2)}`, 50, y + 16, { align: 'right', width: doc.page.width - 100 });

    doc.end();
  });
}
