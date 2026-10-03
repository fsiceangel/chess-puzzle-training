import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/tokens.css'
import './styles/app.css'
import './styles/board.css'
import './styles/painted.css'
import './styles/boards.css'
import './styles/room.css'
import './styles/studio.css'

if (!window.location.hash) window.location.hash = '#/'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
