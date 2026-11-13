import { useCallback, useId, useRef, useState } from 'react'
import { attemptRecord } from '../../../assessment/attempt'
import { instantiate } from '../../../assessment/instantiate'
import { mark } from '../../../assessment/mark'
import { checkComplete, checkSeed } from '../../../assessment/session'
import type { BankItem, Instance, Mark, Response } from '../../../assessment/types'
import { checkCopy } from '../../../content/check'
import type { Confidence } from '../../../state/learnerState'
import { useLearner } from '../../../state/LearnerContext'
import { paths } from '../../../routes'
import type { Tree } from '../../../engine/tree'
import { TreeView } from '../../tree/TreeView'
import { CheckFeedback } from './CheckFeedback'
import { TraceEditor } from './TraceEditor'

export interface CheckItemProps {
  item: BankItem
  isLast: boolean
  /** Next question, or the summary after the last. */
  onNext: () => void
}

interface Answered {
  inst: Instance
  mark: Mark
}

/**
 * One question of a module's check (FR-ASM-01): the engine-built instance for this learner and
 * attempt, an answer control for its type, optional confidence, and four-part feedback. Each marked
 * answer is stored; the module completes when every required item has a right answer (FR-LRN-05).
 */
export function CheckItem({ item, isLast, onNext }: CheckItemProps) {
  const { learner, recordAttempt, completeModule } = useLearner()
  const attempt = learner.attempts.filter((a) => a.questionId === item.id).length
  const [answered, setAnswered] = useState<Answered | null>(null)
  const inst = answered?.inst ?? instantiate(item, checkSeed(learner.profileId, item.id), attempt)

  const [choice, setChoice] = useState<string | null>(null)
  const [number, setNumber] = useState('')
  const tree = useRef<Tree>(null)
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const [unreadable, setUnreadable] = useState(false)
  const name = useId()
  const base = inst.facts.tree
  const onTree = useCallback((t: Tree) => {
    tree.current = t
  }, [])

  const response = (): Response | null => {
    if (inst.type === 'choice') return choice === null ? null : { choice }
    if (inst.type === 'number') return number.trim() === '' ? null : { number }
    return { tree: tree.current }
  }
  const ready = inst.type === 'tree' || (inst.type === 'choice' ? choice !== null : number.trim() !== '')

  const submit = () => {
    const r = response()
    if (r === null) return
    const m = mark(inst, r)
    if (m.status === 'unreadable') {
      setUnreadable(true)
      return
    }
    setUnreadable(false)
    const record = attemptRecord(inst, r, m, { hintsUsed: 0, at: new Date().toISOString(), ...(confidence !== null ? { confidence } : {}) })
    if (record !== null) {
      recordAttempt(record)
      if (record.correct && checkComplete(item.module, [...learner.attempts, record])) completeModule(item.module)
    }
    setAnswered({ inst, mark: m })
  }
  const tryAgain = () => {
    setAnswered(null)
    setChoice(null)
    setNumber('')
    setConfidence(null)
  }

  const locked = answered !== null
  const diverged = answered?.mark.divergedKind !== undefined ? checkCopy.editor.diverged(answered.mark.divergedKind) : null

  return (
    <div className="check-item">
      <p className="check-stem">{inst.stem}</p>
      {inst.type !== 'tree' && base !== null && <TreeView tree={base} label={checkCopy.treeLabel} />}
      {inst.type === 'choice' && (
        <fieldset className="check-options" disabled={locked}>
          <legend>{checkCopy.choiceLegend}</legend>
          {inst.options!.map((o) => (
            <label key={o.id} className="check-option">
              <input type="radio" name={name} value={o.id} checked={choice === o.id} onChange={() => setChoice(o.id)} />
              <span>{o.text}</span>
            </label>
          ))}
        </fieldset>
      )}
      {inst.type === 'number' && (
        <label className="check-number">
          <span>{checkCopy.numberLabel}</span>
          <input type="text" inputMode="numeric" autoComplete="off" value={number} disabled={locked} onChange={(e) => setNumber(e.target.value)} />
        </label>
      )}
      {inst.type === 'tree' && (
        <TraceEditor key={`${inst.itemId}-${inst.attempt}`} base={base} keyToInsert={inst.facts.target!} disabled={locked} onTree={onTree} />
      )}
      {unreadable && <p role="alert">{checkCopy.unreadable}</p>}
      {!locked && (
        <div role="group" aria-label={checkCopy.confidenceLabel} className="check-confidence">
          {(['sure', 'unsure'] as const).map((c) => (
            <button key={c} type="button" className="module-button module-button-quiet" aria-pressed={confidence === c} onClick={() => setConfidence(confidence === c ? null : c)}>
              {c === 'sure' ? checkCopy.sure : checkCopy.unsure}
            </button>
          ))}
        </div>
      )}
      {!locked && (
        <button type="button" className="module-button module-button-primary" disabled={!ready} onClick={submit}>
          {checkCopy.checkAnswer}
        </button>
      )}
      <CheckFeedback
        verdict={answered === null ? null : answered.mark.status === 'correct' ? 'right' : 'not-yet'}
        why={answered?.mark.explanation ?? ''}
        diverged={diverged}
        reviewTo={paths.activity(item.module, 'explore')}
        isLast={isLast}
        onTryAgain={tryAgain}
        onNext={onNext}
      />
    </div>
  )
}
