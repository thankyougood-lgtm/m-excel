import { useRef } from 'react'

type SheetTab = {
  id: number
  label: string
  active?: boolean
}

interface SheetTabsProps {
  tabs: SheetTab[]
  onSelect?: (id: number) => void
  onAdd?: () => void
  onLongPress?: (id: number) => void
}

export function SheetTabs({ tabs, onSelect, onAdd, onLongPress }: SheetTabsProps) {
  const longPressTimer = useRef<number | null>(null)

  const startLongPress = (id: number) => {
    if (!onLongPress) return
    longPressTimer.current = window.setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50)
      onLongPress(id)
    }, 600)
  }

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <div className="sheet-tabs-row" role="tablist" aria-label="Sheet tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.active}
          className={`sheet-tab ${tab.active ? 'is-active' : ''}`}
          onClick={() => onSelect?.(tab.id)}
          onPointerDown={() => startLongPress(tab.id)}
          onPointerUp={cancelLongPress}
          onPointerLeave={cancelLongPress}
        >
          {tab.label}
        </button>
      ))}

      <button type="button" className="sheet-add-tab" aria-label="Add sheet" onClick={onAdd}>
        +
      </button>
    </div>
  )
}
