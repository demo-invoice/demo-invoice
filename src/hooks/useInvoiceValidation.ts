import { useMemo } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import type { InvoiceState } from '../types/invoice';

export interface ValidationErrors {
  invoiceNumber?: string;
  senderName?: string;
  senderEmail?: string;
  clientName?: string;
  lineItems?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

/**
 * Validates the current invoice state against T12 acceptance criteria.
 * Read-only — never dispatches any actions.
 *
 * Required fields:
 * - invoiceNumber
 * - sender name + email
 * - client name
 * - at least one line item with description, quantity > 0, and unitPrice >= 0
 */
export function useInvoiceValidation(): ValidationResult {
  const { state } = useInvoice();
  return useMemo(() => validate(state), [state]);
}

/** Pure validation function — exported for unit testing without React context. */
export function validate(state: InvoiceState): ValidationResult {
  const errors: ValidationErrors = {};

  if (!state.invoiceNumber.trim()) {
    errors.invoiceNumber = 'Invoice number is required.';
  }

  if (!state.sender.name.trim()) {
    errors.senderName = 'Sender name is required.';
  }

  if (!state.sender.email.trim()) {
    errors.senderEmail = 'Sender email is required.';
  }

  if (!state.client.name.trim()) {
    errors.clientName = 'Client name is required.';
  }

  const hasValidLineItem = state.lineItems.some(
    (item) =>
      item.description.trim() !== '' &&
      item.quantity > 0 &&
      item.unitPrice >= 0
  );

  if (!hasValidLineItem) {
    errors.lineItems =
      'At least one line item with a description and quantity > 0 is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
