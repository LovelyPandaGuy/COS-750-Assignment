import { useId } from 'react'
import './learn.css'

/** One confidence level: the value stored by the caller and its text label. */
export interface ConfidenceLevel {
  value: string
  text: string
}

export interface ConfidenceRatingProps {
  /**
   * The chosen level's value, or null. A plain string, not the stored `Confidence` type: the design draws
   * three levels and the learner state stores two (proposal question 4, [OPEN]); the screen maps them.
   */
  value: string | null
  onChange: (value: string) => void
  label: string
  /** In order, least to most sure. Each is drawn with as many filled bars as its position. */
  levels: readonly ConfidenceLevel[]
  /** "(optional)" or similar, from content. */
  optionalNote?: string
  disabled?: boolean
}

const BAR_W = 6
const BAR_GAP = 3
const BAR_H = 16

/**
 * "How sure are you?" (frames 1c, 1i; FR-RDY-01, NFR-02): a native radio group, arrow-key operable, where
 * each level reads by its text and its bar count, never by colour alone.
 */
export function ConfidenceRating({ value, onChange, label, levels, optionalNote, disabled = false }: ConfidenceRatingProps) {
  const name = useId()
  const labelId = useId()
  const n = levels.length
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="learn-confidence">
      <p id={labelId} className="learn-confidence-label">
        {label}
        {optionalNote !== undefined && <span className="learn-confidence-note"> {optionalNote}</span>}
      </p>
      <div className="learn-levels">
        {levels.map((level, i) => (
          <label key={level.value} className="learn-level" data-level={i + 1} data-selected={value === level.value ? '' : undefined}>
            <input type="radio" name={name} value={level.value} checked={value === level.value} disabled={disabled} onChange={() => onChange(level.value)} />
            <svg className="learn-bars" aria-hidden="true" width={n * BAR_W + (n - 1) * BAR_GAP} height={BAR_H}>
              {levels.map((_, b) => (
                <rect
                  key={b}
                  data-bar=""
                  data-filled={b <= i ? '' : undefined}
                  x={b * (BAR_W + BAR_GAP)}
                  y={BAR_H - (BAR_H * (b + 1)) / n}
                  width={BAR_W}
                  height={(BAR_H * (b + 1)) / n}
                  rx={1}
                />
              ))}
            </svg>
            <span className="learn-level-text">{level.text}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
