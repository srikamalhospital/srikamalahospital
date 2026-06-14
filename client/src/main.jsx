import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/responsive.css'
import './styles/receipt-print.css'
import './styles/ai-mobile.css'
import './styles/pharmacy-mobile.css'
import './styles/site-align.css'

const stored = localStorage.getItem('sk_theme')
if (stored === 'dark' || stored === 'light') {
  document.documentElement.setAttribute('data-theme', stored)
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
