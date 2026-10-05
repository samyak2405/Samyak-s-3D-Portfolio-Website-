import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted variable fonts (no Google Fonts request; font-display: swap).
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
