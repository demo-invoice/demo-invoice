/**
 * Tests for LineItems — verifies aria-label re-indexing and button presence.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvoiceProvider } from '../../context/InvoiceContext';
import { LineItems } from './LineItems';

function renderLineItems() {
  return render(
    <InvoiceProvider>
      <LineItems />
    </InvoiceProvider>
  );
}

describe('LineItems accessibility', () => {
  it('Add line item button has correct aria-label', () => {
    renderLineItems();
    expect(screen.getByRole('button', { name: 'Add line item' })).toBeInTheDocument();
  });

  it('Add line item button is focusable when list is empty', () => {
    renderLineItems();
    const btn = screen.getByRole('button', { name: 'Add line item' });
    expect(btn).not.toBeDisabled();
  });

  it('remove buttons have correct aria-labels after adding items', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('button', { name: /remove item 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove item 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove item 3/i })).toBeInTheDocument();
  });

  it('re-indexes aria-labels when a middle row is removed', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    // Remove the second item
    fireEvent.click(screen.getByRole('button', { name: /remove item 2/i }));
    // Remaining items should be labelled 1 and 2
    expect(screen.getByRole('button', { name: /remove item 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove item 2/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove item 3/i })).not.toBeInTheDocument();
  });
});
