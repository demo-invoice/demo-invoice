import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks must be hoisted before the module under test is imported ──────────
vi.mock('@emailjs/browser', () => ({
  default: { send: vi.fn() },
}));

vi.mock('html2pdf.js', () => ({
  default: vi.fn(),
}));

import emailjs from '@emailjs/browser';
import html2pdfLib from 'html2pdf.js';
import { sendInvoiceEmail } from './emailService.js';

// Helper: build a fake html2pdf chain that resolves with a Blob
function makePdfChain(blob = new Blob(['%PDF'], { type: 'application/pdf' })) {
  const chain = {
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    outputPdf: vi.fn().mockResolvedValue(blob),
  };
  html2pdfLib.mockReturnValue(chain);
  return chain;
}

// Helper: make FileReader work in jsdom for blobToBase64
function patchFileReader(base64Content = 'AAAA') {
  const originalFileReader = globalThis.FileReader;
  const MockFileReader = vi.fn().mockImplementation(() => ({
    readAsDataURL: vi.fn(function () {
      // Simulate async onload
      Promise.resolve().then(() => {
        this.result = `data:application/pdf;base64,${base64Content}`;
        this.onload();
      });
    }),
    onerror: null,
    onload: null,
    result: null,
  }));
  globalThis.FileReader = MockFileReader;
  return () => { globalThis.FileReader = originalFileReader; };
}

describe('sendInvoiceEmail', () => {
  const ENV_BACKUP = { ...import.meta.env };

  beforeEach(() => {
    vi.clearAllMocks();
    // Provide valid env vars by default
    import.meta.env.VITE_EMAILJS_SERVICE_ID = 'svc_test';
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID = 'tpl_test';
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY = 'pub_test';
  });

  afterEach(() => {
    import.meta.env.VITE_EMAILJS_SERVICE_ID = ENV_BACKUP.VITE_EMAILJS_SERVICE_ID;
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID = ENV_BACKUP.VITE_EMAILJS_TEMPLATE_ID;
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY = ENV_BACKUP.VITE_EMAILJS_PUBLIC_KEY;
  });

  // Missing env vars
  it('throws a descriptive error when VITE_EMAILJS_SERVICE_ID is missing', async () => {
    import.meta.env.VITE_EMAILJS_SERVICE_ID = '';
    const el = document.createElement('div');
    await expect(sendInvoiceEmail('a@b.com', el)).rejects.toThrow(
      'Email service is not configured.'
    );
  });

  it('throws a descriptive error when VITE_EMAILJS_TEMPLATE_ID is missing', async () => {
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID = '';
    const el = document.createElement('div');
    await expect(sendInvoiceEmail('a@b.com', el)).rejects.toThrow(
      'Email service is not configured.'
    );
  });

  it('throws a descriptive error when VITE_EMAILJS_PUBLIC_KEY is missing', async () => {
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY = '';
    const el = document.createElement('div');
    await expect(sendInvoiceEmail('a@b.com', el)).rejects.toThrow(
      'Email service is not configured.'
    );
  });

  // Null invoice element
  it('throws when invoiceElement is null', async () => {
    await expect(sendInvoiceEmail('a@b.com', null)).rejects.toThrow(
      'Invoice element is unavailable.'
    );
  });

  it('throws when invoiceElement is undefined', async () => {
    await expect(sendInvoiceEmail('a@b.com', undefined)).rejects.toThrow(
      'Invoice element is unavailable.'
    );
  });

  // PDF generation failure
  it('throws a wrapped error when html2pdf fails to generate the PDF', async () => {
    const chain = {
      set: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      outputPdf: vi.fn().mockRejectedValue(new Error('canvas error')),
    };
    html2pdfLib.mockReturnValue(chain);

    const el = document.createElement('div');
    await expect(sendInvoiceEmail('a@b.com', el)).rejects.toThrow(
      'Failed to generate invoice PDF: canvas error'
    );
  });

  // Successful send
  it('calls emailjs.send with correct serviceId, templateId, params, and publicKey', async () => {
    makePdfChain();
    const restore = patchFileReader('BASE64DATA');
    emailjs.send.mockResolvedValueOnce({ status: 200, text: 'OK' });

    const el = document.createElement('div');
    await sendInvoiceEmail('recipient@example.com', el);

    expect(emailjs.send).toHaveBeenCalledTimes(1);
    const [svcId, tplId, params, pubKey] = emailjs.send.mock.calls[0];
    expect(svcId).toBe('svc_test');
    expect(tplId).toBe('tpl_test');
    expect(pubKey).toBe('pub_test');
    expect(params.to_email).toBe('recipient@example.com');
    expect(typeof params.pdf_attachment).toBe('string');
    expect(params.pdf_attachment.length).toBeGreaterThan(0);

    restore();
  });

  // EmailJS rate-limit / quota error
  it('throws a friendly message when EmailJS returns a limit/quota error', async () => {
    makePdfChain();
    const restore = patchFileReader();
    emailjs.send.mockRejectedValueOnce({ text: 'Daily limit exceeded' });

    const el = document.createElement('div');
    await expect(sendInvoiceEmail('a@b.com', el)).rejects.toThrow(
      'Email service limit reached. Please try again later.'
    );

    restore();
  });

  it('throws a wrapped error for generic EmailJS failures', async () => {
    makePdfChain();
    const restore = patchFileReader();
    emailjs.send.mockRejectedValueOnce(new Error('network timeout'));

    const el = document.createElement('div');
    await expect(sendInvoiceEmail('a@b.com', el)).rejects.toThrow(
      'Failed to send email: network timeout'
    );

    restore();
  });

  // No localStorage side-effects
  it('does not write to localStorage during a successful send', async () => {
    makePdfChain();
    const restore = patchFileReader();
    emailjs.send.mockResolvedValueOnce({ status: 200, text: 'OK' });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const el = document.createElement('div');
    await sendInvoiceEmail('a@b.com', el);

    expect(setItemSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
    restore();
  });

  it('does not write to localStorage when the send fails', async () => {
    makePdfChain();
    const restore = patchFileReader();
    emailjs.send.mockRejectedValueOnce(new Error('fail'));
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const el = document.createElement('div');
    await expect(sendInvoiceEmail('a@b.com', el)).rejects.toThrow();

    expect(setItemSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
    restore();
  });
});
