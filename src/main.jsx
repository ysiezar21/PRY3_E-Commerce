/**
 * Punto de entrada de la aplicación.
 *
 * Monta el componente App dentro del index.html.
 * StrictMode activa advertencias extra de React en desarrollo.
 */

// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)