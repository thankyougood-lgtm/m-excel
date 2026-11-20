import { useEffect, useState } from 'react'
import './InstallPrompt.css'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [mode, setMode] = useState<'hidden' | 'install' | 'inapp-fb' | 'inapp-tg' | 'inapp-ig' | 'inapp-other' | 'ios-safari'>('hidden')

  useEffect(() => {
    const ua = navigator.userAgent || ''

    // Already installed? Do nothing.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    if (standalone) return

    // Detect which app the user opened this link from
    const isFB       = /FBAN|FBAV|FB_IAB/i.test(ua)
    const isTelegram = /Telegram/i.test(ua)
    const isIG       = /Instagram/i.test(ua)
    const isMessenger = /Messenger/i.test(ua)
    const isWhatsApp = /WhatsApp/i.test(ua)

    const isIOS = /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream

    if (isFB)            setMode('inapp-fb')
    else if (isTelegram) setMode('inapp-tg')
    else if (isIG || isMessenger) setMode('inapp-ig')
    else if (isWhatsApp) setMode('inapp-other')
    else if (isIOS)      setMode('ios-safari')   // iOS Chrome can't install either — only Safari
    else                 setMode('hidden')       // Real Chrome / Edge — wait for beforeinstallprompt

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setMode('install')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const installClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') setDeferredPrompt(null)
    setMode('hidden')
  }

  const openInChrome = () => {
    const ua = navigator.userAgent
    const url = window.location.href
    if (/Android/i.test(ua)) {
      const u = new URL(url)
      window.location.href = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;end`
    } else {
      window.open(url, '_blank')
    }
  }

  if (mode === 'hidden') return null

  return (
    <div className="install-banner">
      {mode === 'install' && (
        <>
          <p>📱 Install <strong>m-Excel</strong> for offline access</p>
          <button className="install-btn" onClick={installClick}>Install App</button>
          <button className="dismiss-btn" onClick={() => setMode('hidden')}>Later</button>
        </>
      )}

      {mode === 'inapp-fb' && (
        <>
          <p><strong>You're inside Facebook's browser.</strong></p>
          <p>To install m-Excel, you need Chrome (or Safari).</p>
          <p className="steps">
            <strong>Android:</strong> Tap <b>⋮</b> (top right) → <b>Open in Chrome</b><br />
            <strong>iPhone:</strong> Tap <b>⋯</b> (bottom right) → <b>Open in Safari</b>
          </p>
          <button className="install-btn" onClick={openInChrome}>Try to open Chrome</button>
          <button className="dismiss-btn" onClick={() => setMode('hidden')}>Close</button>
        </>
      )}

      {mode === 'inapp-tg' && (
        <>
          <p><strong>You're inside Telegram's browser.</strong></p>
          <p>Tap <b>⋮</b> (top right) → <b>Open in Chrome</b> (or Safari on iPhone).</p>
          <p>Then look for the install icon in the address bar.</p>
          <button className="install-btn" onClick={openInChrome}>Try to open Chrome</button>
          <button className="dismiss-btn" onClick={() => setMode('hidden')}>Close</button>
        </>
      )}

      {(mode === 'inapp-ig' || mode === 'inapp-other') && (
        <>
          <p><strong>You're in an in-app browser.</strong></p>
          <p>Open this link in Chrome (Android) or Safari (iPhone) to install.</p>
          <button className="install-btn" onClick={openInChrome}>Try to open Chrome</button>
          <button className="dismiss-btn" onClick={() => setMode('hidden')}>Close</button>
        </>
      )}

      {mode === 'ios-safari' && (
        <>
          <p>📱 <strong>Install m-Excel on iPhone:</strong></p>
          <p>Tap <b>Share</b> (□ with ↑) at the bottom → <b>Add to Home Screen</b>.</p>
          <button className="dismiss-btn" onClick={() => setMode('hidden')}>Okay</button>
        </>
      )}
    </div>
  )
}
