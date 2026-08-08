import React, { useRef, useState } from 'react';
import { useInvoice } from '../../context/InvoiceContext.jsx';
import './LogoUpload.css';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const ACCEPT_ATTR = 'image/png,image/jpeg,image/svg+xml,.svg';

/**
 * Allows the user to upload a logo image (PNG, JPEG, or SVG).
 * Persists the data URL in InvoiceContext (and localStorage via context).
 */
export function LogoUpload() {
  const { invoiceState, setLogoDataUrl, removeLogo } = useInvoice();
  const { logoDataUrl } = invoiceState;

  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const descId = React.useId();
  const inputId = React.useId();

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a PNG, JPEG, or SVG image.');
      // Reset input so the same file can be re-selected after fixing the error
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    removeLogo();
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="logo-upload">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        className="logo-upload__input"
        aria-describedby={descId}
        onChange={handleFileChange}
      />

      {logoDataUrl ? (
        <>
          <img
            src={logoDataUrl}
            alt="Invoice logo preview"
            className="logo-upload__preview"
          />
          <button
            type="button"
            className="logo-upload__remove-btn"
            onClick={handleRemove}
          >
            Remove Logo
          </button>
        </>
      ) : (
        <label htmlFor={inputId} className="logo-upload__button">
          Upload Logo
        </label>
      )}

      <div id={descId}>
        {error && (
          <span
            role="alert"
            aria-live="assertive"
            className="logo-upload__error"
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
