import { useEffect, useId, useRef, useState } from 'react'
import { shellCopy } from '../content/shell'

/** Stub: opens a panel with one line of copy. No working controls yet. */
export function AaMenu() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open])

  return (
    <div className="aa-menu" ref={root}>
      <button
        ref={button}
        type="button"
        className="aa-button"
        aria-label={shellCopy.aaButtonName}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {shellCopy.aaButtonText}
      </button>
      {open && (
        <div id={panelId} className="aa-panel" role="region" aria-label={shellCopy.aaButtonName} tabIndex={-1}>
          <p>{shellCopy.aaPanelLine}</p>
        </div>
      )}
    </div>
  )
}
