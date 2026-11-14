import { useId } from 'react'
import { Link } from 'react-router-dom'
import './progress.css'

export interface SandboxCardProps {
  title: string
  text: string
  /** Shown only when given (after C2, D11). */
  suggestion?: string
  openLabel: string
  href: string
}

/** Frame 1e SandboxCard: always reachable (D11, FR-VIS-08). */
export function SandboxCard({ title, text, suggestion, openLabel, href }: SandboxCardProps) {
  const headingId = useId()
  return (
    <section className="progress-card" aria-labelledby={headingId}>
      <h2 id={headingId} className="progress-card-title">
        {title}
      </h2>
      <p className="progress-card-text">{text}</p>
      {suggestion !== undefined && <p className="progress-card-text progress-suggestion">{suggestion}</p>}
      <Link className="btn btn-secondary progress-card-link" to={href}>
        {openLabel}
      </Link>
    </section>
  )
}
