import React from 'react';
import { LogoUpload } from './LogoUpload.jsx';

/**
 * "Your Details" form section.
 * Collects business name, address, and logo.
 */
export function YourDetails() {
  return (
    <section
      aria-label="Your details"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '24px',
        minWidth: '280px',
        backgroundColor: '#ffffff',
      }}
    >
      <h2 style={{ marginTop: 0 }}>Your Details</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          Business name
          <input
            type="text"
            name="businessName"
            placeholder="Acme Ltd"
            style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          Address
          <textarea
            name="address"
            rows={3}
            placeholder="123 Main St, Springfield"
            style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #d1d5db', resize: 'vertical' }}
          />
        </label>

        <div>
          <p style={{ margin: '0 0 6px', fontWeight: 500 }}>Business logo</p>
          <LogoUpload />
        </div>
      </div>
    </section>
  );
}
