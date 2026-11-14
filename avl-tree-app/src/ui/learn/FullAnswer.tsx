import { useId, useState } from 'react'
import './learn.css'
import type { Tree } from '../../engine/tree'
import { TreeView } from '../tree/TreeView'
import { signed } from '../tree/describe'

/** The engine's answer (from `engineAnswer`, never typed content, D95), in the form the question takes. */
export type FullAnswerValue =
  | { kind: 'option'; text: string }
  | { kind: 'value'; value: number }
  | { kind: 'tree'; tree: Tree }

export interface FullAnswerProps {
  answer: FullAnswerValue
  /** The reasoning, from the content (the scaffold's worked example or the question's explanation). */
  explanation: string
  labels: {
    /** The disclosure button. */
    show: string
    /** Accessible name of the answer tree, for tree answers. */
    treeAnswer: string
  }
}

/** The full answer at the retry cap (frame 1l, FR-SCA-03): a disclosure, collapsed by default. */
export function FullAnswer({ answer, explanation, labels }: FullAnswerProps) {
  const [open, setOpen] = useState(false)
  const bodyId = useId()
  const answerView =
    answer.kind === 'tree' ? (
      <TreeView tree={answer.tree} label={labels.treeAnswer} />
    ) : (
      <p className="learn-full-answer-value">{answer.kind === 'option' ? answer.text : signed(answer.value)}</p>
    )
  return (
    <div className="learn-full-answer">
      <button type="button" className="btn btn-quiet learn-disclosure" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((o) => !o)}>
        {labels.show}
      </button>
      <div id={bodyId} hidden={!open}>
        {answerView}
        <p>{explanation}</p>
      </div>
    </div>
  )
}
