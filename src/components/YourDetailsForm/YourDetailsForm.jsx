import React from 'react';
import { LogoUpload } from '../LogoUpload/LogoUpload.jsx';
import './YourDetailsForm.css';

/**
 * YourDetailsForm component.
 * Collects business details including the logo upload.
 */
export function YourDetailsForm() {
  return (
    <section className="your-details-form" aria-label="Your details">
      <h2 className="your-details-form__heading">Your Details</h2>

      <div className="your-details-form__field">
        <label htmlFor="business-name" className="your-details-form__label">
          Business Name
        </label>
        <input
          id="business-name"
          type="text"
          className="your-details-form__input"
          placeholder="Acme Ltd."
        />
      </div>

      <div className="your-details-form__field">
        <label htmlFor="business-email" className="your-details-form__label">
          Email
        </label>
        <input
          id="business-email"
          type="email"
          className="your-details-form__input"
          placeholder="hello@acme.com"
        />
      </div>

      <div className="your-details-form__field">
        <span className="your-details-form__label">Business Logo</span>
        <LogoUpload />
      </div>
    </section>
  );
}
