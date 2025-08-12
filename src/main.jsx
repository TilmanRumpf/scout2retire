import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/fonts.css'
import './styles/safeArea.css'
import './styles/iosHeader.css'

// Enable transitions after initial load to prevent white flash
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('transitions-ready');
    });
  });
}

// Disabled StrictMode to prevent double-rendering in development
// This was causing the constant flashing issue
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
