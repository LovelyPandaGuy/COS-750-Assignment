import { useId, useState } from 'react'
import { attemptRecord } from '../../../assessment/attempt'
import { mark } from '../../../assessment/mark'
import type { Instance, Response } from '../../../assessment/types'
import { checkCopy } from '../../../content/check'
import { diagnosticCopy } from '../../../content/diagnostic'
import type { Attempt, Confidence } from '../../../state/learnerState'
import { TreeView } from '../../tree/TreeView'

export interface DiagnosticQuestionProps {
  inst: Instance
  /** The stored attempt when this question was already answered: shown selected and locked. */
  answered: Attempt | null
  /** Next on an unanswered question: the attempt to store. */
  onSubmit: (attempt: Attempt) => void
  /** Next on an answered question. */
  onForward: () => void
  nextLabel: string
}

/**
 * One diagnostic question (FR-DIA-01): the engine-built instance, optional confidence, and Next. No
 * verdict and no explanation: the warm-up is private practice (FR-DIA-05, D6).
 */
export function DiagnosticQuestion({ inst, answered, onSubmit, onForward, nextLabel }: DiagnosticQuestionProps) {
  const name = useId()
  const [choice, setChoice] = useState<string | null>(null)
  const [number, setNumber] = useState('')
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const [unreadable, setUnreadable] = useState(false)
  const locked = answered !== null
  const picked = locked ? String(answered.answer) : choice
  const typed = locked ? String(answered.answer) : number
  const ready = locked || (inst.type === 'choice' ? choice !== null : number.trim() !== '')

  const next = () => {
    if (locked) return onForward()
    const response: Response = inst.type === 'choice' ? { choice: choice! } : { number }
    const m = mark(inst, response)
    if (m.status === 'unreadable') return setUnreadable(true)
    const record = attemptRecord(inst, response, m, { hintsUsed: 0, at: new Date().toISOString(), ...(confidence !== null ? { confidence } : {}) })
    if (record !== null) onSubmit(record)
  }

  return (
    <div className="check-item">
      <p className="check-stem">{inst.stem}</p>
      {inst.facts.tree !== null && <TreeView tree={inst.facts.tree} label={checkCopy.treeLabel} />}
      {inst.type === 'choice' && (
        <fieldset className="check-options" disabled={locked}>
          <legend>{checkCopy.choiceLegend}</legend>
          {inst.options!.map((o) => (
            <label key={o.id} className="check-option">
              <input type="radio" name={name} value={o.id} checked={picked === o.id} onChange={() => setChoice(o.id)} />
              <span>{o.text}</span>
            </label>
          ))}
        </fieldset>
      )}
      {inst.type === 'number' && (
        <label className="check-number">
          <span>{checkCopy.numberLabel}</span>
          <input type="text" inputMode="numeric" autoComplete="off" value={typed} disabled={locked} onChange={(e) => setNumber(e.target.value)} />
        </label>
      )}
      {unreadable && <p role="alert">{checkCopy.unreadable}</p>}
      {locked ? (
        <p>{diagnosticCopy.answered}</p>
      ) : (
        <div role="group" aria-label={checkCopy.confidenceLabel} className="check-confidence">
          {(['sure', 'unsure'] as const).map((c) => (
            <button key={c} type="button" className="module-button module-button-quiet" aria-pressed={confidence === c} onClick={() => setConfidence(confidence === c ? null : c)}>
              {c === 'sure' ? checkCopy.sure : checkCopy.unsure}
            </button>
          ))}
        </div>
      )}
      <button type="button" className="module-button module-button-primary" disabled={!ready} onClick={next}>
        {nextLabel}
      </button>
    </div>
  )
}
