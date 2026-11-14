import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { LessonLink } from './LessonLink'
import type { LessonItem, StateLabels } from './types'
import './progress.css'

export interface LessonMenuProps {
  buttonLabel: string
  /** Names the navigation landmark inside the panel. */
  panelLabel: string
  lessons: readonly LessonItem[]
  labels: StateLabels
  /** Called after a lesson link is followed. */
  onNavigate?: () => void
}

/**
 * The lesson list from every screen (ID 8.2; design decision 5): a disclosure button and a panel in the
 * page flow, not a modal. Escape or the button closes it; focus returns to the button from inside.
 */
export function LessonMenu({ buttonLabel, panelLabel, lessons, labels, onNavigate }: LessonMenuProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  const close = () => {
    const inside = panel.current?.contains(document.activeElement) ?? false
    setOpen(false)
    if (inside) button.current?.focus()
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      setOpen(false)
      button.current?.focus()
    }
  }

  return (
    <div className="lesson-menu" onKeyDown={onKeyDown}>
      <button ref={button} type="button" className="btn btn-secondary lesson-menu-button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        {buttonLabel}
      </button>
      <div ref={panel} id={panelId} className="lesson-menu-panel" hidden={!open}>
        <nav aria-label={panelLabel}>
          <ol className="lesson-menu-list">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <LessonLink
                  lesson={lesson}
                  labels={labels}
                  onNavigate={() => {
                    close()
                    onNavigate?.()
                  }}
                />
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}
