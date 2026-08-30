import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import Bootstrap 5 CSS, JS bundle, and Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import custom styling
import './index.css';

// Apply saved theme & layout preferences on boot (defaulting to Black & Blue theme)
const savedTheme = localStorage.getItem('tripnest_theme') || 'dark';
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-bs-theme', 'dark');
  document.body.classList.add('dark-theme');
} else {
  document.documentElement.setAttribute('data-bs-theme', 'light');
  document.body.classList.remove('dark-theme');
}

const savedCompact = localStorage.getItem('tripnest_compact');
if (savedCompact === 'true') {
  document.body.classList.add('compact-feed');
}

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
