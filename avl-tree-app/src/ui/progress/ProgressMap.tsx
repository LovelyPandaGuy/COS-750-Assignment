import { MasteryBadge } from '../base'
import { Link } from 'react-router-dom'
import { LessonLink } from './LessonLink'
import type { LessonItem, StateLabels } from './types'
import './progress.css'

export interface ProgressMapProps {
  /** Names the navigation landmark. */
  label: string
  lessons: readonly LessonItem[]
  labels: StateLabels
  /** The last item: the readiness summary. */
  summary: { label: string; href: string }
}

/**
 * Frame 1e ProgressMap: every lesson in order with its given state (word, symbol and border; FR-LRN-03),
 * then the summary. Vertical below the desktop width, one row from it (BREAKPOINTS, D118; proposal question 8). Mastery, when
 * given, is a separate badge under a done lesson (design system ProgressMap).
 */
export function ProgressMap({ label, lessons, labels, summary }: ProgressMapProps) {
  return (
    <nav className="progress-map-nav" aria-label={label}>
      <ol className="progress-map">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="progress-map-entry">
            <LessonLink lesson={lesson} labels={labels} />
            {lesson.mastery !== undefined && lesson.state === 'done' && (
              <span className="progress-mastery">
                <MasteryBadge state={lesson.mastery} compact />
              </span>
            )}
          </li>
        ))}
        <li className="progress-map-entry">
          <Link className="progress-summary" to={summary.href}>
            {summary.label}
          </Link>
        </li>
      </ol>
    </nav>
  )
}
