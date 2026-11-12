import { practiceModuleCopy as copy } from '../../../content/modules/practice'

export interface PracticeFeedbackProps {
  /** null: nothing to say yet. */
  verdict: 'right' | 'not-yet' | null
  /** The reason, or a short instruction when there is no verdict. */
  text: string | null
  /** What to do next after a right answer. */
  after?: string | null
  onTryAgain: () => void
  onReview: () => void
}

/**
 * Four-part feedback (D27): verdict, why, Review, next action. A polite live region; the text
 * starts with the verdict word so it is read first. No icon, no red, no cross.
 */
export function PracticeFeedback({ verdict, text, after = null, onTryAgain, onReview }: PracticeFeedbackProps) {
  return (
    <div role="status" aria-live="polite" className="practice-panel" data-verdict={verdict ?? 'none'}>
      {verdict !== null && <strong>{verdict === 'right' ? copy.verdict.right : copy.verdict.notYet} </strong>}
      {text !== null && <span>{text}</span>}
      {verdict !== null && (
        <span className="practice-panel-actions">
          <button type="button" className="module-button module-button-quiet" onClick={onReview}>
            {copy.review}
          </button>
          {verdict === 'not-yet' && (
            <button type="button" className="module-button module-button-secondary" onClick={onTryAgain}>
              {copy.tryAgain}
            </button>
          )}
        </span>
      )}
      {verdict === 'right' && after !== null && <span className="practice-panel-after">{after}</span>}
    </div>
  )
}

/** Hints shown so far, in order (D21). Nothing when none is open. */
export function PracticeHints({ hints }: { hints: string[] }) {
  if (hints.length === 0) return null
  return (
    <ol className="practice-hints" aria-label={copy.hintsLabel}>
      {hints.map((h, i) => (
        <li key={i}>{h}</li>
      ))}
    </ol>
  )
}
