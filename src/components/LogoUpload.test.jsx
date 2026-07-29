import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LogoUpload } from './LogoUpload.jsx';
import { InvoiceContextProvider } from '../context/InvoiceContext.jsx';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wraps LogoUpload in the required context provider. */
function renderWithContext() {
  return render(
    <InvoiceContextProvider>
      <LogoUpload />
    </InvoiceContextProvider>
  );
}

/**
 * Creates a fake File object.
 * @param {string} name
 * @param {string} type
 * @param {number} size - byte size
 */
function makeFile(name, type, size) {
  const content = new Uint8Array(size).fill(0);
  return new File([content], name, { type });
}

/** Fake FileReader that immediately calls onload with a data URL. */
function mockFileReaderSuccess(dataUrl) {
  const MockFileReader = vi.fn().mockImplementation(function () {
    this.readAsDataURL = vi.fn().mockImplementation(function () {
      // Simulate async completion
      setTimeout(() => {
        this.onload?.({ target: { result: dataUrl } });
      }, 0);
    });
    this.onerror = null;
    this.onload = null;
  });
  vi.stubGlobal('FileReader', MockFileReader);
  return MockFileReader;
}

/** Fake FileReader that immediately calls onerror. */
function mockFileReaderError() {
  const MockFileReader = vi.fn().mockImplementation(function () {
    this.readAsDataURL = vi.fn().mockImplementation(function () {
      setTimeout(() => {
        this.onerror?.();
      }, 0);
    });
    this.onerror = null;
    this.onload = null;
  });
  vi.stubGlobal('FileReader', MockFileReader);
  return MockFileReader;
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LogoUpload', () => {
  // AC1: accept attribute
  it('has accept attribute exactly "image/png,image/jpeg,image/svg+xml"', () => {
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    expect(input.getAttribute('accept')).toBe('image/png,image/jpeg,image/svg+xml');
  });

  // AC9: ARIA live region always present
  it('renders the ARIA live region div with role=alert and aria-live=assertive at all times', () => {
    renderWithContext();
    const liveRegion = document.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion.textContent).toBe('');
  });

  // AC8: 2 MB size cap — file over limit is rejected
  it('rejects files larger than 2 MB and shows error in live region without updating logo', async () => {
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    const bigFile = makeFile('big.png', 'image/png', 2 * 1024 * 1024 + 1);

    fireEvent.change(input, { target: { files: [bigFile] } });

    const liveRegion = document.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toMatch(/2 MB/);
    // Logo img should not appear
    expect(screen.queryByRole('img', { name: /logo preview/i })).toBeNull();
  });

  // AC8: file exactly at 2 MB boundary is accepted
  it('accepts a file exactly at the 2 MB boundary', async () => {
    const dataUrl = 'data:image/png;base64,abc123';
    mockFileReaderSuccess(dataUrl);
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    const exactFile = makeFile('exact.png', 'image/png', 2 * 1024 * 1024);

    fireEvent.change(input, { target: { files: [exactFile] } });

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /logo preview/i })).toBeInTheDocument();
    });
    const liveRegion = document.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toBe('');
  });

  // AC1 / validation: invalid MIME type is rejected
  it('rejects files with an unsupported MIME type', () => {
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    const badFile = makeFile('doc.pdf', 'application/pdf', 1024);

    fireEvent.change(input, { target: { files: [badFile] } });

    const liveRegion = document.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toMatch(/PNG, JPEG.*SVG/i);
  });

  // AC3: SVG with empty MIME type accepted via extension fallback
  it('accepts an SVG file that has an empty MIME type (extension fallback)', async () => {
    const dataUrl = 'data:image/svg+xml;base64,PHN2Zy8+';
    mockFileReaderSuccess(dataUrl);
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    // Simulate browser reporting empty MIME for SVG
    const svgFile = makeFile('logo.svg', '', 512);

    fireEvent.change(input, { target: { files: [svgFile] } });

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /logo preview/i })).toBeInTheDocument();
    });
    const liveRegion = document.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toBe('');
  });

  // AC4 / valid PNG upload triggers FileReader and updates context
  it('reads a valid PNG and displays the logo preview', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    const pngFile = makeFile('logo.png', 'image/png', 1024);

    fireEvent.change(input, { target: { files: [pngFile] } });

    await waitFor(() => {
      const img = screen.getByRole('img', { name: /logo preview/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', dataUrl);
    });
  });

  // AC4 / valid JPEG upload
  it('reads a valid JPEG and displays the logo preview', async () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQ=';
    mockFileReaderSuccess(dataUrl);
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    const jpgFile = makeFile('photo.jpg', 'image/jpeg', 2048);

    fireEvent.change(input, { target: { files: [jpgFile] } });

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /logo preview/i })).toBeInTheDocument();
    });
  });

  // AC6: Remove Logo clears logo and error
  it('clears the logo and error when Remove Logo is clicked', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    const pngFile = makeFile('logo.png', 'image/png', 1024);

    fireEvent.change(input, { target: { files: [pngFile] } });

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /logo preview/i })).toBeInTheDocument();
    });

    const removeBtn = screen.getByRole('button', { name: /remove logo/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByRole('img', { name: /logo preview/i })).toBeNull();
    const liveRegion = document.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toBe('');
  });

  // AC7: localStorage persistence on upload
  it('writes the logo data URL to localStorage on upload', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    const pngFile = makeFile('logo.png', 'image/png', 1024);

    fireEvent.change(input, { target: { files: [pngFile] } });

    await waitFor(() => {
      expect(localStorage.getItem('invoice_logo')).toBe(dataUrl);
    });
  });

  // AC7: localStorage cleared on remove
  it('removes the logo from localStorage when Remove Logo is clicked', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    const pngFile = makeFile('logo.png', 'image/png', 1024);

    fireEvent.change(input, { target: { files: [pngFile] } });
    await waitFor(() => expect(localStorage.getItem('invoice_logo')).toBe(dataUrl));

    fireEvent.click(screen.getByRole('button', { name: /remove logo/i }));
    expect(localStorage.getItem('invoice_logo')).toBeNull();
  });

  // AC8 / rehydration: component reads logo from localStorage on mount
  it('rehydrates logo from localStorage on mount', () => {
    const storedUrl = 'data:image/png;base64,storedData';
    localStorage.setItem('invoice_logo', storedUrl);

    renderWithContext();

    const img = screen.getByRole('img', { name: /logo preview/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', storedUrl);
  });

  // FileReader error is surfaced in live region
  it('shows an error in the live region when FileReader fails', async () => {
    mockFileReaderError();
    renderWithContext();
    const input = document.querySelector('input[type="file"]');
    const pngFile = makeFile('logo.png', 'image/png', 1024);

    fireEvent.change(input, { target: { files: [pngFile] } });

    await waitFor(() => {
      const liveRegion = document.querySelector('[role="alert"][aria-live="assertive"]');
      expect(liveRegion.textContent).toMatch(/failed to read/i);
    });
  });
});
