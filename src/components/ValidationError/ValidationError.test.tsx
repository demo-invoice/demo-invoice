import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationError } from './ValidationError';

describe('ValidationError', () => {
  it('is always present in the DOM even with no message', () => {
    render(<ValidationError id="test-error" />);
    const el = document.getElementById('test-error');
    expect(el).toBeInTheDocument();
  });

  it('renders empty string when message is undefined', () => {
    render(<ValidationError id="test-error" />);
    const el = document.getElementById('test-error')!;
    expect(el.textContent).toBe('');
  });

  it('displays the error message', () => {
    render(<ValidationError id="test-error" message="This field is required." />);
    expect(screen.getByText('This field is required.')).toBeInTheDocument();
  });

  it('has role="alert" and aria-live="assertive" by default', () => {
    render(<ValidationError id="test-error" message="Error" />);
    const el = document.getElementById('test-error')!;
    expect(el).toHaveAttribute('role', 'alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('has role="status" and aria-live="polite" when live="polite"', () => {
    render(<ValidationError id="test-error" message="Info" live="polite" />);
    const el = document.getElementById('test-error')!;
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('updates text content without remounting the element', () => {
    const { rerender } = render(<ValidationError id="test-error" message="First error" />);
    const el = document.getElementById('test-error')!;
    rerender(<ValidationError id="test-error" message="Second error" />);
    // Same DOM node — not remounted
    expect(document.getElementById('test-error')).toBe(el);
    expect(el.textContent).toBe('Second error');
  });

  it('clears text when message becomes undefined', () => {
    const { rerender } = render(<ValidationError id="test-error" message="Error" />);
    rerender(<ValidationError id="test-error" />);
    const el = document.getElementById('test-error')!;
    expect(el.textContent).toBe('');
  });
});
