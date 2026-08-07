import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoUpload } from './LogoUpload.jsx';
import { InvoiceProvider } from '../../context/InvoiceContext.jsx';

function renderWithProvider(ui) {
  return render(<InvoiceProvider>{ui}</InvoiceProvider>);
}

describe('LogoUpload', () => {
  it('renders the upload button', () => {
    renderWithProvider(<LogoUpload />);
    expect(screen.getByLabelText(/upload logo/i)).toBeInTheDocument();
  });

  it('renders a file input', () => {
    renderWithProvider(<LogoUpload />);
    // file inputs are not role="textbox"; query by role with hidden:true
    expect(screen.getByRole('textbox', { hidden: true })).toBeInTheDocument();
  });

  it('shows an error when a non-image file is uploaded', async () => {
    renderWithProvider(<LogoUpload />);
    const input = screen.getByLabelText(/upload logo/i);
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid file type/i);
    });
  });

  it('shows an error when FileReader fails', async () => {
    renderWithProvider(<LogoUpload />);
    const input = screen.getByLabelText(/upload logo/i);
    const file = new File(['data'], 'logo.png', { type: 'image/png' });

    // Simulate a FileReader error
    const originalFileReader = global.FileReader;
    global.FileReader = class {
      constructor() {
        this.onerror = null;
        this.onload = null;
      }
      readAsDataURL() {
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error('Failed to read'));
        }, 0);
      }
    };

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to read/i);
    });

    global.FileReader = originalFileReader;
  });
});
