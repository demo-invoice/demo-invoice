/// <reference types="vitest" />
import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * Global mock for @emailjs/browser so no real network calls are made in tests.
 */
vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn().mockResolvedValue({ status: 200, text: 'OK' }),
    init: vi.fn(),
  },
}));

/**
 * Global mock for html2pdf.js to prevent canvas/DOM errors in tests.
 */
vi.mock('html2pdf.js', () => ({
  default: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
  })),
}));
