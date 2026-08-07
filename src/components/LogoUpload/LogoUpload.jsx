import React, { useRef, useState, useEffect, useId } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';
import './LogoUpload.css';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/svg+xml']);

/**
 * Determine whether a File is an accepted image type.
 * Falls back to extension check for SVG because some browsers report an empty
 * MIME type for .svg files.
 * @param {File} file
 * @returns {boolean}
 */
function isAllowedType(file) {
  if (ALLOWED_MIME.has(file.type)) return true;
  // Extension fallback for SVG edge-case.
  return file.name.toLowerCase().endsWith('.svg');
}

/**
 * LogoUpload component.
 * Renders a hidden file input linked to a visible label button.
 * Validates MIME type and file size before invoking FileReader.
 * Displays accessible inline error messages.
 */
export function LogoUpload() {
  const { logoDataUrl, setLogoDataUrl, removeLogo } = useInvoice();
  const [error, setError] = useState('');
  const inputRef = useRef(/** @type {HTMLInputElement|null} */ (null));
  const readerRef = useRef(/** @type {FileReader|null} */ (null));
  const cancelledRef = useRef(false);

  const inputId = useId();
  const errorId = useId();

  // Mark as cancelled on unmount so a pending FileReader result is ignored.
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  /**
   * Handle file input change event.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleChange(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return; // picker cancelled

    const file = files[0];

    if (!isAllowedType(file)) {
      setError('Invalid file type. Please upload a PNG, JPEG, or SVG image.');
      return;
    }

    if (file.size > MAX_BYTES) {
      setError('File is too large. Maximum size is 2 MB.');
      return;
    }

    setError('');

    // Abort any in-flight reader before starting a new one.
    if (readerRef.current) {
      readerRef.current.abort();
    }

    const reader = new FileReader();
    readerRef.current = reader;

    reader.onload = () => {
      if (cancelledRef.current) return;
      const result = reader.result;
      if (typeof result === 'string') {
        setLogoDataUrl(result);
      }
    };

    reader.onerror = () => {
      if (cancelledRef.current) return;
      setError('Could not read file. Please try again.');
    };

    reader.readAsDataURL(file);
  }

  function handleRemove() {
    removeLogo();
    setError('');
    // Reset the input so the same file can be re-selected.
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="logo-upload">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,.svg"
        className="logo-upload__input"
        onChange={handleChange}
        aria-describedby={errorId}
      />
      <label htmlFor={inputId} className="logo-upload__button">
        Upload Logo
      </label>

      {logoDataUrl && (
        <button
          type="button"
          className="logo-upload__remove"
          onClick={handleRemove}
        >
          Remove Logo
        </button>
      )}

      <div id={errorId}>
        {error && (
          <span role="alert" aria-live="assertive" className="logo-upload__error">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
