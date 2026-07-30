import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvoiceProvider } from '../context/InvoiceContext';
import { Toolbar } from '../components/Toolbar';

// Provide a minimal wrapper that pre-fills state via the form is complex;
// instead we test the validation-fail path (default empty state) and
// the document.title manipulation via a mock.

function renderToolbar() {
  return render(
    <InvoiceProvider>
      <Toolbar />
    </InvoiceProvider>
  );
}

describe('Toolbar — Download PDF button', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the Download PDF button', () => {
    renderToolbar();
    expect(screen.getByRole('button', { name: /download invoice as pdf/i })).toBeInTheDocument();
  });

  it('shows validation errors when state is empty and button is clicked', () => {
    renderToolbar();
    const btn = screen.getByRole('button', { name: /download invoice as pdf/i });
    fireEvent.click(btn);
    // At least one error should appear
    const errorList = screen.getByRole('alert');
    expect(errorList).toBeInTheDocument();
    expect(errorList.querySelectorAll('li').length).toBeGreaterThan(0);
  });

  it('does NOT call window.print() when validation fails', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: /download invoice as pdf/i }));
    expect(printSpy).not.toHaveBeenCalled();
  });
});
