import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/fonts.css'
import './styles/safeArea.css'

// Enable transitions after initial load to prevent white flash
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('transitions-ready');
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
