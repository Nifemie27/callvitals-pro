import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CHUNK_RELOAD_FLAG } from '@/constants/config'

// Vite wraps every dynamic import() and dispatches this event when one fails
// to load - the reliable, browser-agnostic signal that a lazy route's chunk
// is stale (or missing) after a redeploy. Catching it here means we don't
// depend on React ever seeing the failure as a component error, which browsers
// phrase differently enough (Chrome vs Firefox vs Safari) that pattern-matching
// error messages inside a React error boundary alone had already proven leaky.
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
    sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1')
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
