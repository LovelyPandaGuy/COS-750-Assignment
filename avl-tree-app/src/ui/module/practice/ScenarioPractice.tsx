import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { practiceModuleCopy } from '../../../content/modules/practice'
import { SCENARIOS, STRUCTURES } from '../../../content/modules/structures'
import { answersOf, type StructureId } from '../../../modules/compare'
import { PracticeFeedback, PracticeHints } from './PracticeFeedback'

const copy = practiceModuleCopy.scenario

export interface ScenarioPracticeProps {
  scenario: string
  /** The four structures in the order shown (seeded). */
  order: readonly StructureId[]
  choice: StructureId | undefined
  /** The choice that was checked; undefined until Check, and again after Try again. */
  checked: StructureId | undefined
  onChoose: (s: StructureId) => void
  onCheck: (s: StructureId) => void
  onTryAgain: () => void
  onNew: () => void
  onReview: () => void
  hintsUsed: number
}

/**
 * C8 practice: pick a structure for a scenario (LO9, D21). Controlled: the player keeps the
 * choice, the checked answer and the hints, so Back and Next keep them (FR-LRN-04). The answer
 * and every reason are computed from the structure record. Nothing is stored.
 */
export function ScenarioPractice({ scenario, order, choice, checked, onChoose, onCheck, onTryAgain, onNew, onReview, hintsUsed }: ScenarioPracticeProps) {
  const name = useId()
  const [prompt, setPrompt] = useState(false)
  const feedback = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement>(null)
  /** Counts Check presses; focus moves to the feedback only after one (never on mount or on a choice). */
  const [checks, setChecks] = useState(0)
  const sc = SCENARIOS[scenario]

  useEffect(() => {
    if (checks > 0) feedback.current?.focus()
  }, [checks])

  if (sc === undefined) return null
  const answer = answersOf(sc)[0]

  const check = (e: FormEvent) => {
    e.preventDefault()
    setChecks((n) => n + 1)
    if (choice === undefined) return setPrompt(true)
    setPrompt(false)
    onCheck(choice)
  }

  /** Try again removes the feedback buttons, so focus returns to the chosen option. */
  const tryAgain = () => {
    onTryAgain()
    form.current?.querySelector<HTMLInputElement>('input:checked')?.focus()
  }

  const verdict = checked === undefined ? null : checked === answer ? 'right' : 'not-yet'
  const text = checked === undefined ? (prompt ? copy.choose : null) : checked === answer ? copy.why.right(answer, sc) : copy.why.notYet(checked, sc)
  const hints = copy.hints.slice(0, hintsUsed).map((h) => h(sc))

  return (
    <div className="practice">
      <p className="scenario-text">{sc.text}</p>
      <form ref={form} className="practice-form" onSubmit={check}>
        <fieldset className="scenario-options">
          <legend>{copy.legend}</legend>
          {order.map((s) => (
            <label key={s} className="scenario-option">
              <input
                type="radio"
                name={name}
                value={s}
                checked={choice === s}
                onChange={() => {
                  setPrompt(false)
                  onChoose(s)
                }}
              />
              <span>{STRUCTURES[s].name}</span>
            </label>
          ))}
        </fieldset>
        <button type="submit" className="module-button module-button-primary">
          {practiceModuleCopy.check}
        </button>
      </form>
      <div ref={feedback} tabIndex={-1} className="scenario-feedback" aria-label={copy.feedbackLabel} role="group">
        <PracticeFeedback verdict={verdict} text={text} after={copy.done} onTryAgain={tryAgain} onReview={onReview} />
      </div>
      <PracticeHints hints={hints} />
      <button type="button" className="module-button module-button-quiet" onClick={onNew}>
        {copy.newScenario}
      </button>
    </div>
  )
}
