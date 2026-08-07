import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found in the document.');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
