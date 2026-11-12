import { playerCopy as copy } from '../../content/modules/player'

export interface ControlStripProps {
  onBack: () => void
  onNext: () => void
  /** Present on content and worked-example steps only (D20). */
  onSkip?: () => void
  /** Present when the step has rule text. */
  rule?: { open: boolean; controls: string; onToggle: () => void }
  /** Present on practice steps: hints left, or the review offer once they run out (D21). */
  hint?: { left: number; onHint: () => void; onReview: () => void }
}

/** Same place on every step: navigation on one side, learning aids on the other (D23). */
export function ControlStrip({ onBack, onNext, onSkip, rule, hint }: ControlStripProps) {
  return (
    <div role="group" aria-label={copy.stripLabel} className="control-strip">
      <div role="group" aria-label={copy.navLabel} className="control-strip-side">
        <button type="button" className="module-button module-button-secondary" onClick={onBack}>
          {copy.back}
        </button>
        <button type="button" className="module-button module-button-primary" onClick={onNext}>
          {copy.next}
        </button>
        {onSkip && (
          <button type="button" className="module-button module-button-quiet" onClick={onSkip}>
            {copy.skip}
          </button>
        )}
      </div>
      <div role="group" aria-label={copy.aidsLabel} className="control-strip-side">
        {rule && (
          <button
            type="button"
            className="module-button module-button-secondary"
            aria-expanded={rule.open}
            aria-controls={rule.controls}
            onClick={rule.onToggle}
          >
            {copy.showRule}
          </button>
        )}
        {hint &&
          (hint.left > 0 ? (
            <button type="button" className="module-button module-button-secondary" onClick={hint.onHint}>
              {copy.hint(hint.left)}
            </button>
          ) : (
            <button type="button" className="module-button module-button-secondary" onClick={hint.onReview}>
              {copy.reviewRule}
            </button>
          ))}
      </div>
    </div>
  )
}
