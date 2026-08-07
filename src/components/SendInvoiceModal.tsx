import React, { useState } from 'react';
import { sendInvoiceEmail } from '../services/emailService';
import { getInvoiceById } from '../utils/invoiceUtils';

/**
 * SendInvoiceModal component allows users to select an invoice and send it via email
 */
const SendInvoiceModal: React.FC = () => {
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Handles the form submission for sending an invoice
   * @param e - The form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceId || !emailAddress) {
      setErrorMessage('Please enter both invoice ID and email address');
      return;
    }

    if (!validateEmail(emailAddress)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setErrorMessage('');

    try {
      const invoice = await getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      await sendInvoiceEmail(invoiceId, emailAddress);
      alert('Invoice sent successfully!');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal">
      <h2>Send Invoice by Email</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Invoice ID:</label>
          <input
            type="text"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            placeholder="Enter invoice ID"
          />
        </div>
        <div>
          <label>Email Address:</label>
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button type="submit" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Invoice'}
        </button>
      </form>
    </div>
  );
};

export default SendInvoiceModal;