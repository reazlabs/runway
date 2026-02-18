import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PassportManager from './sample code.jsx'
import Apppp from './text.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <PassportManager /> */}
    <App />
    {/* <Apppp /> */}
  </StrictMode>,
)
