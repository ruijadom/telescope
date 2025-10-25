import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize Telescope in development
if (import.meta.env.DEV) {
  import('@ruijadom/telescope-browser').then(({ initTelescope }) => {
    initTelescope({
      server: {
        port: 3740,
        host: 'localhost',
      },
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
