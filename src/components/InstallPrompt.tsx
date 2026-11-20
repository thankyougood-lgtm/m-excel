import { useEffect, useState } from 'react'
import './InstallPrompt.css'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [mode, setMode] = useState<'hidden' | 'ready' | 'inapp' | 'ios'>('hidden')

  useEffect(() => {
    const ua = navigator.userAgent || ''
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
    if (standalone) return

    const isFB = /FBAN|FBAV|FB_IAB/i.test(ua)
    const isTelegram = /Telegram/i.test(ua)
    const isIG = /Instagram|Messenger/i.test(ua)
    const isIOS = /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream

    if (isFB || isTelegram || isIG) setMode('inapp')
    else if (isIOS) setMode('ios')
    else setMode('ready') // Shows the button immediately

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const handleClick = async () => {
    if (mode === 'inapp' || mode === 'ios') {
      // If they are in Facebook, try to open in Chrome
      const u = new URL(window.location.href)
      if (/Android/i.test(navigator.userAgent)) {
        window.location.href = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;end`
      } else {
        alert("Tap the ⋮ menu (top right) and select 'Open in Chrome' or 'Open in Safari' to install.");
      }
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') setMode('hidden')
    } else {
      alert("To install on iPhone: tap Share (□↑) then 'Add to Home Screen'.")
    }
  }

  if (mode === 'hidden') return null

  return (
    <div className="install-banner">
      <button className="big-blue-btn" onClick={handleClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Try m-Excel Now
      </button>
    </div>
  )
}
