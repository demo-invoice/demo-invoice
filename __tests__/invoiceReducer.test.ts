import { describe, it, expect } from 'vitest';
import { invoiceReducer } from '../src/context/InvoiceContext.jsx';

/**
 * Unit tests for the invoiceReducer.
 * Verifies that each action type produces the expected state transition.
 */
describe('invoiceReducer', () => {
  const baseState = {
    logoDataUrl: null,
    emailSent: false,
  };

  it('returns the initial state unchanged for an unknown action', () => {
    // @ts-expect-error — intentionally testing unknown action type
    const result = invoiceReducer(baseState, { type: 'UNKNOWN' });
    expect(result).toEqual(baseState);
  });

  it('SET_LOGO sets logoDataUrl in state', () => {
    const dataUrl = 'data:image/png;base64,abc123';
    const result = invoiceReducer(baseState, { type: 'SET_LOGO', payload: dataUrl });
    expect(result.logoDataUrl).toBe(dataUrl);
    expect(result.emailSent).toBe(false);
  });

  it('REMOVE_LOGO clears logoDataUrl', () => {
    const stateWithLogo = { ...baseState, logoDataUrl: 'data:image/png;base64,abc' };
    const result = invoiceReducer(stateWithLogo, { type: 'REMOVE_LOGO' });
    expect(result.logoDataUrl).toBeNull();
  });

  it('SEND_EMAIL sets emailSent to true', () => {
    const result = invoiceReducer(baseState, { type: 'SEND_EMAIL' });
    expect(result.emailSent).toBe(true);
  });

  it('SEND_EMAIL does not mutate other state fields', () => {
    const stateWithLogo = { ...baseState, logoDataUrl: 'data:image/png;base64,xyz' };
    const result = invoiceReducer(stateWithLogo, { type: 'SEND_EMAIL' });
    expect(result.logoDataUrl).toBe('data:image/png;base64,xyz');
    expect(result.emailSent).toBe(true);
  });

  it('SEND_EMAIL is idempotent — stays true if already true', () => {
    const alreadySent = { ...baseState, emailSent: true };
    const result = invoiceReducer(alreadySent, { type: 'SEND_EMAIL' });
    expect(result.emailSent).toBe(true);
  });
});
