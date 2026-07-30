import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoicePreview } from './InvoicePreview';
import { InvoiceProvider } from '../../context/InvoiceContext';
import type { InvoiceState } from '../../types/invoice';

const fullState: InvoiceState = {
  sender: {
    name: 'Acme Ltd',
    addressLine1: '123 Sender St',
    addressLine2: 'Suite 4',
    city: 'London',
    state: 'England',
    zip: 'EC1A 1BB',
    phone: '+44 20 7946 0958',
    email: 'hello@acme.com',
  },
  client: {
    name: 'Client Corp',
    addressLine1: '456 Client Ave',
    addressLine2: 'Floor 2',
    city: 'Manchester',
    state: 'England',
    zip: 'M1 1AE',
    email: 'billing@clientcorp.com',
  },
  meta: {
    invoiceNumber: 'INV-001',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    currency: 'GBP',
    taxRate: 20,
  },
  lineItems: [
    {
      id: '1',
      description: 'Web Development',
      quantity: 10,
      unitPrice: 150,
    },
    {
      id: '2',
      description: 'Design Services',
      quantity: 5,
      unitPrice: 100,
    },
  ],
  notes: 'Payment due within 30 days.',
  logoUrl: '',
};

const emptyOptionalState: InvoiceState = {
  sender: {
    name: 'Acme Ltd',
    addressLine1: '123 Sender St',
    addressLine2: '',
    city: 'London',
    state: 'England',
    zip: 'EC1A 1BB',
    phone: '',
    email: 'hello@acme.com',
  },
  client: {
    name: 'Client Corp',
    addressLine1: '456 Client Ave',
    addressLine2: '',
    city: 'Manchester',
    state: 'England',
    zip: 'M1 1AE',
    email: 'billing@clientcorp.com',
  },
  meta: {
    invoiceNumber: 'INV-002',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    currency: 'GBP',
    taxRate: 0,
  },
  lineItems: [
    {
      id: '1',
      description: 'Consulting',
      quantity: 2,
      unitPrice: 200,
    },
  ],
  notes: '',
  logoUrl: '',
};

function renderWithState(state: InvoiceState) {
  return render(
    <InvoiceProvider initialState={state}>
      <InvoicePreview />
    </InvoiceProvider>,
  );
}

describe('InvoicePreview', () => {
  describe('(a) all sections render when state is fully populated', () => {
    it('renders the logo placeholder', () => {
      renderWithState(fullState);
      expect(screen.getByTestId('logo-placeholder')).toBeInTheDocument();
    });

    it('renders sender details', () => {
      renderWithState(fullState);
      expect(screen.getByText('Acme Ltd')).toBeInTheDocument();
      expect(screen.getByText('123 Sender St')).toBeInTheDocument();
      expect(screen.getByText('+44 20 7946 0958')).toBeInTheDocument();
    });

    it('renders INVOICE heading with number, issue date, and due date', () => {
      renderWithState(fullState);
      expect(screen.getByText('INVOICE')).toBeInTheDocument();
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('2024-02-15')).toBeInTheDocument();
    });

    it('renders Bill To block with client details', () => {
      renderWithState(fullState);
      expect(screen.getByText('Bill To')).toBeInTheDocument();
      expect(screen.getByText('Client Corp')).toBeInTheDocument();
      expect(screen.getByText('456 Client Ave')).toBeInTheDocument();
      expect(screen.getByText('billing@clientcorp.com')).toBeInTheDocument();
    });

    it('renders line items table with correct columns', () => {
      renderWithState(fullState);
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Unit Price')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('Design Services')).toBeInTheDocument();
    });

    it('renders line totals correctly (qty × unit price)', () => {
      renderWithState(fullState);
      // 10 × £150 = £1,500.00
      expect(screen.getByText('£1,500.00')).toBeInTheDocument();
      // 5 × £100 = £500.00
      expect(screen.getByText('£500.00')).toBeInTheDocument();
    });

    it('renders subtotal, tax, and grand total', () => {
      renderWithState(fullState);
      // subtotal = £2,000.00, tax 20% = £400.00, grand total = £2,400.00
      expect(screen.getByText('£2,000.00')).toBeInTheDocument();
      expect(screen.getByText('£400.00')).toBeInTheDocument();
      expect(screen.getByText('£2,400.00')).toBeInTheDocument();
    });

    it('renders notes section', () => {
      renderWithState(fullState);
      expect(screen.getByText('Payment due within 30 days.')).toBeInTheDocument();
    });
  });

  describe('(b) optional empty fields are absent from the rendered output', () => {
    it('does not render phone when empty', () => {
      renderWithState(emptyOptionalState);
      // phone is empty — should not appear
      expect(screen.queryByTestId('sender-phone')).not.toBeInTheDocument();
    });

    it('does not render sender addressLine2 when empty', () => {
      renderWithState(emptyOptionalState);
      expect(screen.queryByTestId('sender-address-line2')).not.toBeInTheDocument();
    });

    it('does not render client addressLine2 when empty', () => {
      renderWithState(emptyOptionalState);
      expect(screen.queryByTestId('client-address-line2')).not.toBeInTheDocument();
    });

    it('does not render notes section when notes is empty', () => {
      renderWithState(emptyOptionalState);
      expect(screen.queryByTestId('notes-section')).not.toBeInTheDocument();
    });

    it('does not render tax row when taxRate is 0', () => {
      renderWithState(emptyOptionalState);
      expect(screen.queryByTestId('tax-row')).not.toBeInTheDocument();
    });
  });

  describe('(c) no state-mutation calls are made', () => {
    it('does not call setState or dispatch during render', () => {
      const dispatchSpy = vi.fn();

      // Spy on React.useState to detect any setState calls originating
      // from within the preview subtree during render.
      const useStateSpy = vi.spyOn(
        await import('react'),
        'useState',
      );

      renderWithState(fullState);

      // useState should not have been called inside the preview component
      // (it reads exclusively from context, not local state).
      expect(useStateSpy).not.toHaveBeenCalled();

      // dispatch should never be called from the preview
      expect(dispatchSpy).not.toHaveBeenCalled();

      useStateSpy.mockRestore();
    });
  });
});
