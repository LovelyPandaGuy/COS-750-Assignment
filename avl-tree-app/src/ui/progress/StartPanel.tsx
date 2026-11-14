import { useId, type ReactNode } from 'react'
import { Button } from '../base'
import './progress.css'

export interface StartPanelProps {
  heading: string
  /** The session length comes in here (D3); the component adds none. */
  intro: string
  points?: readonly string[]
  startLabel: string
  onStart: () => void
  /** The chain-versus-balanced hero diagram, passed in by the screen. */
  hero?: ReactNode
}

/** Frame 1b StartPanel: purpose and the one primary start action (FR-ONB-02). */
export function StartPanel({ heading, intro, points = [], startLabel, onStart, hero }: StartPanelProps) {
  const headingId = useId()
  return (
    <section className="start-panel" aria-labelledby={headingId}>
      <h1 id={headingId}>{heading}</h1>
      <p className="start-intro">{intro}</p>
      {points.length > 0 && (
        <ul className="start-points">
          {points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      <Button variant="primary" onClick={onStart}>
        {startLabel}
      </Button>
      {hero !== undefined && <div className="start-hero">{hero}</div>}
    </section>
  )
}
