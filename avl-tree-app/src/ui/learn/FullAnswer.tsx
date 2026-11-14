import { useId, useState } from 'react'
import './learn.css'
import type { WorkedExample } from '../../assessment/scaffold'
import type { Tree } from '../../engine/tree'
import { TreeView } from '../tree/TreeView'
import { signed } from '../tree/describe'

export interface FullAnswerProps {
  /** The engine's solved problem: its answer and explanation are shown as given. */
  example: WorkedExample
  labels: {
    /** The disclosure button. */
    show: string
    /** Accessible name of the answer tree, for tree answers. */
    treeAnswer: string
  }
}

/** The full answer at the retry cap (frame 1l, FR-SCA-03): a disclosure, collapsed by default. */
export function FullAnswer({ example, labels }: FullAnswerProps) {
  const [open, setOpen] = useState(false)
  const bodyId = useId()
  const { instance, answer } = example
  const answerView =
    instance.type === 'tree' ? (
      <TreeView tree={answer as Tree} label={labels.treeAnswer} />
    ) : (
      <p className="learn-full-answer-value">
        {instance.type === 'choice' ? (instance.options?.find((o) => o.correct)?.text ?? String(answer)) : signed(Number(answer))}
      </p>
    )
  return (
    <div className="learn-full-answer">
      <button type="button" className="btn btn-quiet learn-disclosure" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((o) => !o)}>
        {labels.show}
      </button>
      <div id={bodyId} hidden={!open}>
        {answerView}
        <p>{example.explanation}</p>
      </div>
    </div>
  )
}
