import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LineItems } from './LineItems';
import { InvoiceProvider } from '../../context/InvoiceContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <InvoiceProvider>{children}</InvoiceProvider>
);

describe('LineItems', () => {
  it('renders empty state message', () => {
    render(<LineItems />, { wrapper });
    expect(screen.getByText(/No line items yet/i)).toBeInTheDocument();
  });

  it('adds a row when Add item is clicked', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByLabelText('Description for item 1')).toBeInTheDocument();
  });

  it('types into description field', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    await user.type(screen.getByLabelText('Description for item 1'), 'Widget');
    expect(screen.getByRole('button', { name: 'Remove Widget' })).toBeInTheDocument();
  });

  it('removes a row when Remove is clicked', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    await user.click(screen.getByRole('button', { name: 'Remove item 1' }));
    expect(screen.queryByLabelText('Description for item 1')).not.toBeInTheDocument();
  });

  it('labels for second item use index 2', async () => {
    const user = userEvent.setup();
    render(<LineItems />, { wrapper });
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByLabelText('Description for item 2')).toBeInTheDocument();
  });
});
