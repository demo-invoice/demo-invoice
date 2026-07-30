/**
 * Tests for LineItems — verifies aria-label re-indexing, button presence,
 * label associations, and aria-describedby wiring.
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
  it('renders the "Add line item" button with the correct aria-label', () => {
    renderLineItems();
    expect(screen.getByRole('button', { name: 'Add line item' })).toBeInTheDocument();
  });

  it('"Add line item" button is not disabled when the list is empty', () => {
    renderLineItems();
    expect(screen.getByRole('button', { name: 'Add line item' })).not.toBeDisabled();
  });

  it('remove buttons have aria-labels matching "Remove item {n}" for each row', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('button', { name: /remove item 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove item 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove item 3/i })).toBeInTheDocument();
  });

  it('re-indexes remove button aria-labels when a middle row is deleted', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    // Remove the second item
    fireEvent.click(screen.getByRole('button', { name: /remove item 2/i }));
    // Remaining two rows must be labelled 1 and 2 — not 1 and 3
    expect(screen.getByRole('button', { name: /remove item 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove item 2/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove item 3/i })).not.toBeInTheDocument();
  });

  it('re-indexes remove button aria-labels when the first row is deleted', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    fireEvent.click(screen.getByRole('button', { name: /remove item 1/i }));
    expect(screen.getByRole('button', { name: /remove item 1/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove item 2/i })).not.toBeInTheDocument();
  });

  it('each description input has a programmatically associated label', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    // The label text contains "Description for item 1" — getByLabelText resolves via htmlFor/id
    expect(screen.getByLabelText(/description for item 1/i)).toBeInTheDocument();
  });

  it('each quantity input has a programmatically associated label', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByLabelText(/quantity for item 1/i)).toBeInTheDocument();
  });

  it('each rate input has a programmatically associated label', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByLabelText(/rate for item 1/i)).toBeInTheDocument();
  });

  it('description input has aria-describedby pointing to an element in the DOM', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    const input = screen.getByLabelText(/description for item 1/i);
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toBeInTheDocument();
  });

  it('quantity input has aria-describedby pointing to an element in the DOM', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    const input = screen.getByLabelText(/quantity for item 1/i);
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toBeInTheDocument();
  });

  it('rate input has aria-describedby pointing to an element in the DOM', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    const input = screen.getByLabelText(/rate for item 1/i);
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toBeInTheDocument();
  });

  it('shows validation error message when errors prop is supplied', () => {
    let itemId: string;
    const { rerender } = render(
      <InvoiceProvider>
        <LineItems />
      </InvoiceProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    // Grab the id from the description input's aria-describedby
    const descInput = screen.getByLabelText(/description for item 1/i);
    const errorSpanId = descInput.getAttribute('aria-describedby')!;
    // Extract the line-item id from the error span id: "line-item-{id}-description-error"
    itemId = errorSpanId.replace('line-item-', '').replace('-description-error', '');
    rerender(
      <InvoiceProvider>
        <LineItems errors={{ [itemId]: { description: 'Description is required.' } }} />
      </InvoiceProvider>
    );
    expect(screen.getByText('Description is required.')).toBeInTheDocument();
    expect(descInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('section is labelled by the "Line Items" heading', () => {
    renderLineItems();
    expect(screen.getByRole('region', { name: /line items/i })).toBeInTheDocument();
  });

  it('table column headers are present when rows exist', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /quantity/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /rate/i })).toBeInTheDocument();
  });

  it('remove button label uses item description when description is filled in', () => {
    renderLineItems();
    fireEvent.click(screen.getByRole('button', { name: 'Add line item' }));
    const descInput = screen.getByLabelText(/description for item 1/i);
    fireEvent.change(descInput, { target: { value: 'Widget' } });
    // aria-label should now be "Remove Widget"
    expect(screen.getByRole('button', { name: 'Remove Widget' })).toBeInTheDocument();
  });
});
