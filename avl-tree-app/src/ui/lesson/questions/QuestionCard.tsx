// A question in the lesson frame (lesson-questions, lesson-checks, check-feedback): the stem, the tree,
// the control for its type, confidence, Check answer and four-part feedback (ID 9.5, 9.2, 10.1).
import { useCallback, useState } from 'react'
import { lessonCopy } from '../../../content/lesson'
import { CONVENTIONS } from '../../../engine/conventions'
import { shapeString } from '../../../engine/shape'
import type { Tree } from '../../../engine/tree'
import { keysToInsert, startTree, treeAfter, workTree } from '../../../live/engineAnswer'
import { encodeKey } from '../../../live/keys'
import { markQuestion, type BuilderStep, type Mark } from '../../../live/mark'
import type { Question, ShowItem } from '../../../live/types'
import { useLearner } from '../../../state/LearnerContext'
import { TreeView } from '../../tree/TreeView'
import { ChoiceControl, ConfidenceControl, NodePicker, TracePicker, TreeBuilder, ValuesControl, YesNoControl, type TreeShown } from './Controls'
import { emptyDraft, isComplete, responseOf, searchKeyOf, storedAnswer, type Draft } from './draft'

const copy = lessonCopy.questions
const fb = CONVENTIONS.feedback as unknown as {
  verdictCorrect: string
  verdictIncorrect: string[]
  reviewLink: string
  nextStepCorrect: string
  nextStepRetry: string
  afterReattempt: string
}
const concepts = CONVENTIONS.concepts

export interface QuestionCardProps {
  q: Question
  /** check: limited attempts, confidence required. practice: unlimited, confidence optional. */
  mode: 'check' | 'practice'
  attemptsAllowed: number
  /** Hints the student opened for this question (ID 9.4). */
  hintsUsed: number
  show?: readonly ShowItem[]
  listing?: 'search-loop' | 'search-recursive'
  /** Review: {concept} moves to the concept's screen. */
  onReview: (screenId: string) => void
  /** The Continue step (next question, or nothing in practice). */
  onContinue?: () => void
  continueLabel?: string
  label: string
  /** C1's readiness questions: record the answer and show no verdict (lesson-c1). */
  quiet?: boolean
  /** Called with the mark once an answer is recorded. */
  onAnswered?: (mark: Mark) => void
}

const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (w, k: string) => v[k] ?? w)

/** Questions that ask for balance factors hide them on the tree (lesson-questions). */
const hidesBalance = (q: Question) => q.type === 'enter-values' || (q.type === 'click-node' && q.target !== 'parent-of-new-key')

