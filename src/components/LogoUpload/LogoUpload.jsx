import React, { useId, useRef, useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';

/**
 * Accepted MIME types and extensions for logo uploads.
 */
const ACCEPTED_TYPES = 'image/png,image/jpeg,image/svg+xml,.svg';

/**
 * LogoUpload — lets the user upload a PNG, JPEG, or SVG logo.
 * Stores the result as a base64 data URL via InvoiceContext.
 */
export function LogoUpload() {
  const { setLogoDataUrl, removeLogo, logoDataUrl } = useInvoice();
  const [error, setError] = useState('');
  const inputId = useId();
  const descId = useId();
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.svg')) {
      setError('Invalid file type. Please upload a PNG, JPEG, or SVG image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (typeof dataUrl === 'string') {
        setLogoDataUrl(dataUrl);
      }
    };
    reader.onerror = (event) => {
      setError('Failed to read the file. Please try again.');
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    removeLogo();
    setError('');
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
        accept={ACCEPTED_TYPES}
        className="logo-upload__input"
        aria-describedby={descId}
        onChange={handleFileChange}
      />
      <label htmlFor={inputId} className="logo-upload__button">
        Upload Logo
      </label>
      {logoDataUrl && (
        <button type="button" onClick={handleRemove} className="logo-upload__remove">
          Remove Logo
        </button>
      )}
      <div id={descId} role="alert" className="logo-upload__error">
        {error}
      </div>
    </div>
  );
}
