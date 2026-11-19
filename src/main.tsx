import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'


// Track PWA installation
window.addEventListener('appinstalled', () => {
  console.log('Mark Book was installed!')
  if (typeof (window as any).goatcounter !== 'undefined') {
    (window as any).goatcounter.count({
      path: '/pwa-installed',
      title: 'PWA App Installed',
      event: true,
    })
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
