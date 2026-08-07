import { sendInvoice } from '../api/invoiceApi';

/**
 * Sends an invoice via email
 * @param invoiceId - The ID of the invoice to send
 * @param emailAddress - The email address to send the invoice to
 * @returns A promise that resolves when the invoice is sent
 */
export const sendInvoiceEmail = async (invoiceId: string, emailAddress: string): Promise<void> => {
  if (!invoiceId || !emailAddress) {
    throw new Error('Invoice ID and email address are required');
  }

  try {
    await sendInvoice(invoiceId, emailAddress);
  } catch (error) {
    throw new Error(`Failed to send invoice: ${error.message}`);
  }
};

/**
 * Validates the email address format
 * @param email - The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};