/**
 * Tests for ValidationError — verifies the always-in-DOM contract.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationError } from './ValidationError';

describe('ValidationError', () => {
  it('renders an empty span when no message is provided', () => {
    render(<ValidationError id="test-error" />);
    const span = document.getElementById('test-error');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe('');
  });

  it('renders the error message when provided', () => {
    render(<ValidationError id="test-error" message="This field is required." />);
    expect(screen.getByText('This field is required.')).toBeInTheDocument();
  });

  it('span id is stable regardless of message presence', () => {
    const { rerender } = render(<ValidationError id="stable-id" />);
    expect(document.getElementById('stable-id')).toBeInTheDocument();
    rerender(<ValidationError id="stable-id" message="Error!" />);
    expect(document.getElementById('stable-id')).toBeInTheDocument();
    expect(document.getElementById('stable-id')?.textContent).toBe('Error!');
  });

  it('is aria-hidden when no message', () => {
    render(<ValidationError id="test-error" />);
    expect(document.getElementById('test-error')).toHaveAttribute('aria-hidden', 'true');
  });

  it('is not aria-hidden when message is present', () => {
    render(<ValidationError id="test-error" message="Oops" />);
    expect(document.getElementById('test-error')).toHaveAttribute('aria-hidden', 'false');
  });
});
