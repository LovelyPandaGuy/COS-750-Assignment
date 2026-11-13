import { Link } from 'react-router-dom'
import { checkCopy } from '../../../content/check'

export interface CheckFeedbackProps {
  /** null before an answer: the live region stays on the page, empty, so a later message is announced. */
  verdict: 'right' | 'not-yet' | null
  why: string
  /** Extra sentence for a tree answer: the first step the student's tree does not reach. */
  diverged?: string | null
  reviewTo: string
  isLast: boolean
  /** The retry cap is reached: no Try again, Continue instead. */
  capped?: boolean
  onTryAgain: () => void
  onNext: () => void
}

/**
 * Four-part feedback (D27): verdict, why, Review, next step. A polite live region whose text starts
 * with the verdict. No icon, no red, no cross.
 */
export function CheckFeedback({ verdict, why, diverged = null, reviewTo, isLast, capped = false, onTryAgain, onNext }: CheckFeedbackProps) {
  return (
    <div role="status" aria-live="polite" aria-label={checkCopy.feedbackLabel} className="practice-panel" data-verdict={verdict ?? 'none'}>
      {verdict !== null && (
        <>
          <strong>{verdict === 'right' ? checkCopy.verdict.right : checkCopy.verdict.notYet} </strong>
          {why !== '' && <span>{why} </span>}
          {diverged !== null && <span>{diverged} </span>}
          <span className="practice-panel-actions">
            <Link className="module-button module-button-quiet" to={reviewTo}>
              {checkCopy.review}
            </Link>
            {verdict === 'not-yet' && !capped ? (
              <button type="button" className="module-button module-button-secondary" onClick={onTryAgain}>
                {checkCopy.tryAgain}
              </button>
            ) : (
              <button type="button" className="module-button module-button-secondary" onClick={onNext}>
                {isLast || capped ? checkCopy.continue : checkCopy.nextQuestion}
              </button>
            )}
          </span>
        </>
      )}
    </div>
  )
}
