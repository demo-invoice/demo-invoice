import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LogoUpload } from './LogoUpload.jsx';
import { InvoiceProvider } from '../../context/InvoiceContext.jsx';

// ---------------------------------------------------------------------------
// FileReader mock
// ---------------------------------------------------------------------------
let mockReader;

beforeEach(() => {
  mockReader = {
    readAsDataURL: vi.fn(),
    onload: null,
    onerror: null,
    result: 'data:image/png;base64,abc123',
  };
  vi.spyOn(globalThis, 'FileReader').mockImplementation(() => mockReader);
});

function renderComponent() {
  return render(
    <InvoiceProvider>
      <LogoUpload />
    </InvoiceProvider>
  );
}

describe('LogoUpload', () => {
  it('renders the upload button', () => {
    renderComponent();
    expect(screen.getByText('Upload Logo')).toBeInTheDocument();
  });

  it('does not show an error initially', () => {
    renderComponent();
    const alert = screen.getByRole('alert');
    expect(alert).toBeEmptyDOMElement();
  });

  it('shows an error for invalid file types and does NOT call FileReader', () => {
    renderComponent();
    const input = screen.getByRole('textbox', { hidden: true }) ||
      document.querySelector('input[type="file"]');
    const fileInput = document.querySelector('input[type="file"]');

    const invalidFile = new File(['content'], 'logo.gif', { type: 'image/gif' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(FileReader).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      /invalid file type/i
    );
  });

  it('reads a valid PNG file and calls setLogoDataUrl', () => {
    renderComponent();
    const fileInput = document.querySelector('input[type="file"]');

    const validFile = new File(['content'], 'logo.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(FileReader).toHaveBeenCalledTimes(1);
    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(validFile);

    // Simulate the FileReader completing
    mockReader.onload({ target: mockReader });

    // The logo should now be stored (no error shown)
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('reads a valid JPEG file', () => {
    renderComponent();
    const fileInput = document.querySelector('input[type="file"]');

    const validFile = new File(['content'], 'logo.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(FileReader).toHaveBeenCalledTimes(1);
    mockReader.onload({ target: mockReader });
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('reads a valid SVG file by extension', () => {
    renderComponent();
    const fileInput = document.querySelector('input[type="file"]');

    // SVG files may have type '' in some environments
    const validFile = new File(['<svg/>'], 'logo.svg', { type: '' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(FileReader).toHaveBeenCalledTimes(1);
    mockReader.onload({ target: mockReader });
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('shows an error when FileReader fails', () => {
    renderComponent();
    const fileInput = document.querySelector('input[type="file"]');

    const validFile = new File(['content'], 'logo.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate a FileReader error
    mockReader.onerror(new Event('error'));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /failed to read/i
    );
  });
});
