// vi imported explicitly — globals: false
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationError } from './ValidationError';

describe('ValidationError', () => {
  it('always renders the container element', () => {
    const { container } = render(<ValidationError id="form-errors" messages={[]} />);
    const el = container.querySelector('#form-errors');
    expect(el).toBeInTheDocument();
  });

  it('has static role=alert and aria-live=assertive', () => {
    const { container } = render(<ValidationError id="form-errors" messages={[]} />);
    const el = container.querySelector('#form-errors');
    expect(el).toHaveAttribute('role', 'alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('is visually hidden when messages is empty', () => {
    const { container } = render(<ValidationError id="form-errors" messages={[]} />);
    const el = container.querySelector('#form-errors');
    expect(el?.className).toContain('visually-hidden');
  });

  it('is visible and shows messages when messages is non-empty', () => {
    render(<ValidationError id="form-errors" messages={['Client name is required']} />);
    expect(screen.getByText('Client name is required')).toBeInTheDocument();
    const { container } = render(
      <ValidationError id="form-errors-2" messages={['Client name is required']} />
    );
    const el = container.querySelector('#form-errors-2');
    expect(el?.className).not.toContain('visually-hidden');
  });

  it('renders multiple messages', () => {
    render(
      <ValidationError
        id="form-errors"
        messages={['Error one', 'Error two']}
      />
    );
    expect(screen.getByText('Error one')).toBeInTheDocument();
    expect(screen.getByText('Error two')).toBeInTheDocument();
  });
});
