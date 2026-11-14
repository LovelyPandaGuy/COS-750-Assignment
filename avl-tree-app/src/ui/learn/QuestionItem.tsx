import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import './learn.css'
import type { Instance, Mark, Response } from '../../assessment/types'
import { TreeView } from '../tree/TreeView'
import type { TreeViewProps } from '../contracts'
import { signed } from '../tree/describe'

/** Every word QuestionItem shows that is not from the instance (revamp-question-and-feedback, D103). */
export interface QuestionItemLabels {
  choiceLegend: string
  yourAnswer: string
  correct: string
  /** The neutral glyph on a not-quite-yet answer (the design's bulb). Never a cross (D27). */
  notYetGlyph: string
  decrease: string
  increase: string
  value: string
  /** Shown in the stepper before the first press. */
  empty: string
}

/** Range of a compute-a-value stepper. */
export interface StepperRange {
  min: number
  max: number
  step?: number
}

export interface QuestionItemProps {
  instance: Instance
  response: Response | null
  onResponse: (response: Response) => void
  /** Locked once the answer is checked. */
  disabled: boolean
  /** Shown once checked: the option the student chose is marked "Your answer". */
  mark?: Mark
  labels: QuestionItemLabels
  /** The read-only tree shown with the question. */
  tree?: TreeViewProps
  /** Replaces the answer input (the tree editor of change A3). */
  editor?: ReactNode
  /** Mark the correct option. The caller sets it only at the retry cap (D105). */
  revealCorrect?: boolean
  /** Number items. Assumed default when absent (proposal question 5): -99 to 99 in steps of 1. */
  range?: StepperRange
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
/** The spin button leaves the tab order while locked. */
const OFF_TAB_STOP = -1
const UP = 1
const DOWN = -1
const DEFAULT_RANGE: Required<StepperRange> = { min: -99, max: 99, step: 1 }

/** The response as the marker reads it: "+2", "0", "-1". */
const asResponse = (n: number) => (n > 0 ? `+${n}` : String(n))
const parse = (r: Response | null): number | null => {
  if (r === null || !('number' in r)) return null
  const n = Number(r.number.replace('−', '-'))
  return Number.isFinite(n) ? n : null
}

/**
 * One question, presentation only (revamp-question-and-feedback, FR-ASM-01): the stem, an optional tree,
 * and the answer input for the instance's type. It shows what it is given and marks nothing itself.
 */
export function QuestionItem({ instance, response, onResponse, disabled, mark, labels, tree, editor, revealCorrect = false, range }: QuestionItemProps) {
  const name = useId()
  const first = useRef<HTMLElement | null>(null)

  // Try again: when the item unlocks, focus returns to the first input (never on first render).
  const [wasDisabled, setWasDisabled] = useState(disabled)
  const [focusRequest, setFocusRequest] = useState(0)
  if (wasDisabled !== disabled) {
    setWasDisabled(disabled)
    if (!disabled) setFocusRequest((n) => n + 1)
  }
  useEffect(() => {
    if (focusRequest > 0) first.current?.focus()
  }, [focusRequest])

  const answer = (() => {
    if (editor !== undefined) return editor
    if (instance.type === 'choice') return choices()
    if (instance.type === 'number') return stepper()
    return null
  })()

  function choices() {
    const options = instance.options ?? []
    const chosen = response !== null && 'choice' in response ? response.choice : null
    const onKeyDown = (e: KeyboardEvent<HTMLFieldSetElement>) => {
      if (disabled || e.key.length !== 1) return
      const i = LETTERS.indexOf(e.key.toUpperCase())
      if (i < 0 || i >= options.length) return
      e.preventDefault()
      onResponse({ choice: options[i].id })
      e.currentTarget.querySelectorAll<HTMLInputElement>('input[type="radio"]')[i]?.focus()
    }
    return (
      <fieldset className="learn-options" disabled={disabled} onKeyDown={onKeyDown}>
        <legend className="learn-legend">{labels.choiceLegend}</legend>
        {options.map((o, i) => {
          const isChosen = o.id === chosen
          const showCorrect = (revealCorrect && o.correct) || (isChosen && mark?.status === 'correct')
          const state = showCorrect ? 'correct' : isChosen && mark?.status === 'not-yet' ? 'not-yet' : isChosen ? 'selected' : undefined
          return (
            <label key={o.id} className="learn-option" data-option="" data-state={state}>
              <input
                ref={i === 0 ? (el) => void (first.current = el) : undefined}
                type="radio"
                name={name}
                value={o.id}
                checked={isChosen}
                onChange={() => onResponse({ choice: o.id })}
              />
              <span className="learn-option-letter">{LETTERS[i]}</span>{' '}
              <span className="learn-option-text">{o.text}</span>{' '}
              {mark !== undefined && state === 'not-yet' && (
                <span className="learn-option-glyph" aria-hidden="true">
                  {labels.notYetGlyph}
                </span>
              )}
              {mark !== undefined && isChosen && <span className="learn-tag">{labels.yourAnswer}</span>}
              {revealCorrect && o.correct && <span className="learn-tag learn-tag-correct">{labels.correct}</span>}
            </label>
          )
        })}
      </fieldset>
    )
  }

  function stepper() {
    const { min, max, step } = { ...DEFAULT_RANGE, ...range }
    const value = parse(response)
    const nearestZero = Math.min(max, Math.max(min, 0))
    const move = (dir: number) => {
      if (disabled) return
      const next = value === null ? nearestZero : Math.min(max, Math.max(min, value + dir * step))
      if (next !== value) onResponse({ number: asResponse(next) })
    }
    const text = value === null ? labels.empty : signed(value)
    const state = mark === undefined ? undefined : mark.status === 'correct' ? 'correct' : 'not-yet'
    return (
      <div className="learn-stepper" data-state={state}>
        <button
          ref={(el) => void (first.current = el)}
          type="button"
          className="learn-step-button"
          aria-label={labels.decrease}
          disabled={disabled || (value !== null && value <= min)}
          onClick={() => move(DOWN)}
        >
          <span aria-hidden="true">−</span>
        </button>
        <div
          role="spinbutton"
          tabIndex={disabled ? OFF_TAB_STOP : 0}
          className="learn-step-value"
          aria-label={labels.value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value ?? undefined}
          aria-valuetext={text}
          aria-disabled={disabled || undefined}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault()
              move(e.key === 'ArrowUp' ? UP : DOWN)
            }
          }}
        >
          {text}
        </div>
        <button
          type="button"
          className="learn-step-button"
          aria-label={labels.increase}
          disabled={disabled || (value !== null && value >= max)}
          onClick={() => move(UP)}
        >
          <span aria-hidden="true">+</span>
        </button>
        {state === 'not-yet' && (
          <span className="learn-option-glyph" aria-hidden="true">
            {labels.notYetGlyph}
          </span>
        )}
        {mark !== undefined && <span className="learn-tag">{labels.yourAnswer}</span>}
      </div>
    )
  }

  return (
    <div className="learn-question">
      <p className="learn-stem">{instance.stem}</p>
      {tree !== undefined && <TreeView {...tree} />}
      {answer}
    </div>
  )
}
