import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationError } from './ValidationError';

describe('ValidationError', () => {
  it('is always present in the DOM even with no message', () => {
    const { container } = render(<ValidationError id="test-error" />);
    expect(container.querySelector('#test-error')).toBeInTheDocument();
  });

  it('renders empty string when message is undefined', () => {
    const { container } = render(<ValidationError id="test-error" />);
    expect(container.querySelector('#test-error')!.textContent).toBe('');
  });

  it('displays the error message text', () => {
    const { container } = render(<ValidationError id="test-error" message="This field is required." />);
    expect(container.querySelector('#test-error')!.textContent).toBe('This field is required.');
  });

  it('has role="alert" and aria-live="assertive" by default', () => {
    const { container } = render(<ValidationError id="test-error" message="Error" />);
    const el = container.querySelector('#test-error')!;
    expect(el).toHaveAttribute('role', 'alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('has role="status" and aria-live="polite" when live="polite"', () => {
    const { container } = render(<ValidationError id="test-error" message="Info" live="polite" />);
    const el = container.querySelector('#test-error')!;
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('updates text content without remounting the element', () => {
    const { container, rerender } = render(<ValidationError id="test-error" message="First error" />);
    const el = container.querySelector('#test-error')!;
    rerender(<ValidationError id="test-error" message="Second error" />);
    expect(container.querySelector('#test-error')).toBe(el);
    expect(el.textContent).toBe('Second error');
  });

  it('clears text when message becomes undefined', () => {
    const { container, rerender } = render(<ValidationError id="test-error" message="Error" />);
    rerender(<ValidationError id="test-error" />);
    expect(container.querySelector('#test-error')!.textContent).toBe('');
  });

  it('element remains in DOM after message is cleared', () => {
    const { container, rerender } = render(<ValidationError id="test-error" message="Error" />);
    rerender(<ValidationError id="test-error" />);
    expect(container.querySelector('#test-error')).toBeInTheDocument();
  });
});
