import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LogoUpload } from './LogoUpload.jsx';
import { InvoiceContextProvider } from '../context/InvoiceContext.jsx';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wraps LogoUpload in the required context provider. */
function renderWithContext() {
  const utils = render(
    <InvoiceContextProvider>
      <LogoUpload />
    </InvoiceContextProvider>
  );
  return utils;
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

/** Stubs FileReader to call onload with the given data URL after a tick. */
function mockFileReaderSuccess(dataUrl) {
  const MockFileReader = vi.fn().mockImplementation(function () {
    this.readAsDataURL = vi.fn().mockImplementation(function () {
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

/** Stubs FileReader to call onerror after a tick. */
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

  // ── AC1: accept attribute ─────────────────────────────────────────────────

  it('renders a hidden file input with accept exactly "image/png,image/jpeg,image/svg+xml"', () => {
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    expect(input.getAttribute('accept')).toBe('image/png,image/jpeg,image/svg+xml');
  });

  it('renders the Upload Logo button', () => {
    const { container } = renderWithContext();
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Upload Logo');
  });

  // ── AC9: ARIA live region always present ──────────────────────────────────

  it('renders the ARIA live region with role=alert and aria-live=assertive at all times', () => {
    const { container } = renderWithContext();
    const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion).not.toBeNull();
  });

  it('ARIA live region is empty on initial render (no error)', () => {
    const { container } = renderWithContext();
    const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toBe('');
  });

  // ── Initial placeholder ───────────────────────────────────────────────────

  it('shows the grey placeholder with aria-label "Logo placeholder" when no logo is set', () => {
    const { container } = renderWithContext();
    const placeholder = container.querySelector('[aria-label="Logo placeholder"]');
    expect(placeholder).not.toBeNull();
    expect(placeholder.textContent).toBe('No logo');
  });

  it('does not render a logo image when no logo is set', () => {
    const { container } = renderWithContext();
    expect(container.querySelector('img')).toBeNull();
  });

  it('does not render the Remove Logo button when no logo is set', () => {
    renderWithContext();
    expect(screen.queryByRole('button', { name: /remove logo/i })).toBeNull();
  });

  // ── Size validation ───────────────────────────────────────────────────────

  it('rejects a file larger than 2 MB and shows error text in the live region', () => {
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');
    const bigFile = makeFile('big.png', 'image/png', 2 * 1024 * 1024 + 1);

    fireEvent.change(input, { target: { files: [bigFile] } });

    const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toMatch(/2 MB/);
  });

  it('does not render a logo image after a file-too-large rejection', () => {
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');
    const bigFile = makeFile('big.png', 'image/png', 2 * 1024 * 1024 + 1);

    fireEvent.change(input, { target: { files: [bigFile] } });

    expect(container.querySelector('img')).toBeNull();
  });

  it('accepts a file exactly at the 2 MB boundary (no error, logo shown)', async () => {
    const dataUrl = 'data:image/png;base64,abc123';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');
    const exactFile = makeFile('exact.png', 'image/png', 2 * 1024 * 1024);

    fireEvent.change(input, { target: { files: [exactFile] } });

    await waitFor(() => {
      expect(container.querySelector('img[alt="Business logo preview"]')).not.toBeNull();
    });
    const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toBe('');
  });

  // ── MIME / type validation ────────────────────────────────────────────────

  it('rejects a file with an unsupported MIME type and shows error in live region', () => {
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');
    const badFile = makeFile('doc.pdf', 'application/pdf', 1024);

    fireEvent.change(input, { target: { files: [badFile] } });

    const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toMatch(/PNG, JPEG.*SVG/i);
  });

  it('accepts an SVG file that reports an empty MIME type (extension fallback)', async () => {
    const dataUrl = 'data:image/svg+xml;base64,PHN2Zy8+';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');
    const svgFile = makeFile('logo.svg', '', 512);

    fireEvent.change(input, { target: { files: [svgFile] } });

    await waitFor(() => {
      expect(container.querySelector('img[alt="Business logo preview"]')).not.toBeNull();
    });
    const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toBe('');
  });

  // ── Valid uploads ─────────────────────────────────────────────────────────

  it('reads a valid PNG via FileReader and displays the logo preview image', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');
    const pngFile = makeFile('logo.png', 'image/png', 1024);

    fireEvent.change(input, { target: { files: [pngFile] } });

    await waitFor(() => {
      const img = container.querySelector('img[alt="Business logo preview"]');
      expect(img).not.toBeNull();
      expect(img.getAttribute('src')).toBe(dataUrl);
    });
  });

  it('reads a valid JPEG via FileReader and displays the logo preview image', async () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQ=';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');
    const jpgFile = makeFile('photo.jpg', 'image/jpeg', 2048);

    fireEvent.change(input, { target: { files: [jpgFile] } });

    await waitFor(() => {
      expect(container.querySelector('img[alt="Business logo preview"]')).not.toBeNull();
    });
  });

  it('reads a valid SVG (with correct MIME) via FileReader and displays the logo preview image', async () => {
    const dataUrl = 'data:image/svg+xml;base64,PHN2Zy8+';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');
    const svgFile = makeFile('icon.svg', 'image/svg+xml', 256);

    fireEvent.change(input, { target: { files: [svgFile] } });

    await waitFor(() => {
      expect(container.querySelector('img[alt="Business logo preview"]')).not.toBeNull();
    });
  });

  it('clears the error message after a successful upload', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');

    // First trigger an error
    fireEvent.change(input, { target: { files: [makeFile('bad.pdf', 'application/pdf', 512)] } });
    const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).not.toBe('');

    // Then upload a valid file
    fireEvent.change(input, { target: { files: [makeFile('logo.png', 'image/png', 1024)] } });

    await waitFor(() => {
      expect(container.querySelector('img[alt="Business logo preview"]')).not.toBeNull();
    });
    expect(liveRegion.textContent).toBe('');
  });

  // ── Image display constraints ─────────────────────────────────────────────

  it('renders the logo image with maxWidth 160px, maxHeight 80px, and objectFit contain', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [makeFile('logo.png', 'image/png', 1024)] } });

    await waitFor(() => {
      const img = container.querySelector('img[alt="Business logo preview"]');
      expect(img).not.toBeNull();
      expect(img.style.maxWidth).toBe('160px');
      expect(img.style.maxHeight).toBe('80px');
      expect(img.style.objectFit).toBe('contain');
    });
  });

  // ── Remove Logo ───────────────────────────────────────────────────────────

  it('shows the Remove Logo button after a successful upload', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    renderWithContext();
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [makeFile('logo.png', 'image/png', 1024)] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove logo/i })).toBeInTheDocument();
    });
  });

  it('clicking Remove Logo hides the logo image and restores the placeholder', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [makeFile('logo.png', 'image/png', 1024)] } });
    await waitFor(() => {
      expect(container.querySelector('img[alt="Business logo preview"]')).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: /remove logo/i }));

    expect(container.querySelector('img[alt="Business logo preview"]')).toBeNull();
    expect(container.querySelector('[aria-label="Logo placeholder"]')).not.toBeNull();
  });

  it('clicking Remove Logo clears any existing error in the live region', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [makeFile('logo.png', 'image/png', 1024)] } });
    await waitFor(() => {
      expect(container.querySelector('img[alt="Business logo preview"]')).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: /remove logo/i }));

    const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toBe('');
  });

  // ── localStorage persistence ──────────────────────────────────────────────

  it('writes the logo data URL to localStorage under key "invoice_logo" on upload', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [makeFile('logo.png', 'image/png', 1024)] } });

    await waitFor(() => {
      expect(localStorage.getItem('invoice_logo')).toBe(dataUrl);
    });
  });

  it('removes the "invoice_logo" key from localStorage when Remove Logo is clicked', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    mockFileReaderSuccess(dataUrl);
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [makeFile('logo.png', 'image/png', 1024)] } });
    await waitFor(() => expect(localStorage.getItem('invoice_logo')).toBe(dataUrl));

    fireEvent.click(screen.getByRole('button', { name: /remove logo/i }));

    expect(localStorage.getItem('invoice_logo')).toBeNull();
  });

  // ── Rehydration from localStorage ────────────────────────────────────────

  it('rehydrates the logo from localStorage on mount and shows the preview image', () => {
    const storedUrl = 'data:image/png;base64,storedData';
    localStorage.setItem('invoice_logo', storedUrl);

    const { container } = renderWithContext();

    const img = container.querySelector('img[alt="Business logo preview"]');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe(storedUrl);
  });

  it('does not show the placeholder when a logo is rehydrated from localStorage', () => {
    const storedUrl = 'data:image/png;base64,storedData';
    localStorage.setItem('invoice_logo', storedUrl);

    const { container } = renderWithContext();

    expect(container.querySelector('[aria-label="Logo placeholder"]')).toBeNull();
  });

  // ── FileReader error ──────────────────────────────────────────────────────

  it('shows an error in the live region when FileReader fires an error event', async () => {
    mockFileReaderError();
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [makeFile('logo.png', 'image/png', 1024)] } });

    await waitFor(() => {
      const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
      expect(liveRegion.textContent).toMatch(/failed to read/i);
    });
  });

  it('does not display a logo image when FileReader fires an error event', async () => {
    mockFileReaderError();
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [makeFile('logo.png', 'image/png', 1024)] } });

    await waitFor(() => {
      const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
      expect(liveRegion.textContent).not.toBe('');
    });
    expect(container.querySelector('img[alt="Business logo preview"]')).toBeNull();
  });

  // ── No-file edge case ─────────────────────────────────────────────────────

  it('does nothing when the file input change event carries no files', () => {
    const { container } = renderWithContext();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [] } });

    const liveRegion = container.querySelector('[role="alert"][aria-live="assertive"]');
    expect(liveRegion.textContent).toBe('');
    expect(container.querySelector('img')).toBeNull();
  });
});
