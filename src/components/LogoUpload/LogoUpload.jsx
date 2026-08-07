import React, { useId, useState, useRef } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const ACCEPTED_EXTENSIONS = '.svg';
const ACCEPTED_ATTR = `image/png,image/jpeg,image/svg+xml,${ACCEPTED_EXTENSIONS}`;

/**
 * Allows the user to upload a business logo (PNG, JPEG, or SVG).
 * Displays a preview and a "Remove Logo" button when a logo is loaded.
 * Shows an error message for invalid file types.
 */
export function LogoUpload() {
  const { logoDataUrl, setLogoDataUrl, removeLogo } = useInvoice();
  const [error, setError] = useState('');
  const inputId = useId();
  const descId = useId();
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isSvgByExtension = file.name.toLowerCase().endsWith('.svg');
    const isValidType = ACCEPTED_TYPES.includes(file.type) || isSvgByExtension;

    if (!isValidType) {
      setError('Invalid file type. Please upload a PNG, JPEG, or SVG image.');
      // Reset the input so the same file can be re-selected after fixing
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setLogoDataUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setError('');
    removeLogo();
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="logo-upload">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_ATTR}
        className="logo-upload__input"
        onChange={handleFileChange}
        aria-describedby={descId}
      />
      <label htmlFor={inputId} className="logo-upload__button">
        Upload Logo
      </label>

      <div id={descId}>
        {error && (
          <span role="alert" aria-live="assertive" className="logo-upload__error">
            {error}
          </span>
        )}
      </div>

      {logoDataUrl && (
        <div className="logo-upload__preview">
          <img
            src={logoDataUrl}
            alt="Logo preview"
            className="logo-upload__preview-img"
            style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
          />
          <button
            type="button"
            className="logo-upload__remove-btn"
            onClick={handleRemove}
          >
            Remove Logo
          </button>
        </div>
      )}
    </div>
  );
}
