import { InvoiceProvider } from '../context/InvoiceContext';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../components/Toolbar';

describe('Toolbar', () => {
  function renderToolbar() {
    return render(
      <InvoiceProvider>
        <Toolbar />
      </InvoiceProvider>
    );
  }

  it('renders the Download PDF button', () => {
    renderToolbar();
    expect(screen.getByRole('button', { name: /download invoice as pdf/i })).toBeInTheDocument();
  });

  it('shows validation errors when form is empty and Download PDF is clicked', () => {
    renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: /download invoice as pdf/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
