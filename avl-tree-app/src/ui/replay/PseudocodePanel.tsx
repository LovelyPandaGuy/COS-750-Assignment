import { useId } from 'react'
import './replay.css'
import { replayCopy } from '../../content/replay'
import type { SearchForm } from '../../engine/search'

const copy = replayCopy.panel

export interface PseudocodePanelProps {
  /** Shown as "Pseudocode: <name>". */
  name: string
  listing: readonly string[]
  /** The current step's pseudocode line (1-based), or null before the first step. */
  line: number | null
  /** Search only: the loop/recursive choice. */
  form?: SearchForm
  onForm?: (form: SearchForm) => void
}

/** The listing with the engine's current line lit (FR-VIS-04). Stateless. */
export function PseudocodePanel({ name, listing, line, form, onForm }: PseudocodePanelProps) {
  const group = useId()
  return (
    <section className="pseudo" aria-label={copy.title(name)}>
      {form !== undefined && onForm && (
        <fieldset className="pseudo-forms">
          <legend>{copy.formLegend}</legend>
          {(['loop', 'recursive'] as const).map((f) => (
            <label key={f} className="pseudo-option">
              <input type="radio" name={group} checked={form === f} onChange={() => onForm(f)} />
              {f === 'loop' ? copy.loop : copy.recursive}
            </label>
          ))}
        </fieldset>
      )}
      <ol className="pseudo-list">
        {listing.map((text, i) => {
          const n = i + 1
          const current = n === line
          return (
            <li key={n} className="pseudo-line" aria-current={current ? 'step' : undefined}>
              <span className="pseudo-marker" aria-hidden="true">
                {current ? copy.marker : ''}
              </span>
              <span className="pseudo-number">{n}</span>
              <code className="pseudo-code">{text}</code>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
