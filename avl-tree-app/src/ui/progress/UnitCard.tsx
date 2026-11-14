import { useId, type ReactNode } from 'react'
import type { LessonState, StateLabels } from './types'
import './progress.css'

export interface UnitCardProps {
  id: string
  title: string
  /** One line: the lesson's goal (ID 10.3, one stated goal per lesson). */
  goal: string
  /** Estimated time, already worded ("about 6 min"). */
  time: string
  state: LessonState
  labels: StateLabels
  /** The activity list and the continue action, from HubView. */
  children?: ReactNode
}

/** Frame 1e UnitCard: one lesson with its title, goal, time and state word. */
export function UnitCard({ id, title, goal, time, state, labels, children }: UnitCardProps) {
  const headingId = useId()
  return (
    <section className="unit-card progress-card" data-unit-card="" data-state={state} aria-labelledby={headingId}>
      <div className="unit-head">
        <h2 id={headingId} className="unit-title">
          <span className="progress-id">{id}</span> {title}
        </h2>
        <span className="unit-meta">
          <span className="progress-state">
            <span aria-hidden="true">{labels.symbols[state]}</span> {labels.words[state]}
          </span>
          <span className="unit-time">{time}</span>
        </span>
      </div>
      <p className="unit-goal">{goal}</p>
      {children}
    </section>
  )
}
