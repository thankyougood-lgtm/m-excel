import { useState, useEffect } from 'react'
import { parseAndMergeTwoFiles } from '../../lib/import/mergeTeacherFiles'
import { writeRosterXlsx } from '../../export/roster/writeRosterXlsx'
import { formatAcademicYear } from '../../export/roster/academicYear'
import './HomePage.css'

interface HomePageProps {
  onOpenAddRecord: () => void
  t: (key: string) => string
}

// --- Custom SVG Icons (Pro Tuned) ---
const IconPlus = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)
const IconFileText = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)
const IconCloudUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path>
  </svg>
)
const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
  </svg>
)
const IconRefreshCw = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 21v-5H3"></path>
  </svg>
)

export function HomePage({ onOpenAddRecord, t }: HomePageProps) {
  const [sem1File, setSem1File] = useState<File | null>(null)
  const [sem2File, setSem2File] = useState<File | null>(null)
  const [isMerging, setIsMerging] = useState(false)
      const [installPrompt, setInstallPrompt] = useState<any>(null)

      useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
          e.preventDefault()
          setInstallPrompt(e)
        }
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }, [])

      const handleInstallClick = async () => {
        if (!installPrompt) return
        installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === 'accepted') {
          setInstallPrompt(null)
        }
      }

  const handleMerge = async () => {
    if (!sem1File || !sem2File) return
    setIsMerging(true)
    
    try {
      const model = await parseAndMergeTwoFiles(sem1File, sem2File)
      
      const buffer = await writeRosterXlsx({
        model,
        schoolName: 'Merged Roster',
        className: 'Combined Class',
        grade: 'All',
        section: 'All',
        academicYear: formatAcademicYear('2018 EC'),
      })

      const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Merged_Roster_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err.message || 'Failed to merge files.')
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <section className="page-panel home-panel">
      
      {/* 1. Add Record Card */}
      <div className="home-pro-card" onClick={onOpenAddRecord}>
        <div className="pro-card-icon primary-icon">
          <IconPlus />
        </div>
        <div className="pro-card-content">
          <div className="pro-card-title">{t('home.addTitle')}</div>
          <div className="pro-card-subtitle">
            <IconFileText /> {t('home.addDesc')}
          </div>
        </div>
      </div>

      {installPrompt && (
        <button 
          onClick={handleInstallClick}
          className="home-install-btn"
          style={{
            background: '#2F5BE0', color: 'white', padding: '12px 24px', borderRadius: '30px', border: 'none',
            fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(47, 91, 224, 0.3)', margin: '16px 0', cursor: 'pointer',
            width: '100%', maxWidth: '440px', justifyContent: 'center'
          }}
        >
          📲 {t('home.installApp')}
        </button>
      )}

      {/* 2. Upload & Merge Card */}
      <div className="home-pro-card upload-card">
        <div className="pro-card-icon secondary-icon">
          <IconCloudUpload />
        </div>
        <div className="pro-card-content">
          <div className="pro-card-title">{t('home.uploadTitle')}</div>
          <div className="pro-card-subtitle">
            <IconRefreshCw /> {t('home.uploadDesc')}
          </div>
        </div>

        <div className="pro-upload-actions">
          <label className={`pro-file-btn ${sem1File ? 'has-file' : ''}`}>
            <IconFolder />
            <span>{sem1File ? sem1File.name : t('home.sem1Btn')}</span>
            <input type="file" accept=".xlsx" onChange={(e) => setSem1File(e.target.files?.[0] || null)} />
          </label>

          <label className={`pro-file-btn ${sem2File ? 'has-file' : ''}`}>
            <IconFolder />
            <span>{sem2File ? sem2File.name : t('home.sem2Btn')}</span>
            <input type="file" accept=".xlsx" onChange={(e) => setSem2File(e.target.files?.[0] || null)} />
          </label>

          <button 
            type="button" 
            className="pro-merge-btn" 
            onClick={handleMerge}
            disabled={!sem1File || !sem2File || isMerging}
          >
            {isMerging ? '...' : t('home.mergeBtn')}
          </button>
        </div>
      </div>
    </section>
  )
}
