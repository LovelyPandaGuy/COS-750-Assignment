import { useMemo } from 'react'
import './practice.css'
import { practiceCopy } from '../../content/practice'
import { compare, predictionFor, type Choice, type PredictionKind } from '../../practice/predict'
import type { Key, Tree } from '../../engine/tree'
import { signed } from '../tree/describe'

const copy = practiceCopy.reveal

export interface PredictionRevealProps {
  tree: Tree
  keyToInsert: Key
  kind: PredictionKind
  /** What the student locked in; null means they skipped, and nothing is shown. */
  choice: Choice | null
  /** Called with the trace index of the imbalance step. */
  onReplayStep: (stepIndex: number) => void
}

const what = (choice: Choice) =>
  choice === 'none' ? copy.none : typeof choice === 'number' ? copy.node(choice) : choice
const side = (left: boolean) => (left ? copy.left : copy.right)

export function PredictionReveal({ tree, keyToInsert, kind, choice, onReplayStep }: PredictionRevealProps) {
  const q = useMemo(() => predictionFor(tree, keyToInsert, kind), [tree, keyToInsert, kind])
  if (choice === null) return null

  const result = compare(q, choice)
  const step = q.stepIndex === null ? null : copy.atStep(q.stepIndex + 1)
  const at = step ?? ''

  let text: string
  switch (result.tag) {
    case 'match':
      text = copy.match(what(choice), step)
      break
    case 'in-range':
      text = copy.inRange(result.predicted, signed(result.predictedBf), at, result.z, signed(result.zBf))
      break
    case 'also-unbalanced-higher':
      text = copy.alsoHigher(result.predicted, signed(result.predictedBf), at, result.z)
      break
    case 'none-but-unbalanced':
      text = copy.noneButUnbalanced(at, result.z, signed(result.zBf))
      break
    case 'unbalanced-none-expected':
      text =
        result.predictedBf !== null && typeof result.predicted === 'number'
          ? copy.noneExpectedNode(result.predicted, signed(result.predictedBf))
          : copy.noneExpectedOther(what(result.predicted))
      break
    case 'case-mismatch':
      text = copy.caseMismatch(result.predicted, result.z, side(result.zLeansLeft), result.y, side(result.yLeansLeft), result.actual)
      break
    case 'root-mismatch':
      text = copy.rootMismatch(result.predicted, result.actual)
      break
  }
  const matched = result.tag === 'match'

  return (
    <div className="practice-reveal" role="status" data-kind={matched ? 'match' : 'differ'}>
      <span className="practice-icon" aria-hidden="true">
        {matched ? copy.matchIcon : copy.differIcon}
      </span>
      {matched ? '' : `${copy.differ} `}
      {text}{' '}
      {q.stepIndex !== null && (
        <button type="button" className="practice-button" onClick={() => onReplayStep(q.stepIndex!)}>
          {copy.replayStep}
        </button>
      )}
    </div>
  )
}
