import { useId } from 'react'
import { Button } from '../base'
import './progress.css'

export interface ResumeCardProps {
  heading: string
  /** Where the student stopped, already worded. */
  line: string
  resumeLabel: string
  onResume: () => void
}

/** Frame 1b ResumeCard: shown only on a return visit (FR-ONB-03); the screen decides by giving it. */
export function ResumeCard({ heading, line, resumeLabel, onResume }: ResumeCardProps) {
  const headingId = useId()
  return (
    <section className="progress-card resume" aria-labelledby={headingId}>
      <h2 id={headingId} className="progress-card-title">
        {heading}
      </h2>
      <p className="progress-card-text">{line}</p>
      <Button variant="secondary" onClick={onResume}>
        {resumeLabel}
      </Button>
    </section>
  )
}
