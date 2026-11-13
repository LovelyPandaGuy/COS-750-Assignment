import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { checkStep, currentInstance, guidedSteps, hintFor, resumeCheck, workedExample, type CheckSession } from '../../../assessment/scaffold'
import { checkComplete, checkSeed } from '../../../assessment/session'
import type { BankItem, Instance, Mark, Response } from '../../../assessment/types'
import { checkCopy } from '../../../content/check'
import type { Confidence } from '../../../state/learnerState'
import { useLearner } from '../../../state/LearnerContext'
import { paths } from '../../../routes'
import type { Tree } from '../../../engine/tree'
import { TreeView } from '../../tree/TreeView'
import { CheckFeedback } from './CheckFeedback'
import { ScaffoldLadder } from './ScaffoldLadder'
import { TraceEditor } from './TraceEditor'

export interface CheckItemProps {
  item: BankItem
  isLast: boolean
  /** Where Review goes; the module's Explore activity by default. */
  reviewTo?: string
  /** Next question, or the summary after the last. */
  onNext: () => void
}

interface Answered {
  inst: Instance
  mark: Mark
}

/**
 * One question of a module's check (FR-ASM-01), driven by the scaffold-ladder session
 * (add-scaffold-ladder-and-retry-cap): the engine-built instance for this learner and attempt, an
 * answer control for its type, optional confidence, four-part feedback and the ladder. Each marked
 * answer is stored; on a reload the session is rebuilt from the stored attempts. The module completes
 * when every required item is right or capped (FR-LRN-05, D20).
 */
export function CheckItem({ item, isLast, onNext, reviewTo }: CheckItemProps) {
  const { learner, recordAttempt, completeModule, recordLectureQuestion } = useLearner()
  const seed = checkSeed(learner.profileId, item.id)
  const [session, setSession] = useState<CheckSession>(() =>
    resumeCheck(
      item,
      seed,
      learner.attempts.filter((a) => a.questionId === item.id),
    ),
  )
  const isCapped = session.outcome === 'capped'
  const [answered, setAnswered] = useState<Answered | null>(null)
  // The question just answered stays on screen with its feedback; otherwise the session's current one.
  const current = currentInstance(item, session)
  const inst = answered?.inst ?? current
  const stored = learner.lectureQuestions.find((q) => q.questionId === item.id)
  const lecture = stored?.text ?? session.lectureQuestion?.text ?? ''

  // The cap drafts one lecture question; it is stored once per item (FR-SCA-03).
  useEffect(() => {
    if (session.lectureQuestion !== undefined && stored === undefined) recordLectureQuestion(session.lectureQuestion)
  }, [session.lectureQuestion, stored, recordLectureQuestion])

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
    const step = checkStep(item, session, { type: 'answer', response: r, at: new Date().toISOString(), ...(confidence !== null ? { confidence } : {}) })
    if (step.mark === undefined) return
    if (step.mark.status === 'unreadable') {
      setUnreadable(true)
      return
    }
    setUnreadable(false)
    if (step.attempt !== undefined) {
      recordAttempt(step.attempt)
      if (checkComplete(item.module, [...learner.attempts, step.attempt])) completeModule(item.module)
    }
    setSession(step.session)
    setAnswered({ inst, mark: step.mark })
  }
  const tryAgain = () => {
    setAnswered(null)
    setChoice(null)
    setNumber('')
    setConfidence(null)
  }

  const locked = answered !== null || isCapped
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
        <TraceEditor key={`${inst.itemId}-${inst.attempt}`} base={base} keys={[inst.facts.target!]} disabled={locked} onTree={onTree} />
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
      {/* The ladder belongs to the problem on screen: hidden while a wrong answer's feedback shows, back with the next problem. */}
      {(answered === null || isCapped) && (
        <ScaffoldLadder
          level={session.rungs}
          hint={hintFor(item, session)}
          inst={current}
          example={workedExample(item, seed)}
          steps={guidedSteps(item, session)}
          capped={isCapped}
          onOpenNext={() => setSession(checkStep(item, session, { type: 'help' }).session)}
        />
      )}
      {isCapped && (
        <div className="check-lecture">
          <p>
            <strong>{checkCopy.ladder.lectureLabel}</strong>
          </p>
          <p>{lecture}</p>
        </div>
      )}
      <CheckFeedback
        capped={isCapped}
        verdict={isCapped ? 'not-yet' : answered === null ? null : answered.mark.status === 'correct' ? 'right' : 'not-yet'}
        why={answered?.mark.explanation ?? ''}
        diverged={diverged}
        reviewTo={reviewTo ?? paths.activity(item.module, 'explore')}
        isLast={isLast}
        onTryAgain={tryAgain}
        onNext={onNext}
      />
    </div>
  )
}
