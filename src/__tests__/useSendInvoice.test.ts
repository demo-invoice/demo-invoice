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
    // jsdom does not support window.location.href assignment natively in tests;
    // spy on it via Object.defineProperty.
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

  it('initial state has isSending=false, isSuccess=false, error=null', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    expect(result.current.isSending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('setRecipient updates recipient', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient('new@example.com'));
    expect(result.current.recipient).toBe('new@example.com');
  });

  it('setRecipient sets recipientError for invalid email', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient('not-an-email'));
    expect(result.current.recipientError).toBeTruthy();
  });

  it('setRecipient clears recipientError for valid email', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient('not-an-email'));
    act(() => result.current.setRecipient('valid@example.com'));
    expect(result.current.recipientError).toBeNull();
  });

  it('triggerSend does not fire when recipient is invalid', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setRecipient('bad-email'));
    act(() => result.current.triggerSend());
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it('triggerSend sets isSending=true and calls window.location.href', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.triggerSend());
    expect(result.current.isSending).toBe(true);
    expect(hrefSetter).toHaveBeenCalledOnce();
    const calledWith: string = hrefSetter.mock.calls[0][0] as string;
    expect(calledWith.startsWith('mailto:')).toBe(true);
  });

  it('sets isSuccess=true after the simulated loading delay', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.triggerSend());
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isSending).toBe(false);
  });

  it('prevents duplicate send while isSending=true', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.triggerSend());
    act(() => result.current.triggerSend()); // second call while sending
    expect(hrefSetter).toHaveBeenCalledOnce();
  });

  it('reset restores initial state', () => {
    const { result } = renderHook(() => useSendInvoice(testInvoice));
    act(() => result.current.setSubject('My Subject'));
    act(() => result.current.reset());
    expect(result.current.subject).toBe('');
    expect(result.current.recipient).toBe('alice@example.com');
  });
});
