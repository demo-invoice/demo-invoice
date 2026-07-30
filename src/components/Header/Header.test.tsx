import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { createDefaultState } from '../../../constants/invoice';
import { invoiceReducer } from '../../context/InvoiceContext';

describe('Header', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the New Invoice button', () => {
    const dispatch = vi.fn();
    render(<Header dispatch={dispatch} />);
    expect(screen.getByRole('button', { name: /new invoice/i })).toBeDefined();
  });

  it('does nothing when user cancels the confirm dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem');
    const dispatch = vi.fn();

    render(<Header dispatch={dispatch} />);
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    expect(removeItem).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('shows the correct confirm message', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const dispatch = vi.fn();

    render(<Header dispatch={dispatch} />);
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    expect(confirmSpy).toHaveBeenCalledWith(
      'This will clear all current invoice data. Are you sure?'
    );
  });

  it('removes localStorage and dispatches RESET_INVOICE when user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem');
    const dispatch = vi.fn();

    render(<Header dispatch={dispatch} />);
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    expect(removeItem).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_INVOICE' });
  });

  it('dispatched RESET_INVOICE action produces invoiceNumber INV-001 via reducer', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(Storage.prototype, 'removeItem');
    const dispatch = vi.fn();

    render(<Header dispatch={dispatch} />);
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    const dispatchedAction = dispatch.mock.calls[0][0] as { type: string };
    expect(dispatchedAction.type).toBe('RESET_INVOICE');

    const resultingState = invoiceReducer(
      { ...createDefaultState(), invoiceNumber: 'INV-099', fromName: 'Old Corp' },
      dispatchedAction as never
    );
    expect(resultingState.invoiceNumber).toBe('INV-001');
    expect(resultingState.fromName).toBe('');
  });

  it('does not dispatch UPDATE_FIELD or any generic string action on confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(Storage.prototype, 'removeItem');
    const dispatch = vi.fn();

    render(<Header dispatch={dispatch} />);
    fireEvent.click(screen.getByRole('button', { name: /new invoice/i }));

    expect(dispatch).toHaveBeenCalledTimes(1);
    const action = dispatch.mock.calls[0][0] as { type: string };
    expect(action.type).not.toBe('UPDATE_FIELD');
    expect(action.type).toBe('RESET_INVOICE');
  });
});
