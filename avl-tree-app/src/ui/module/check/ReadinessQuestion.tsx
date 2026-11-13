import { useCallback, useId, useRef, useState } from 'react'
import type { Instance, Mark, Response } from '../../../assessment/types'
import { checkCopy } from '../../../content/check'
import { readinessCopy } from '../../../content/readiness'
import type { Tree } from '../../../engine/tree'
import type { Confidence } from '../../../state/learnerState'
import { TreeView } from '../../tree/TreeView'
import { CheckFeedback } from './CheckFeedback'
import { TraceEditor } from './TraceEditor'

export interface ReadinessQuestionProps {
  inst: Instance
  /** The marked answer, once given: the question locks and shows its feedback. */
  marked: Mark | null
  optional: boolean
  reviewTo: string
  isLast: boolean
  onAnswer: (response: Response, confidence: Confidence | null) => void
  onSkip: () => void
  onNext: () => void
}

/**
 * One C9 question (add-readiness-c9): one try, no ladder (D87). The same answer controls and calm
 * feedback as a module check; Skip only on the optional item (D4, D20).
 */
export function ReadinessQuestion({ inst, marked, optional, reviewTo, isLast, onAnswer, onSkip, onNext }: ReadinessQuestionProps) {
  const [choice, setChoice] = useState<string | null>(null)
  const [number, setNumber] = useState('')
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const tree = useRef<Tree>(null)
  const name = useId()
  const onTree = useCallback((t: Tree) => {
    tree.current = t
  }, [])
  const base = inst.facts.tree
  const locked = marked !== null && marked.status !== 'unreadable'
  const ready = inst.type === 'tree' || (inst.type === 'choice' ? choice !== null : number.trim() !== '')
  const response = (): Response => (inst.type === 'choice' ? { choice: choice! } : inst.type === 'number' ? { number } : { tree: tree.current })

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
        <TraceEditor base={base} keys={inst.facts.target !== undefined ? [inst.facts.target] : inst.facts.keys} disabled={locked} onTree={onTree} />
      )}
      {marked?.status === 'unreadable' && <p role="alert">{checkCopy.unreadable}</p>}
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
        <div className="practice-row">
          <button type="button" className="module-button module-button-primary" disabled={!ready} onClick={() => onAnswer(response(), confidence)}>
            {checkCopy.checkAnswer}
          </button>
          {optional && (
            <button type="button" className="module-button module-button-quiet" onClick={onSkip}>
              {readinessCopy.c9.skip}
            </button>
          )}
        </div>
      )}
      <CheckFeedback
        capped
        verdict={!locked ? null : marked!.status === 'correct' ? 'right' : 'not-yet'}
        why={locked ? marked!.explanation : ''}
        diverged={marked?.divergedKind !== undefined ? checkCopy.editor.diverged(marked.divergedKind) : null}
        reviewTo={reviewTo}
        isLast={isLast}
        onTryAgain={() => {}}
        onNext={onNext}
      />
    </div>
  )
}
