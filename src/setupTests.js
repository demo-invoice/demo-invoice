import '@testing-library/jest-dom';

// Mock @emailjs/browser — requires browser APIs unavailable in jsdom
vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn().mockResolvedValue({ status: 200, text: 'OK' }),
  },
}));

// Mock html2pdf.js — requires browser APIs unavailable in jsdom
vi.mock('html2pdf.js', () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    outputPdf: vi.fn().mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' })),
  })),
}));
