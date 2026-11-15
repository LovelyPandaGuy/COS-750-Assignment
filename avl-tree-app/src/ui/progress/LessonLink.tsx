import { useId, type KeyboardEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import type { LessonItem, StateLabels } from './types'

/**
 * One lesson as the map and the menu draw it (design decision 3): ID, title, state symbol and word,
 * and the optional word. A locked lesson is a focusable link with no href, aria-disabled, and its
 * reason as visible text and accessible description, so the reason is announced and nothing navigates.
 */
export function LessonLink({ lesson, labels, onNavigate }: { lesson: LessonItem; labels: StateLabels; onNavigate?: () => void }) {
  const reasonId = useId()
  const body = (
    <>
      <span className="progress-symbol" aria-hidden="true">
        {labels.symbols[lesson.state]}
      </span>
      <span className="progress-text">
        <span className="progress-title">
          <span className="progress-id">{lesson.id}</span> {lesson.title}
        </span>
        <span className="progress-state">{labels.words[lesson.state]}</span>
        {lesson.optional && <span className="progress-optional">{labels.optional}</span>}
        {lesson.state === 'locked' && (
          <span id={reasonId} className="progress-reason">
            {lesson.reason}
          </span>
        )}
      </span>
    </>
  )
  if (lesson.state === 'locked') {
    const stop = (e: MouseEvent | KeyboardEvent) => {
      if ('key' in e && e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
    }
    return (
      <a className="progress-item" data-lesson={lesson.id} data-state="locked" role="link" aria-disabled="true" tabIndex={0} aria-describedby={reasonId} onClick={stop} onKeyDown={stop}>
        {body}
      </a>
    )
  }
  return (
    <Link
      className="progress-item"
      data-lesson={lesson.id}
      data-state={lesson.state}
      to={lesson.href}
      aria-current={lesson.page === true ? 'page' : lesson.state === 'current' ? 'step' : undefined}
      onClick={onNavigate}
    >
      {body}
    </Link>
  )
}
