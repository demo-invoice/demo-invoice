// vi imported explicitly — globals: false
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { LineItems } from './LineItems';

const wrapper = ({ children }: { children: ReactNode }) => (
  <InvoiceProvider>{children}</InvoiceProvider>
);

describe('LineItems', () => {
  it('renders the Add line item button with correct aria-label', () => {
    render(<LineItems />, { wrapper });
    expect(
      screen.getByRole('button', { name: 'Add line item' })
    ).toBeInTheDocument();
  });

  it('renders the line items section with accessible label', () => {
    render(<LineItems />, { wrapper });
    expect(screen.getByRole('region', { name: 'Line items' })).toBeInTheDocument();
  });

  it('adds a row when Add line item is clicked', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByLabelText('Description for item 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity for item 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate for item 1')).toBeInTheDocument();
  });

  it('renders table headers after adding an item', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Quantity' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Rate' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
  });

  it('Remove button has aria-label "Remove item 1" when description is empty', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeInTheDocument();
  });

  it('Remove button uses description in aria-label when description is set', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    await user.type(screen.getByLabelText('Description for item 1'), 'Widget');
    expect(screen.getByRole('button', { name: 'Remove Widget' })).toBeInTheDocument();
  });

  it('removes a row when Remove is clicked', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    await user.click(screen.getByRole('button', { name: 'Remove item 1' }));
    expect(screen.queryByLabelText('Description for item 1')).not.toBeInTheDocument();
  });

  it('labels for second item use index 2', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    await user.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByLabelText('Description for item 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity for item 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Rate for item 2')).toBeInTheDocument();
  });
});
