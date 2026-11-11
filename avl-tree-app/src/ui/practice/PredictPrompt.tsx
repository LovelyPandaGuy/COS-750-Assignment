import { useId, useMemo, useState } from 'react'
import './practice.css'
import { practiceCopy } from '../../content/practice'
import { predictionFor, type Choice, type PredictionKind } from '../../practice/predict'
import type { Key, Tree } from '../../engine/tree'
import { TreeView } from '../tree/TreeView'

const copy = practiceCopy.predict

/** What the prompt reports once the student has locked in or skipped. Practice only: nothing here is stored or scored. */
export interface PredictionReport {
  kind: PredictionKind
  choice: Choice | null
  answer: Choice
  skipped: boolean
}

export interface PredictPromptProps {
  tree: Tree
  keyToInsert: Key
  kind: PredictionKind
  /** Replay may start only after this fires. Give the prompt a new `key` for each replay so it starts empty. */
  onProceed: (report: PredictionReport) => void
}

function optionLabel(choice: Choice): string {
  return choice === 'none' ? copy.none : typeof choice === 'number' ? copy.node(choice) : choice
}

export function PredictPrompt({ tree, keyToInsert, kind, onProceed }: PredictPromptProps) {
  const question = useMemo(() => predictionFor(tree, keyToInsert, kind), [tree, keyToInsert, kind])
  const [choice, setChoice] = useState<Choice | null>(null)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const name = useId()
  const offList = typeof choice === 'number' && !question.options.includes(choice)

  const lockIn = () => {
    if (choice === null) return
    setDone(true)
    setMessage(copy.lockedIn(optionLabel(choice)))
    onProceed({ kind, choice, answer: question.answer, skipped: false })
  }
  const skip = () => {
    setDone(true)
    setMessage(copy.skipped)
    onProceed({ kind, choice: null, answer: question.answer, skipped: true })
  }

  return (
    <div className="predict">
      <h3>{copy.heading}</h3>
      <p>{copy.question[kind](keyToInsert)}</p>
      <TreeView
        tree={tree}
        label={copy.treeLabel}
        interactive={kind !== 'case' && !done}
        selectedKey={typeof choice === 'number' ? choice : null}
        onSelect={(k) => setChoice(k)}
      />
      {kind !== 'case' && <p>{copy.treeHint}</p>}
      <fieldset className="practice-group">
        <legend>{copy.groupLabel}</legend>
        {question.options.map((option) => (
          <label className="practice-option" key={String(option)}>
            <input
              type="radio"
              name={name}
              checked={choice === option}
              disabled={done}
              onChange={() => setChoice(option)}
            />
            {optionLabel(option)}
          </label>
        ))}
      </fieldset>
      {offList && <p>{copy.yourPick(choice as number)}</p>}
      <div className="practice-row">
        <button type="button" className="practice-button" data-primary="" disabled={choice === null || done} onClick={lockIn}>
          {copy.lockIn}
        </button>
        <button type="button" className="practice-button" disabled={done} onClick={skip}>
          {copy.skip}
        </button>
      </div>
      <p className="predict-note">{copy.note}</p>
      <p role="status" className="practice-updates">
        {message}
      </p>
    </div>
  )
}
