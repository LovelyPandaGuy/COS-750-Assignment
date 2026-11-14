import { lessonCopy } from '../../content/lesson'

const copy = lessonCopy.controls

export interface Toggle {
  open: boolean
  controls: string
  onToggle: () => void
}

export interface LessonControlsProps {
  onBack: () => void
  onNext: () => void
  backDisabled: boolean
  /** A check screen whose current question is not finished (lesson-checks). */
  nextDisabled?: boolean
  /** Explanation screens only (ID 8.2). */
  onSkip?: () => void
  /** Animation screens only: re-runs the current step (ID 8.2). */
  onReplay?: () => void
  /** Screens with a `showRule`. */
  rule?: Toggle
  /** Screens with a static `hint` (ID 9.4). */
  hint?: Toggle
}

/** Same place on every screen: navigation on one side, learning aids on the other (ID 8.3, D23). */
export function LessonControls({ onBack, onNext, backDisabled, nextDisabled = false, onSkip, onReplay, rule, hint }: LessonControlsProps) {
  return (
    <div role="group" aria-label={copy.stripLabel} className="control-strip">
      <div role="group" aria-label={copy.navLabel} className="control-strip-side">
        <button type="button" className="module-button module-button-secondary" onClick={onBack} disabled={backDisabled}>
          {copy.back}
        </button>
        <button type="button" className="module-button module-button-primary" onClick={onNext} disabled={nextDisabled}>
          {copy.next}
        </button>
        {onReplay && (
          <button type="button" className="module-button module-button-secondary" onClick={onReplay}>
            {copy.replay}
          </button>
        )}
        {onSkip && (
          <button type="button" className="module-button module-button-quiet" onClick={onSkip}>
            {copy.skip}
          </button>
        )}
      </div>
      <div role="group" aria-label={copy.aidsLabel} className="control-strip-side">
        {rule && (
          <button type="button" className="module-button module-button-secondary" aria-expanded={rule.open} aria-controls={rule.controls} onClick={rule.onToggle}>
            {copy.showRule}
          </button>
        )}
        {hint && (
          <button type="button" className="module-button module-button-secondary" aria-expanded={hint.open} aria-controls={hint.controls} onClick={hint.onToggle}>
            {copy.hint}
          </button>
        )}
      </div>
    </div>
  )
}
