import type { PhaseLabels, PhaseState } from './types'
import './progress.css'

export interface ActivityListProps {
  label: string
  /** The current lesson's phases in lesson order (D96); not reorderable (proposal question 7). */
  phases: readonly { id: string; title: string; state: PhaseState }[]
  labels: PhaseLabels
}

/** Frame 1e ActivityList: the current lesson's phases, each done, next or to do, by word and border. */
export function ActivityList({ label, phases, labels }: ActivityListProps) {
  return (
    <ol className="activity-phases" aria-label={label}>
      {phases.map((p) => (
        <li key={p.id} className="activity-phase" data-state={p.state}>
          <span className="progress-symbol" aria-hidden="true">
            {labels.symbols[p.state]}
          </span>
          <span className="activity-phase-title">{p.title}</span>
          <span className="progress-state">{labels.words[p.state]}</span>
        </li>
      ))}
    </ol>
  )
}
