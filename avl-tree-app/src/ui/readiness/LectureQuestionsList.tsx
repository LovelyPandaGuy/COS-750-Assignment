import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../base'
import type { QuestionItem, QuestionLabels } from './types'
import './readiness.css'

export interface LectureQuestionsListProps {
  questions: readonly QuestionItem[]
  labels: QuestionLabels
  onEdit: (id: string, text: string) => void
  onRemove: (id: string) => void
  headingLevel?: 2 | 3 | 4
}

/**
 * Frame 1o LectureQuestionsList (FR-RDY-02, note 3; design decision 8): the questions to bring, each
 * editable inline or removable where the props allow. One question is edited at a time; Save and Cancel
 * return focus to that question's Edit button. Stores nothing itself.
 */
export function LectureQuestionsList({ questions, labels, onEdit, onRemove, headingLevel = 3 }: LectureQuestionsListProps) {
  const headingId = useId()
  const baseId = useId()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const section = useRef<HTMLElement>(null)
  const returnTo = useRef<string | null>(null)
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4'

  useEffect(() => {
    if (editing === null && returnTo.current !== null) {
      const id = returnTo.current
      Array.from(section.current?.querySelectorAll<HTMLButtonElement>('[data-edit]') ?? []).find((b) => b.dataset.edit === id)?.focus()
      returnTo.current = null
    }
  }, [editing])

  const close = (id: string) => {
    returnTo.current = id
    setEditing(null)
  }

  return (
    <section ref={section} className="readiness-block readiness-questions" aria-labelledby={headingId}>
      <H id={headingId} className="readiness-block-heading">
        {labels.heading}
      </H>
      {questions.length === 0 ? (
        <p className="readiness-empty">{labels.empty}</p>
      ) : (
        <ol className="readiness-question-list">
          {questions.map((q, i) => {
            const textId = `${baseId}-q${i}`
            const fieldId = `${baseId}-f${i}`
            return (
              <li key={q.id} className="readiness-question">
                {editing === q.id ? (
                  <div className="readiness-question-edit">
                    <label className="readiness-field-label" htmlFor={fieldId}>
                      {labels.field}
                    </label>
                    <textarea id={fieldId} className="readiness-field" rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
                    <div className="readiness-question-actions">
                      <Button
                        variant="primary"
                        onClick={() => {
                          onEdit(q.id, draft)
                          close(q.id)
                        }}
                      >
                        {labels.save}
                      </Button>
                      <Button variant="secondary" onClick={() => close(q.id)}>
                        {labels.cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p id={textId} className="readiness-question-text">
                      {q.text}
                    </p>
                    {(q.editable || q.removable) && (
                      <div className="readiness-question-actions">
                        {q.editable && (
                          <Button
                            variant="quiet"
                            data-edit={q.id}
                            aria-describedby={textId}
                            onClick={() => {
                              setDraft(q.text)
                              setEditing(q.id)
                            }}
                          >
                            {labels.edit}
                          </Button>
                        )}
                        {q.removable && (
                          <Button variant="quiet" aria-describedby={textId} onClick={() => onRemove(q.id)}>
                            {labels.remove}
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
