import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { BrandingRecord } from '../services/brandingService.js';
import { APPROVED_FONTS } from '../constants/approvedFonts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.resolve(__dirname, '..', '..', 'assets', 'fonts');

/**
 * Resolves the absolute path to a TTF file for the given font family.
 * Throws a descriptive error if the file is absent — no silent fallback.
 */
function resolveFontPath(fontFamily: string): string {
  const filename = APPROVED_FONTS[fontFamily];
  if (!filename) {
    throw new Error(
      `Font "${fontFamily}" is not in APPROVED_FONTS. ` +
      `Approved fonts: ${Object.keys(APPROVED_FONTS).join(', ')}`
    );
  }

  const fullPath = path.join(FONTS_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `Required TTF font file not found: ${fullPath}\n` +
      `Download "${filename}" and place it in assets/fonts/.\n` +
      `See README.md § "Custom Branding — Font Setup" for instructions.`
    );
  }

  return fullPath;
}

export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  amount: number;
  branding: BrandingRecord;
}

/**
 * Generates a PDF invoice buffer using the user's custom branding.
 * Throws loudly if the required TTF font file is missing.
 */
export function generateInvoicePdf(data: InvoiceData): Buffer {
  const fontPath = resolveFontPath(data.branding.font_family);

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ margin: 50 });

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  doc
    .registerFont('BrandFont', fontPath)
    .font('BrandFont')
    .fontSize(24)
    .fillColor(data.branding.primary_color)
    .text(`Invoice #${data.invoiceNumber}`, { align: 'left' });

  doc
    .moveDown()
    .fontSize(14)
    .fillColor(data.branding.secondary_color)
    .text(`Client: ${data.clientName}`);

  doc
    .moveDown()
    .fillColor(data.branding.primary_color)
    .text(`Amount: $${data.amount.toFixed(2)}`);

  doc.end();

  return Buffer.concat(chunks);
}
