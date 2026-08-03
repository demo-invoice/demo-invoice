import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSendInvoice } from '../hooks/useSendInvoice';
import type { Invoice } from '../types/invoice';

const testInvoice: Invoice = {
  invoiceNumber: 'INV-001',
  companyName: 'Acme Corp',
  clientName: 'Alice',
  clientEmail: 'alice@example.com',
  issuedAt: '2024-01-01',
  dueAt: '2024-01-31',
  taxRate: 0.05,
  lineItems: [{ id: '1', description: 'Widget', quantity: 1, unitPrice: 100 }],
};

describe('useSendInvoice', () => {
  let hrefSetter: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    hrefSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
      configurable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pre-populates recipient from invoice.clientEmail', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    expect(result.current.recipient).toBe('alice@example.com');
  });

  it('starts with isSending=false', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    expect(result.current.isSending).toBe(false);
  });

  it('starts with isSuccess=false', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    expect(result.current.isSuccess).toBe(false);
  });

  it('starts with error=null', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    expect(result.current.error).toBeNull();
  });

  it('starts with recipientError=null', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    expect(result.current.recipientError).toBeNull();
  });

  it('setRecipient updates the recipient value', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient('new@example.com'));
    expect(result.current.recipient).toBe('new@example.com');
  });

  it('setRecipient sets recipientError for a malformed email', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient('not-an-email'));
    expect(result.current.recipientError).toBe('Please enter a valid email address.');
  });

  it('setRecipient clears recipientError when email becomes valid', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient('not-an-email'));
    act(() => result.current.setRecipient('valid@example.com'));
    expect(result.current.recipientError).toBeNull();
  });

  it('setRecipient does not set recipientError for an empty string', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient(''));
    expect(result.current.recipientError).toBeNull();
  });

  it('setSubject updates the subject value', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setSubject('My Subject'));
    expect(result.current.subject).toBe('My Subject');
  });

  it('setMessage updates the message value', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setMessage('Hello there'));
    expect(result.current.message).toBe('Hello there');
  });

  it('triggerSend does not call window.location.href when recipient is invalid', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient('bad-email'));
    act(() => result.current.triggerSend());
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it('triggerSend does not call window.location.href when recipient is empty', () => {
    const invoiceNoEmail: Invoice = { ...testInvoice, clientEmail: '' };
    const { result } = renderHook(() => useSendInvoice(invoiceNoEmail));
    act(() => result.current.triggerSend());
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it('triggerSend sets isSending=true immediately for a valid recipient', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.triggerSend());
    expect(result.current.isSending).toBe(true);
  });

  it('triggerSend calls window.location.href with a mailto: URI', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.triggerSend());
    expect(hrefSetter).toHaveBeenCalledOnce();
    const calledWith: string = hrefSetter.mock.calls[0][0] as string;
    expect(calledWith.startsWith('mailto:')).toBe(true);
  });

  it('sets isSuccess=true and isSending=false after the 800ms delay', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.triggerSend());
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isSending).toBe(false);
  });

  it('prevents a duplicate send while isSending=true', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.triggerSend());
    act(() => result.current.triggerSend());
    expect(hrefSetter).toHaveBeenCalledOnce();
  });

  it('reset restores subject to empty string', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setSubject('Some Subject'));
    act(() => result.current.reset());
    expect(result.current.subject).toBe('');
  });

  it('reset restores message to empty string', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setMessage('Some message'));
    act(() => result.current.reset());
    expect(result.current.message).toBe('');
  });

  it('reset re-populates recipient from invoice.clientEmail', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient('other@example.com'));
    act(() => result.current.reset());
    expect(result.current.recipient).toBe('alice@example.com');
  });

  it('reset clears isSuccess', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.triggerSend());
    act(() => vi.advanceTimersByTime(800));
    act(() => result.current.reset());
    expect(result.current.isSuccess).toBe(false);
  });
});
