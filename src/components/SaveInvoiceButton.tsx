/**
 * Button that snapshots the current invoice state and appends it to history.
 */
import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { appendInvoiceHistory } from '../services/invoiceStorage';
import type { SavedInvoiceEntry } from '../types/invoice';

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString()}-${Math.random().toString(36).slice(2)}`;
  }
}

interface SaveInvoiceButtonProps {
  /** Called after the entry has been appended to history. */
  onSaved?: () => void;
}

/**
 * Saves the current invoice state as a new history entry.
 * Always appends — never upserts.
 */
export function SaveInvoiceButton({ onSaved }: SaveInvoiceButtonProps) {
  const { state } = useInvoice();

  function handleSave() {
    const savedAt = new Date().toISOString();
    const rawLabel = `${state.invoiceNumber} — ${state.issueDate}`;
    const label = rawLabel.trim() === '—' || rawLabel.trim() === '' 
      ? `Untitled — ${savedAt}` 
      : rawLabel;

    const entry: SavedInvoiceEntry = {
      id: generateId(),
      label,
      savedAt,
      snapshot: { ...state, lineItems: state.lineItems.map(li => ({ ...li })) },
    };

    appendInvoiceHistory(entry);
    onSaved?.();
  }

  return (
    <button type="button" onClick={handleSave}>
      Save Invoice
    </button>
  );
}
