import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoUpload } from './LogoUpload.jsx';
import { InvoiceProvider } from '../../context/InvoiceContext.jsx';

/** Wrap component under test with required context. */
function renderWithContext(ui) {
  return render(<InvoiceProvider>{ui}</InvoiceProvider>);
}

/** Build a synthetic File object. */
function makeFile(name, type, sizeBytes) {
  const content = new Uint8Array(sizeBytes).fill(0);
  return new File([content], name, { type });
}

describe('LogoUpload', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the Upload Logo button', () => {
    renderWithContext(<LogoUpload />);
    expect(screen.getByText('Upload Logo')).toBeInTheDocument();
  });

  it('does not show Remove Logo button when no logo is set', () => {
    renderWithContext(<LogoUpload />);
    expect(screen.queryByText('Remove Logo')).not.toBeInTheDocument();
  });

  it('shows an error for an invalid MIME type', () => {
    renderWithContext(<LogoUpload />);
    const input = screen.getByRole('textbox', { hidden: true }) ??
      document.querySelector('input[type="file"]');
    const file = makeFile('doc.pdf', 'application/pdf', 100);
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Invalid file type'
    );
  });

  it('shows an error when file exceeds 2 MB', () => {
    renderWithContext(<LogoUpload />);
    const input = document.querySelector('input[type="file"]');
    const file = makeFile('big.png', 'image/png', 2 * 1024 * 1024 + 1);
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent('too large');
  });

  it('accepts a file exactly at the 2 MB boundary', async () => {
    // Mock FileReader so we don't need real binary data.
    const mockReadAsDataURL = vi.fn();
    const mockReader = {
      readAsDataURL: mockReadAsDataURL,
      onload: null,
      onerror: null,
      result: 'data:image/png;base64,abc',
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    const input = document.querySelector('input[type="file"]');
    const file = makeFile('exact.png', 'image/png', 2 * 1024 * 1024);
    fireEvent.change(input, { target: { files: [file] } });

    // Simulate FileReader completing.
    mockReader.onload();

    expect(mockReadAsDataURL).toHaveBeenCalledWith(file);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('accepts SVG files with empty MIME type via extension fallback', () => {
    const mockReadAsDataURL = vi.fn();
    const mockReader = {
      readAsDataURL: mockReadAsDataURL,
      onload: null,
      onerror: null,
      result: 'data:image/svg+xml;base64,abc',
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    const input = document.querySelector('input[type="file"]');
    // Empty MIME type simulates the browser SVG edge-case.
    const file = makeFile('logo.svg', '', 500);
    fireEvent.change(input, { target: { files: [file] } });

    expect(mockReadAsDataURL).toHaveBeenCalledWith(file);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a generic error when FileReader fires onerror', async () => {
    const mockReader = {
      readAsDataURL: vi.fn(),
      onload: null,
      onerror: null,
      result: null,
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    const input = document.querySelector('input[type="file"]');
    const file = makeFile('photo.jpg', 'image/jpeg', 100);
    fireEvent.change(input, { target: { files: [file] } });

    mockReader.onerror();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not read file')
    );
  });

  it('is a no-op when the file picker is cancelled (empty files list)', () => {
    renderWithContext(<LogoUpload />);
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
