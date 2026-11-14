import type { CSSProperties } from 'react'
import './progress.css'

export interface LessonProgressProps {
  /** For example "Lesson 4 of 9" (ID 8.2). */
  label: string
  completed: number
  total: number
}

/**
 * The revealed-structure readout for the TopBar's progress slot (D117, ID 8.2, 10.4): the label as text
 * and an outlined bar. The bar is decorative because the text carries the meaning (design decision 6).
 */
export function LessonProgress({ label, completed, total }: LessonProgressProps) {
  const share = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0
  return (
    <div className="lesson-progress">
      <p className="lesson-progress-label">{label}</p>
      <span className="lesson-progress-track" data-progress-bar="" aria-hidden="true" style={{ '--progress-share': String(share) } as CSSProperties}>
        <span className="lesson-progress-fill" />
      </span>
    </div>
  )
}
