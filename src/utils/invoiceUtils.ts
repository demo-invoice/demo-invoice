import { Invoice } from './types';

/**
 * Retrieves an invoice by its ID
 * @param id - The ID of the invoice to retrieve
 * @returns A promise that resolves with the invoice data
 */
export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  // In a real application, this would make an API call to fetch the invoice
  // For demonstration purposes, we'll return a mock invoice
  if (id === '123') {
    return {
      id: '123',
      customerName: 'John Doe',
      amount: 100.00,
      date: '2023-04-01',
      status: 'pending'
    };
  }
  return null;
};

/**
 * Validates the invoice data
 * @param invoice - The invoice to validate
 * @returns True if the invoice is valid, false otherwise
 */
export const validateInvoice = (invoice: Invoice): boolean => {
  return (
    invoice.id &&
    invoice.customerName &&
    invoice.amount !== undefined &&
    invoice.date &&
    invoice.status
  );
};