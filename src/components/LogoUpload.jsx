import React, { useRef, useId, useState, useEffect, useCallback } from 'react';
import { useInvoice } from '../context/InvoiceContext.jsx';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/svg+xml'];

/**
 * Returns true if the file is an accepted image type.
 * Checks MIME type first; falls back to .svg extension for browsers
 * that report an empty MIME for SVG files.
 * @param {File} file
 * @returns {boolean}
 */
function isAcceptedType(file) {
  if (ACCEPTED_MIME.includes(file.type)) return true;
  if (file.name.toLowerCase().endsWith('.svg')) return true;
  return false;
}

/**
 * Logo upload control.
 * Renders a hidden file input, an "Upload Logo" trigger button,
 * an ARIA live region for errors, a logo preview (or grey placeholder),
 * and a "Remove Logo" button when a logo is loaded.
 */
export function LogoUpload() {
  const { logo, setLogo } = useInvoice();
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  const errorId = useId();
  const [error, setError] = useState('');

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /** Triggers the hidden file input. */
  const handleUploadClick = useCallback(() => {
    setError('');
    inputRef.current?.click();
  }, []);

  /** Validates and reads the selected file. */
  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      // Reset input so the same file can be re-selected after removal.
      event.target.value = '';

      if (!file) return;

      if (!isAcceptedType(file)) {
        setError('Only PNG, JPEG, and SVG images are accepted.');
        return;
      }

      if (file.size > MAX_BYTES) {
        setError('File must be 2 MB or smaller.');
        return;
      }

      setError('');

      const reader = new FileReader();
      let active = true; // guard against rapid successive uploads

      reader.onload = (e) => {
        if (!active || !mountedRef.current) return;
        const result = e.target?.result;
        if (typeof result === 'string') {
          setLogo(result);
        }
      };

      reader.onerror = () => {
        if (!active || !mountedRef.current) return;
        setError('Failed to read the file. Please try again.');
      };

      reader.readAsDataURL(file);

      // If another file change fires before this read completes,
      // the closure variable `active` for this invocation is set to false.
      return () => {
        active = false;
      };
    },
    [setLogo]
  );

  /** Clears the logo from state, localStorage, and any displayed error. */
  const handleRemove = useCallback(() => {
    setLogo(null);
    setError('');
  }, [setLogo]);

  /**
   * If the img element fails to load (e.g. corrupt/truncated base64 in
   * localStorage), clear the logo so the UI falls back to the placeholder.
   */
  const handleImgError = useCallback(() => {
    setLogo(null);
    setError('Stored logo could not be loaded and has been cleared.');
  }, [setLogo]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <button type="button" onClick={handleUploadClick}>
        Upload Logo
      </button>

      {/* Always-present ARIA live region — text content changes, no child toggling */}
      <div
        id={errorId}
        role="alert"
        aria-live="assertive"
        style={{ color: 'red', minHeight: '1.2em' }}
      >
        {error}
      </div>

      {logo ? (
        <>
          <img
            src={logo}
            alt="Business logo preview"
            onError={handleImgError}
            style={{ maxWidth: '160px', maxHeight: '80px', objectFit: 'contain' }}
          />
          <button type="button" onClick={handleRemove}>
            Remove Logo
          </button>
        </>
      ) : (
        <div
          aria-label="Logo placeholder"
          style={{
            width: '160px',
            height: '80px',
            backgroundColor: '#d1d5db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: '0.75rem',
          }}
        >
          No logo
        </div>
      )}
    </div>
  );
}
