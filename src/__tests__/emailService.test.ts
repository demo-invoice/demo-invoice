import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendInvoice } from '../services/emailService';
import type { Invoice } from '../types/invoice';

const mockInvoice: Invoice = {
  id: 'inv-1',
  invoiceNumber: 'INV-001',
  issueDate: '2024-01-01',
  dueDate: '2024-01-31',
  fromName: 'Alice',
  fromEmail: 'alice@example.com',
  toName: 'Bob',
  toEmail: 'bob@example.com',
  lineItems: [],
  notes: '',
};

const RECIPIENT = 'client@example.com';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('sendInvoice', () => {
  it('POSTs to /api/send-invoice with correct payload', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await sendInvoice(mockInvoice, RECIPIENT);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/send-invoice');
    expect(init.method).toBe('POST');

    const body = JSON.parse(init.body as string) as { invoice: Invoice; recipient: string };
    expect(body.recipient).toBe(RECIPIENT);
    expect(body.invoice.invoiceNumber).toBe('INV-001');
  });

  it('returns ok:true on 200 response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const result = await sendInvoice(mockInvoice, RECIPIENT);
    expect(result.ok).toBe(true);
    expect(result.message).toContain(RECIPIENT);
  });

  it('returns ok:false with retry message on 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 500 }));
    const result = await sendInvoice(mockInvoice, RECIPIENT);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/failed to send/i);
  });

  it('returns ok:false with rate-limit message on 429', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 429 }));
    const result = await sendInvoice(mockInvoice, RECIPIENT);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/too many requests/i);
  });

  it('returns ok:false on network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const result = await sendInvoice(mockInvoice, RECIPIENT);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/network error/i);
  });

  it('returns ok:false with cancelled message when aborted', async () => {
    const controller = new AbortController();
    const abortError = new DOMException('Aborted', 'AbortError');
    vi.mocked(fetch).mockRejectedValueOnce(abortError);
    const result = await sendInvoice(mockInvoice, RECIPIENT, controller.signal);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/cancelled/i);
  });
});
