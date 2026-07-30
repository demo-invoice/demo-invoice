import { render } from '@testing-library/react';
import { ValidationError } from './ValidationError';

describe('ValidationError', () => {
  it('renders the container element even when no message is provided', () => {
    const { container } = render(<ValidationError id="test-error" />);
    const span = container.querySelector('#test-error');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe('');
  });

  it('renders the error message when provided', () => {
    const { container } = render(<ValidationError id="test-error" message="Required field" />);
    const span = container.querySelector('#test-error');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe('Required field');
  });

  it('uses role=alert and aria-live=assertive by default', () => {
    const { container } = render(<ValidationError id="test-error" message="Error" />);
    const span = container.querySelector('#test-error');
    expect(span).toHaveAttribute('role', 'alert');
    expect(span).toHaveAttribute('aria-live', 'assertive');
  });

  it('uses role=status and aria-live=polite when live=polite', () => {
    const { container } = render(<ValidationError id="test-error" message="Info" live="polite" />);
    const span = container.querySelector('#test-error');
    expect(span).toHaveAttribute('role', 'status');
    expect(span).toHaveAttribute('aria-live', 'polite');
  });
});
