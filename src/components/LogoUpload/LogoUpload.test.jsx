import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoUpload } from './LogoUpload.jsx';
import { InvoiceProvider } from '../../context/InvoiceContext.jsx';

function renderWithContext(ui) {
  return render(<InvoiceProvider>{ui}</InvoiceProvider>);
}

function makeFile(name, type, sizeBytes) {
  const content = new Uint8Array(sizeBytes).fill(0);
  return new File([content], name, { type });
}

function getFileInput() {
  return document.querySelector('input[type="file"]');
}

describe('LogoUpload', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // --- Rendering ---

  it('renders the Upload Logo label button', () => {
    renderWithContext(<LogoUpload />);
    expect(screen.getByText('Upload Logo')).toBeInTheDocument();
  });

  it('does not show Remove Logo button when no logo is set', () => {
    renderWithContext(<LogoUpload />);
    expect(screen.queryByText('Remove Logo')).not.toBeInTheDocument();
  });

  it('hides the native file input visually (has logo-upload__input class)', () => {
    renderWithContext(<LogoUpload />);
    const input = getFileInput();
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('logo-upload__input');
  });

  it('file input accept attribute includes PNG, JPEG, and SVG MIME types', () => {
    renderWithContext(<LogoUpload />);
    const input = getFileInput();
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg,image/svg+xml,.svg');
  });

  it('file input is associated with the Upload Logo label via htmlFor/id', () => {
    renderWithContext(<LogoUpload />);
    const input = getFileInput();
    const label = screen.getByText('Upload Logo');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('file input has aria-describedby pointing to the error container', () => {
    renderWithContext(<LogoUpload />);
    const input = getFileInput();
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId)).toBeInTheDocument();
  });

  // --- Validation: MIME type ---

  it('shows an error for an unsupported MIME type (PDF)', () => {
    renderWithContext(<LogoUpload />);
    const file = makeFile('doc.pdf', 'application/pdf', 100);
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Invalid file type. Please upload a PNG, JPEG, or SVG image.'
    );
  });

  it('shows an error for an unsupported MIME type (GIF)', () => {
    renderWithContext(<LogoUpload />);
    const file = makeFile('anim.gif', 'image/gif', 100);
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid file type');
  });

  it('does not invoke FileReader for an invalid MIME type', () => {
    const spy = vi.spyOn(globalThis, 'FileReader');
    renderWithContext(<LogoUpload />);
    const file = makeFile('doc.pdf', 'application/pdf', 100);
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    expect(spy).not.toHaveBeenCalled();
  });

  // --- Validation: file size ---

  it('shows an error when file exceeds 2 MB', () => {
    renderWithContext(<LogoUpload />);
    const file = makeFile('big.png', 'image/png', 2 * 1024 * 1024 + 1);
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'File is too large. Maximum size is 2 MB.'
    );
  });

  it('does not invoke FileReader when file exceeds 2 MB', () => {
    const spy = vi.spyOn(globalThis, 'FileReader');
    renderWithContext(<LogoUpload />);
    const file = makeFile('big.png', 'image/png', 2 * 1024 * 1024 + 1);
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    expect(spy).not.toHaveBeenCalled();
  });

  it('accepts a file exactly at the 2 MB boundary without error', async () => {
    const mockReader = {
      readAsDataURL: vi.fn(),
      onload: null,
      onerror: null,
      result: 'data:image/png;base64,abc',
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    const file = makeFile('exact.png', 'image/png', 2 * 1024 * 1024);
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    mockReader.onload();

    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(file);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // --- SVG extension fallback ---

  it('accepts SVG files with empty MIME type via .svg extension fallback', () => {
    const mockReader = {
      readAsDataURL: vi.fn(),
      onload: null,
      onerror: null,
      result: 'data:image/svg+xml;base64,abc',
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    const file = makeFile('logo.svg', '', 500);
    fireEvent.change(getFileInput(), { target: { files: [file] } });

    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(file);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('accepts SVG files with the correct image/svg+xml MIME type', () => {
    const mockReader = {
      readAsDataURL: vi.fn(),
      onload: null,
      onerror: null,
      result: 'data:image/svg+xml;base64,abc',
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    const file = makeFile('logo.svg', 'image/svg+xml', 500);
    fireEvent.change(getFileInput(), { target: { files: [file] } });

    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(file);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // --- FileReader integration ---

  it('calls FileReader.readAsDataURL with the selected file for a valid PNG', () => {
    const mockReader = {
      readAsDataURL: vi.fn(),
      onload: null,
      onerror: null,
      result: 'data:image/png;base64,abc',
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    const file = makeFile('photo.png', 'image/png', 100);
    fireEvent.change(getFileInput(), { target: { files: [file] } });

    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(file);
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
    const file = makeFile('photo.jpg', 'image/jpeg', 100);
    fireEvent.change(getFileInput(), { target: { files: [file] } });

    // The source code assigns reader.onerror after fireEvent.change;
    // invoke it now to simulate a FileReader read failure.
    if (typeof mockReader.onerror === 'function') {
      mockReader.onerror();
    }

    expect(
      await screen.findByText('Could not read file. Please try again.')
    ).toBeInTheDocument();
  });

  // --- Empty file list (picker cancelled) ---

  it('is a no-op when the file picker is cancelled (empty files list)', () => {
    renderWithContext(<LogoUpload />);
    fireEvent.change(getFileInput(), { target: { files: [] } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // --- Error clearing ---

  it('clears the error message when a subsequent valid file is selected', async () => {
    const mockReader = {
      readAsDataURL: vi.fn(),
      onload: null,
      onerror: null,
      result: 'data:image/png;base64,abc',
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    // First: trigger an error
    const badFile = makeFile('doc.pdf', 'application/pdf', 100);
    fireEvent.change(getFileInput(), { target: { files: [badFile] } });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Then: select a valid file
    const goodFile = makeFile('logo.png', 'image/png', 100);
    fireEvent.change(getFileInput(), { target: { files: [goodFile] } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // --- Remove Logo ---

  it('shows Remove Logo button after a valid logo is loaded into context', async () => {
    const mockReader = {
      readAsDataURL: vi.fn(),
      onload: null,
      onerror: null,
      result: 'data:image/png;base64,abc',
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    const file = makeFile('logo.png', 'image/png', 100);
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    mockReader.onload();

    await waitFor(() =>
      expect(screen.getByText('Remove Logo')).toBeInTheDocument()
    );
  });

  it('hides Remove Logo button and clears error after clicking Remove Logo', async () => {
    const mockReader = {
      readAsDataURL: vi.fn(),
      onload: null,
      onerror: null,
      result: 'data:image/png;base64,abc',
      abort: vi.fn(),
    };
    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);

    renderWithContext(<LogoUpload />);
    const file = makeFile('logo.png', 'image/png', 100);
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    mockReader.onload();

    await waitFor(() => screen.getByText('Remove Logo'));
    fireEvent.click(screen.getByText('Remove Logo'));

    expect(screen.queryByText('Remove Logo')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears error message when Remove Logo is clicked', async () => {
    // Seed context with a logo so Remove Logo is visible
    localStorage.setItem('invoice_logo', 'data:image/png;base64,seeded');

    renderWithContext(<LogoUpload />);

    // Trigger a validation error
    const badFile = makeFile('doc.pdf', 'application/pdf', 100);
    fireEvent.change(getFileInput(), { target: { files: [badFile] } });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Remove Logo'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // --- Accessibility ---

  it('error span has role="alert" and aria-live="assertive"', () => {
    renderWithContext(<LogoUpload />);
    const file = makeFile('doc.pdf', 'application/pdf', 100);
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
