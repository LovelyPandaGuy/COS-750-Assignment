import type { ItemState } from '../../assessment/report'
import { baseCopy } from '../../content/base'
import './base.css'

export type MasteryState = Exclude<ItemState, 'unassessed'>

export interface MasteryBadgeProps {
  state: MasteryState
  /** The student's own earlier state; a change is shown only when it differs (design principle 4). */
  before?: MasteryState
  /** Icon and word without the pill, for tables. Never icon only. */
  compact?: boolean
}

const FILL: Record<MasteryState, 'full' | 'half' | 'empty'> = { secure: 'full', developing: 'half', 'not-yet': 'empty' }

/** The fill level is the shape cue: full, half, empty (D25). */
function Icon({ state }: { state: MasteryState }) {
  const fill = FILL[state]
  return (
    <svg className="badge-icon" data-fill={fill} aria-hidden="true" viewBox="0 0 24 24">
      {fill === 'full' && <circle cx="12" cy="12" r="8" fill="currentColor" />}
      {fill === 'half' && <path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor" />}
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

/** A mastery state for one skill (add-ui-foundation), with the change since the student's last try. */
export function MasteryBadge({ state, before, compact = false }: MasteryBadgeProps) {
  const changed = before !== undefined && before !== state
  return (
    <span className={['badge', `badge-${state}`, compact ? 'badge-compact' : ''].filter(Boolean).join(' ')}>
      <span className="badge-pill">
        <Icon state={state} />
        <span className="badge-word">{baseCopy.mastery[state]}</span>
      </span>
      {changed && (
        <span className="badge-change">
          <span aria-hidden="true">
            {baseCopy.mastery[before]} → {baseCopy.mastery[state]} {baseCopy.sinceLastTry}
          </span>
          <span className="base-sr">{baseCopy.change(before, state)}</span>
        </span>
      )}
    </span>
  )
}
