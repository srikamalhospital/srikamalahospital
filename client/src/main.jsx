import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const stored = localStorage.getItem('sk_theme')
if (stored === 'dark' || stored === 'light') {
  document.documentElement.setAttribute('data-theme', stored)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
