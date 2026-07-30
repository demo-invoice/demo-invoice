import React, { useRef } from 'react';
import { useInvoiceDispatch } from '../../context/InvoiceContext';

/**
 * Logo upload component.
 * Uses addEventListener('load', …) for broadest cross-browser FileReader compatibility.
 */
export function LogoUpload(): React.JSX.Element {
  const dispatch = useInvoiceDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    // Use addEventListener for broadest cross-browser compatibility (vs onload assignment).
    reader.addEventListener('load', () => {
      const result = reader.result;
      if (typeof result === 'string') {
        dispatch({ type: 'SET_LOGO', payload: result });
      }
    });
    reader.addEventListener('error', () => {
      console.error('LogoUpload: FileReader error', reader.error);
    });
    reader.readAsDataURL(file);
  }

  return (
    <div className="logo-upload">
      <label htmlFor="logoUpload">Company Logo</label>
      <input
        id="logoUpload"
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
