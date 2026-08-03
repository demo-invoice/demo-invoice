/**
 * generateInvoicePdf
 *
 * Server-side utility that renders an Invoice to a PDF Buffer using
 * @react-pdf/renderer. Called exclusively from the /api/send-invoice route.
 *
 * @param invoice - The invoice data to render.
 * @returns A Buffer containing the PDF bytes.
 */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { Invoice } from '@/types/invoice';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 20, marginBottom: 16, fontWeight: 'bold' },
  section: { marginBottom: 12 },
  label: { fontWeight: 'bold', marginBottom: 2 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 4 },
  col: { flex: 1 },
  colRight: { flex: 1, textAlign: 'right' },
  headerRow: { flexDirection: 'row', backgroundColor: '#f0f0f0', paddingVertical: 4 },
  total: { textAlign: 'right', fontWeight: 'bold', marginTop: 8 },
  emptyItems: { color: '#888', fontStyle: 'italic' },
});

function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const total = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Invoice #{invoice.number}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Bill To</Text>
          <Text>{invoice.clientName || '—'}</Text>
          <Text>{invoice.clientEmail || '—'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Issue Date</Text>
          <Text>{invoice.issueDate || '—'}</Text>
          <Text style={styles.label}>Due Date</Text>
          <Text>{invoice.dueDate || '—'}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.col}>Description</Text>
            <Text style={styles.col}>Qty</Text>
            <Text style={styles.colRight}>Unit Price</Text>
            <Text style={styles.colRight}>Amount</Text>
          </View>
          {invoice.lineItems.length === 0 ? (
            <Text style={styles.emptyItems}>No line items.</Text>
          ) : (
            invoice.lineItems.map((item) => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.col}>{item.description}</Text>
                <Text style={styles.col}>{item.quantity}</Text>
                <Text style={styles.colRight}>${item.unitPrice.toFixed(2)}</Text>
                <Text style={styles.colRight}>
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </Text>
              </View>
            ))
          )}
          <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        </View>

        {invoice.notes ? (
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
  const element = React.createElement(InvoiceDocument, { invoice });
  const buffer = await renderToBuffer(element);
  return buffer;
}
