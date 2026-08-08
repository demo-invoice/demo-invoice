import React, { useRef, useState } from 'react';
import { useInvoice, UPDATE_FIELD } from '../../context/InvoiceContext.jsx';
import './LogoUpload.css';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Allows the user to upload, preview, and remove a logo.
 * Reads logoDataUrl from InvoiceContext and dispatches UPDATE_FIELD to update it.
 */
export function LogoUpload() {
  const { logoDataUrl, dispatch } = useInvoice();
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a PNG, JPEG, or SVG image.');
      // Reset input so the same file can be re-selected after fixing the error
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError('File is too large. Maximum size is 2 MB.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      dispatch({ type: UPDATE_FIELD, field: 'logoDataUrl', value: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    dispatch({ type: UPDATE_FIELD, field: 'logoDataUrl', value: null });
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="logo-upload">
      {logoDataUrl ? (
        <div className="logo-upload__preview">
          <img
            src={logoDataUrl}
            alt="Invoice logo preview"
            className="logo-upload__image"
          />
          <button
            type="button"
            className="logo-upload__remove-btn"
            onClick={handleRemove}
            aria-label="Remove logo"
          >
            Remove Logo
          </button>
        </div>
      ) : (
        <div className="logo-upload__input-wrapper">
          <label htmlFor="logo-upload-input" className="logo-upload__label">
            Upload Logo
          </label>
          <input
            id="logo-upload-input"
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="logo-upload__input"
            onChange={handleFileChange}
            aria-describedby={error ? 'logo-upload-error' : undefined}
          />
        </div>
      )}
      {error && (
        <span
          id="logo-upload-error"
          className="logo-upload__error"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </span>
      )}
    </div>
  );
}
