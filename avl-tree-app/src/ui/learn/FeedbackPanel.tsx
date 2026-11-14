import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './learn.css'
import { Button } from '../base'

// The design's check feedback panel (revamp-question-and-feedback, D129). Not the rotation feedback of
// Do it yourself, which is src/ui/practice/FeedbackPanel.tsx and still the `FeedbackPanel` contract.

interface FeedbackParts {
  verdict: string
  why: string
  /** The review link to the concept (D27). */
  concept: { label: string; to: string }
  /** The one primary action: Try again, Next question, Continue. */
  next: { label: string; onClick: () => void }
  /** A neutral glyph for the variant, from content. Never a cross (D27). */
  icon?: string
}

/** Variants as a union: only the cap may carry the full answer and the lecture question (D130). */
export type FeedbackPanelProps =
  | { variant: null }
  | ({ variant: 'correct' } & FeedbackParts)
  | ({ variant: 'not-yet' } & FeedbackParts)
  | ({ variant: 'cap'; fullAnswer?: ReactNode; lectureDraft?: ReactNode } & FeedbackParts)

type Shown = Exclude<FeedbackPanelProps, { variant: null }>

function shownOf(props: FeedbackPanelProps): Shown | null {
  // TypeScript does not narrow this union on a `null` discriminant, so the check is spelled out and cast.
  return props.variant === null ? null : (props as Shown)
}

/**
 * Four-part feedback (FR-ASM-03, D27): verdict heading, why, concept link, next step. A polite live region
 * is always present and holds only "verdict. why"; focus moves to the heading when feedback appears.
 */
export function FeedbackPanel(props: FeedbackPanelProps) {
  const headingId = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const shown = shownOf(props)
  const key = shown === null ? null : `${shown.variant}\u0000${shown.verdict}`

  // Focus the heading when feedback appears or changes after the first render; never on mount, so a page
  // that opens with feedback already shown (a resumed check, the gallery) does not steal focus.
  const [lastKey, setLastKey] = useState<string | null>(key)
  const [focusRequest, setFocusRequest] = useState(0)
  if (lastKey !== key) {
    setLastKey(key)
    if (key !== null) setFocusRequest((n) => n + 1)
  }
  useEffect(() => {
    if (focusRequest > 0) heading.current?.focus()
  }, [focusRequest])

  const live = shown === null ? '' : shown.why === '' ? shown.verdict : `${shown.verdict}. ${shown.why}`

  return (
    <>
      <p role="status" className="learn-visually-hidden">
        {live}
      </p>
      {shown !== null && (
        <section className="learn-feedback" data-variant={shown.variant} aria-labelledby={headingId}>
          <h2 id={headingId} ref={heading} tabIndex={-1} className="learn-feedback-verdict">
            {shown.icon !== undefined && (
              <span className="learn-feedback-icon" aria-hidden="true">
                {shown.icon}
              </span>
            )}
            {shown.verdict}
          </h2>
          {shown.why !== '' && <p className="learn-feedback-why">{shown.why}</p>}
          {shown.variant === 'cap' && shown.fullAnswer}
          {shown.variant === 'cap' && shown.lectureDraft}
          <div className="learn-feedback-actions">
            <Link className="btn btn-quiet learn-feedback-link" to={shown.concept.to}>
              {shown.concept.label}
            </Link>
            <Button variant="primary" onClick={shown.next.onClick}>
              {shown.next.label}
            </Button>
          </div>
        </section>
      )}
    </>
  )
}
