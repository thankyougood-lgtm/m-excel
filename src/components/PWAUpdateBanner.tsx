import { useRegisterSW } from 'virtual:pwa-register/react'

type SWRegistration = ServiceWorkerRegistration | undefined

export function PWAUpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: SWRegistration) {
      if (r) {
        setInterval(() => {
          r.update()
        }, 60 * 60 * 1000)
      }
    },
  })

  if (!needRefresh) return null

  return (
    <div className="pwa-update-banner">
      <span>A new version of Mark Book is available.</span>
      <div className="pwa-banner-actions">
        <button onClick={() => setNeedRefresh(false)} className="pwa-btn-later">
          Later
        </button>
        <button onClick={() => updateServiceWorker(true)} className="pwa-btn-update">
          Update
        </button>
      </div>
    </div>
  )
}
