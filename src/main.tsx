import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (no Google Fonts request; font-display: swap).
// Display: Big Shoulders Display — condensed civic-signage letters that echo the
// skyline. Body: Schibsted Grotesk — a newspaper grotesk. Mono (code-like
// diagram text only): IBM Plex Mono.
import '@fontsource-variable/big-shoulders-display'
import '@fontsource-variable/schibsted-grotesk'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
