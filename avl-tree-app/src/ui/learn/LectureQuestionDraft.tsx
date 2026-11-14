import { useId } from 'react'
import './learn.css'
import { Button } from '../base'

export interface LectureQuestionDraftProps {
  /** The drafted question (D81), as the student has edited it. */
  text: string
  added: boolean
  onAdd: () => void
  onChange: (text: string) => void
  onDecline: () => void
  labels: {
    heading: string
    note: string
    field: string
    add: string
    decline: string
    added: string
  }
}

/**
 * The drafted lecture question at the retry cap (frame 1l, FR-SCA-03): editable, Add or No thanks.
 * Presentation only: the screen saves it (FR-RDY-02).
 */
export function LectureQuestionDraft({ text, added, onAdd, onChange, onDecline, labels }: LectureQuestionDraftProps) {
  const headingId = useId()
  const fieldId = useId()
  return (
    <section className="learn-draft" aria-labelledby={headingId}>
      <h3 id={headingId} className="learn-draft-heading">
        {labels.heading}
      </h3>
      <p>{labels.note}</p>
      <label htmlFor={fieldId} className="learn-draft-label">
        {labels.field}
      </label>
      <textarea id={fieldId} className="learn-draft-field" rows={3} value={text} onChange={(e) => onChange(e.target.value)} />
      <div className="learn-draft-actions">
        <Button variant="primary" disabled={added} onClick={onAdd}>
          {labels.add}
        </Button>
        <Button variant="quiet" onClick={onDecline}>
          {labels.decline}
        </Button>
      </div>
      <p role="status" className="learn-draft-status">
        {added ? labels.added : ''}
      </p>
    </section>
  )
}
