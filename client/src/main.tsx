import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/fonts/fonts.css';
import { BrandingSettings } from './components/BrandingSettings';

/**
 * Application entry point.
 * fonts.css is imported here so @font-face declarations are loaded globally
 * before any component renders.
 */
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in DOM');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    {/* TODO: replace hardcoded userId/token with auth context */}
    <BrandingSettings userId="1" token="" />
  </React.StrictMode>
);
