import { useId } from 'react'
import { Link } from 'react-router-dom'
import type { FlagItem } from './types'
import './readiness.css'

export interface ConfidenceFlagsProps {
  heading: string
  /** A text symbol shown before each flag; never the only signal. */
  symbol: string
  items: readonly FlagItem[]
  /** Heading level for the block (from ReadinessSummary). */
  headingLevel?: 2 | 3 | 4
}

/** Frame 1o note 2: where the student was sure but it did not match, framed as worth a look (ID 9.2, D27). */
export function ConfidenceFlags({ heading, symbol, items, headingLevel = 3 }: ConfidenceFlagsProps) {
  const headingId = useId()
  if (items.length === 0) return null
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4'
  return (
    <section className="readiness-block readiness-flags" aria-labelledby={headingId}>
      <H id={headingId} className="readiness-block-heading">
        {heading}
      </H>
      <ul className="readiness-flag-list">
        {items.map((f) => (
          <li key={f.id} className="readiness-flag">
            <span className="readiness-flag-symbol" aria-hidden="true">
              {symbol}
            </span>
            <span className="readiness-flag-body">
              <span className="readiness-flag-text">
                <span className="readiness-id">{f.id}</span> {f.text}
              </span>
              <Link className="readiness-review" to={f.link.href}>
                {f.link.label}
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