export function QuestionCard({ q, mode, attemptsAllowed, hintsUsed, show, listing, onReview, onContinue, continueLabel, label, quiet = false, onAnswered }: QuestionCardProps) {
  const { learner, recordAttempt } = useLearner()
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(q))
  const [confidence, setConfidence] = useState<'sure' | 'unsure' | null>(null)
  const [mark, setMark] = useState<Mark | null>(null)
  const [unreadable, setUnreadable] = useState(false)
  const [builderKey, setBuilderKey] = useState(0)
  const stored = learner.attempts.filter((a) => a.questionId === q.id)
  const used = stored.length
  const finishedBefore = !quiet && mode === 'check' && mark === null && (stored.some((a) => a.correct) || used >= attemptsAllowed)
  const update = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const onTree = useCallback((tree: Tree, log: BuilderStep[], complete: boolean) => setDraft((d) => ({ ...d, tree, log, treeComplete: complete })), [])

  const { formatKey } = startTree(q)
  const shown: TreeShown = { tree: q.type === 'click-node' || q.type === 'enter-values' || q.type === 'case-id' ? workTreeAfterPlain(q) : workTree(q), formatKey, label, show, hideBalance: hidesBalance(q) }
  const locked = mark !== null || finishedBefore
  const needsConfidence = mode === 'check'
  const canCheck = !locked && isComplete(q, draft) && (!needsConfidence || confidence !== null)

  const check = () => {
    const r = responseOf(q, draft)
    if (r === 'unreadable') {
      setUnreadable(true)
      return
    }
    setUnreadable(false)
    const m = markQuestion(q, r)
    if (!quiet) setMark(m)
    const attempt = { questionId: q.id, at: new Date().toISOString(), answer: storedAnswer(r, shapeString), correct: m.verdict === 'right', hintsUsed, attempt: used + 1 } as Parameters<typeof recordAttempt>[0]
    if (confidence !== null) attempt.confidence = confidence
    if (m.misconceptionId !== undefined) attempt.misconceptionId = m.misconceptionId
    recordAttempt(attempt)
    onAnswered?.(m)
  }
  const tryAgain = () => {
    setMark(null)
    setDraft(emptyDraft(q))
    setConfidence(null)
    setBuilderKey((k) => k + 1)
  }

  const left = attemptsAllowed - used
  const concept = concepts[q.concept]

  return (
    <div className="q-card">
      <p className="q-stem">{q.stem}</p>
      {renderControl()}
      {needsConfidence && <ConfidenceControl value={confidence} onChange={setConfidence} disabled={locked} />}
      {unreadable && <p className="q-prompt" role="alert">{copy.readPrompt}</p>}
      {!locked && (
        <button type="button" className="module-button module-button-primary" disabled={!canCheck} onClick={check}>
          {copy.checkAnswer}
        </button>
      )}
      <div role="status" aria-live="polite" aria-label={copy.feedbackLabel} className="practice-panel q-feedback" data-verdict={mark === null ? 'none' : mark.verdict === 'right' ? 'right' : 'not-yet'}>
        {mark !== null && (
          <>
            <strong>
              <span aria-hidden="true" className="q-icon">{mark.verdict === 'right' ? '✓' : '↻'} </span>
              {mark.verdict === 'right' ? fb.verdictCorrect : mark.verdict === 'partial' ? fb.verdictIncorrect[1] : fb.verdictIncorrect[0]}{' '}
            </strong>
            {mark.reason !== '' && <span>{mark.reason} </span>}
            {mark.verdict !== 'right' && left <= 0 && <span>{fb.afterReattempt} </span>}
            <span className="practice-panel-actions">
              {concept !== undefined && (
                <button type="button" className="module-button module-button-quiet" onClick={() => onReview(concept.screen)}>
                  {fill(fb.reviewLink, { concept: concept.label })}
                </button>
              )}
              {mark.verdict !== 'right' && left > 0 ? (
                <button type="button" className="module-button module-button-secondary" onClick={tryAgain}>
                  {fb.nextStepRetry}
                </button>
              ) : (
                onContinue !== undefined && (
                  <button type="button" className="module-button module-button-secondary" onClick={onContinue}>
                    {continueLabel ?? fb.nextStepCorrect}
                  </button>
                )
              )}
            </span>
          </>
        )}
        {finishedBefore && (
          <>
            <span>{stored.some((a) => a.correct) ? fb.verdictCorrect : fb.afterReattempt} </span>
            {onContinue !== undefined && (
              <button type="button" className="module-button module-button-secondary" onClick={onContinue}>
                {continueLabel ?? fb.nextStepCorrect}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )

  function renderControl() {
    switch (q.type) {
      case 'mcq':
      case 'case-id':
        return (
          <>
            {q.tree !== undefined && <TreeView tree={shown.tree} formatKey={shown.formatKey} show={shown.show} label={shown.label} />}
            <ChoiceControl options={q.options ?? []} value={draft.option} onChange={(option) => update({ option })} disabled={locked} />
          </>
        )
      case 'enter-values':
        return (
          <>
            <TreeView tree={shown.tree} formatKey={shown.formatKey} show={shown.show} hideBalance={shown.hideBalance ? {} : undefined} label={shown.label} />
            <ValuesControl fields={(q.targets ?? []).map((t) => ({ label: copy.value(formatKey(encodeKey(t.node)), t.quantity) }))} values={draft.values} onChange={(values) => update({ values })} disabled={locked} />
            {q.askUnbalanced === true && (
              <NodePicker
                legend={copy.unbalancedLegend}
                shown={{ ...shown, label: `${label}, ${copy.unbalancedLegend}` }}
                selected={draft.unbalanced}
                none={draft.unbalancedNone}
                mode="many-or-none"
                onChange={(unbalanced, unbalancedNone) => update({ unbalanced, unbalancedNone })}
                disabled={locked}
              />
            )}
            {q.askIsAvl === true && <YesNoControl value={draft.isAvl} onChange={(isAvl) => update({ isAvl })} disabled={locked} />}
          </>
        )
      case 'click-node':
        return (
          <NodePicker
            shown={shown}
            selected={draft.nodes}
            none={draft.none}
            mode={(q.selectMode as 'one' | 'one-or-none' | 'many-or-none' | undefined) ?? 'one'}
            onChange={(nodes, none) => update({ nodes, none })}
            disabled={locked}
          />
        )
      case 'trace':
        return <TracePicker shown={shown} path={draft.path} found={draft.found} onChange={(path, found) => update({ path, found })} disabled={locked} listing={listing} searchKey={searchKeyOf(q)} />
      default:
        return (
          <TreeBuilder
            key={builderKey}
            start={workTree(q)}
            pending={q.type === 'perform-rotation' ? [] : keysToInsert(q)}
            deletable={q.operation?.name === 'delete' && q.operation.key !== undefined ? encodeKey(q.operation.key) : null}
            formatKey={formatKey}
            label={label}
            disabled={locked}
            onChange={onTree}
          />
        )
    }
  }
}

/** The tree a value or node question shows: after its operation, done the plain way (before any rotation). */
function workTreeAfterPlain(q: Question): Tree {
  return q.operation === undefined ? workTree(q) : treeAfter(q, false)
}
