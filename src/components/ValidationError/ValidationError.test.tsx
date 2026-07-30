/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { ValidationError } from './ValidationError';

describe('ValidationError', () => {
  it('renders the error message when provided', () => {
    render(<ValidationError id="test-error" message="This field is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'test-error');
  });

  it('renders an empty live region when no message is provided', () => {
    render(<ValidationError id="test-error-empty" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('');
  });
});
