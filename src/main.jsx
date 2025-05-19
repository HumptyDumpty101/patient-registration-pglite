import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PGliteProvider } from './context/PGliteContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PGliteProvider>
      <App />
    </PGliteProvider>
  </StrictMode>,
)
