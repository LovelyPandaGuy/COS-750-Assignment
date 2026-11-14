import { useId, type ReactNode } from 'react'
import './learn.css'

export type RungKind = 'nudge' | 'fuller-hint' | 'worked-example' | 'guided'
export type RungState = 'open' | 'seen' | 'available' | 'waiting'

export interface Rung {
  kind: RungKind
  state: RungState
  title: string
  /** Shown only while the rung is open. */
  body: ReactNode
}

export interface ScaffoldPanelProps {
  /** In order. How many and which kinds is the caller's policy (D21 practice, D76 checks; D106). */
  rungs: readonly Rung[]
  /** Hints the student may still open; shown on the Hint button (D23). */
  hintsLeft: number
  onHint: () => void
  labels: {
    region: string
    state: Record<RungState, string>
    /** The button's visible word, next to the count. */
    hintText: string
    /** The button's accessible name, with the count woven in. */
    hint: (left: number) => string
  }
}

/**
 * The support ladder as presentation states (design system ScaffoldPanel, frames 1j, 1k; FR-SCA-02):
 * each rung numbered, its state in words and by border, its body only when open, and a Hint button
 * that shows how many hints are left. At 0 it stays in place, marked unavailable.
 */
export function ScaffoldPanel({ rungs, hintsLeft, onHint, labels }: ScaffoldPanelProps) {
  const headingId = useId()
  const none = hintsLeft <= 0
  return (
    <section className="learn-scaffold" aria-labelledby={headingId}>
      <h3 id={headingId} className="learn-scaffold-heading">
        {labels.region}
      </h3>
      <ol className="learn-rungs">
        {rungs.map((r, i) => (
          <li key={`${r.kind}-${i}`} className="learn-rung" data-kind={r.kind} data-state={r.state}>
            <div className="learn-rung-head">
              <span className="learn-rung-number">{i + 1}</span>{' '}
              <span className="learn-rung-title">{r.title}</span>{' '}
              <span className="learn-rung-state">{labels.state[r.state]}</span>
            </div>
            {r.state === 'open' && <div className="learn-rung-body">{r.body}</div>}
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="btn btn-secondary learn-hint"
        aria-label={labels.hint(hintsLeft)}
        aria-disabled={none || undefined}
        onClick={() => {
          if (!none) onHint()
        }}
      >
        {labels.hintText}{' '}
        <span className="learn-hint-count" aria-hidden="true">
          {Math.max(0, hintsLeft)}
        </span>
      </button>
    </section>
  )
}
