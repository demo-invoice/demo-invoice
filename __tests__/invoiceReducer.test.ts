import { describe, it, expect } from 'vitest';
import { invoiceReducer } from '../src/context/InvoiceContext.jsx';

describe('invoiceReducer', () => {
  const baseState = {
    logoDataUrl: null,
    emailSent: false,
  };

  it('returns state unchanged for an unknown action type', () => {
    // @ts-expect-error — intentionally testing unknown action type
    const result = invoiceReducer(baseState, { type: 'UNKNOWN' });
    expect(result).toEqual(baseState);
  });

  it('SET_LOGO sets logoDataUrl and leaves emailSent unchanged', () => {
    const dataUrl = 'data:image/png;base64,abc123';
    const result = invoiceReducer(baseState, { type: 'SET_LOGO', payload: dataUrl });
    expect(result.logoDataUrl).toBe(dataUrl);
    expect(result.emailSent).toBe(false);
  });

  it('SET_LOGO with no payload sets logoDataUrl to null', () => {
    const stateWithLogo = { ...baseState, logoDataUrl: 'data:image/png;base64,abc' };
    const result = invoiceReducer(stateWithLogo, { type: 'SET_LOGO' });
    expect(result.logoDataUrl).toBeNull();
  });

  it('REMOVE_LOGO clears logoDataUrl to null', () => {
    const stateWithLogo = { ...baseState, logoDataUrl: 'data:image/png;base64,abc' };
    const result = invoiceReducer(stateWithLogo, { type: 'REMOVE_LOGO' });
    expect(result.logoDataUrl).toBeNull();
  });

  it('REMOVE_LOGO leaves emailSent unchanged', () => {
    const stateWithEmail = { logoDataUrl: 'data:image/png;base64,abc', emailSent: true };
    const result = invoiceReducer(stateWithEmail, { type: 'REMOVE_LOGO' });
    expect(result.emailSent).toBe(true);
  });

  it('SEND_EMAIL sets emailSent to true', () => {
    const result = invoiceReducer(baseState, { type: 'SEND_EMAIL' });
    expect(result.emailSent).toBe(true);
  });

  it('SEND_EMAIL does not mutate logoDataUrl', () => {
    const stateWithLogo = { ...baseState, logoDataUrl: 'data:image/png;base64,xyz' };
    const result = invoiceReducer(stateWithLogo, { type: 'SEND_EMAIL' });
    expect(result.logoDataUrl).toBe('data:image/png;base64,xyz');
    expect(result.emailSent).toBe(true);
  });

  it('SEND_EMAIL is idempotent — stays true when already true', () => {
    const alreadySent = { ...baseState, emailSent: true };
    const result = invoiceReducer(alreadySent, { type: 'SEND_EMAIL' });
    expect(result.emailSent).toBe(true);
  });

  it('reducer does not mutate the original state object', () => {
    const frozen = Object.freeze({ ...baseState });
    expect(() => invoiceReducer(frozen, { type: 'SEND_EMAIL' })).not.toThrow();
  });
});
