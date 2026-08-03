import React, { useState, useEffect } from 'react';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  id: string;
}

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

/**
 * Controlled color input combining a native color picker and a hex text field.
 * The two inputs are kept in sync. Emits onChange only for valid 6-digit hex values.
 * Shows an inline error for invalid input.
 */
export function ColorInput({ label, value, onChange, id }: ColorInputProps): React.ReactElement {
  const [text, setText] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // Sync text field when parent value changes (e.g. on initial load)
  useEffect(() => {
    setText(value);
  }, [value]);

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = e.target.value;
    setText(raw);
    if (HEX_REGEX.test(raw)) {
      setError(null);
      onChange(raw);
    }
    // Don't emit partial values — preview holds last valid value
  }

  function handleBlur(): void {
    if (!HEX_REGEX.test(text)) {
      setError('Must be a valid 6-digit hex color (e.g. #2563EB)');
    } else {
      setError(null);
    }
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const hex = e.target.value; // always valid from native picker
    setText(hex);
    setError(null);
    onChange(hex);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="color"
          value={HEX_REGEX.test(text) ? text : '#000000'}
          onChange={handlePickerChange}
          aria-label={`${label} color picker`}
          style={{ width: 40, height: 36, padding: 2, cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <input
          id={id}
          type="text"
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          maxLength={7}
          placeholder="#2563EB"
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error !== null}
          style={{
            width: 110,
            padding: '6px 10px',
            border: `1px solid ${error ? '#DC2626' : '#CBD5E1'}`,
            borderRadius: 4,
            fontFamily: 'monospace',
            fontSize: 14,
          }}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
