import React from 'react';
import { APPROVED_FONTS, ApprovedFont } from '../../shared/brandingDefaults';

interface FontSelectorProps {
  value: ApprovedFont;
  onChange: (font: ApprovedFont) => void;
  id: string;
}

/** Human-readable display names for fonts whose internal key differs from display name. */
const FONT_DISPLAY_NAMES: Record<ApprovedFont, string> = {
  Inter: 'Inter',
  Roboto: 'Roboto',
  Lato: 'Lato',
  Merriweather: 'Merriweather',
  OpenSans: 'Open Sans',
  PlayfairDisplay: 'Playfair Display',
  Montserrat: 'Montserrat',
};

/**
 * Visual font selector where each option is rendered in its own typeface.
 * Controlled component — value and onChange are required.
 */
export function FontSelector({ value, onChange, id }: FontSelectorProps): React.ReactElement {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    onChange(e.target.value as ApprovedFont);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
        Font Family
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        style={{
          padding: '8px 12px',
          border: '1px solid #CBD5E1',
          borderRadius: 4,
          fontSize: 15,
          fontFamily: value, // render the select itself in the chosen font
          minWidth: 200,
          cursor: 'pointer',
        }}
      >
        {APPROVED_FONTS.map((font) => (
          <option
            key={font}
            value={font}
            style={{ fontFamily: font }}
          >
            {FONT_DISPLAY_NAMES[font]}
          </option>
        ))}
      </select>
    </div>
  );
}
