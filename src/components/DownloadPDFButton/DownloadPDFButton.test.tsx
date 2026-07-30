import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DownloadPDFButton } from './DownloadPDFButton';

describe('DownloadPDFButton', () => {
  it('renders the download button', () => {
    render(<DownloadPDFButton />);
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
  });

  it('calls window.print() by default when clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    render(<DownloadPDFButton />);
    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(printSpy).toHaveBeenCalledOnce();
    printSpy.mockRestore();
  });

  it('calls the onDownload prop instead of window.print() when provided', () => {
    const onDownload = vi.fn();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    render(<DownloadPDFButton onDownload={onDownload} />);
    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(onDownload).toHaveBeenCalledOnce();
    expect(printSpy).not.toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
