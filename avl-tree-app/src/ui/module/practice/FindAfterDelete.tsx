import { useState, type FormEvent } from 'react'
import { practiceModuleCopy } from '../../../content/modules/practice'
import type { Key, Tree } from '../../../engine/tree'
import { markAfterDelete, type AfterDeleteResult } from '../../../modules/deletePractice'
import { TreeView } from '../../tree/TreeView'
import { PracticeFeedback, PracticeHints } from './PracticeFeedback'

const copy = practiceModuleCopy.afterDelete

export interface FindAfterDeleteProps {
  before: Tree
  deletedKey: Key
  /** The tree after a plain BST delete of `deletedKey`. */
  after: Tree
  solved: boolean
  onSolved: () => void
  hintsUsed: number
  onReview: () => void
  onNewTree: () => void
}

/**
 * C7 practice (LO8): after a plain delete, select the lowest node out of balance. Heights stay
 * visible; balance factors are hidden until it is solved (as in C3). The engine marks the answer.
 */
export function FindAfterDelete({ before, deletedKey, after, solved, onSolved, hintsUsed, onReview, onNewTree }: FindAfterDeleteProps) {
  const [selected, setSelected] = useState<Key | null>(null)
  const [result, setResult] = useState<AfterDeleteResult | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const select = (key: Key) => {
    setSelected(key)
    setResult(null)
    setNote(null)
  }
  const check = (e?: FormEvent) => {
    e?.preventDefault()
    if (selected === null) return setNote(copy.pickLabel(null))
    const r = markAfterDelete(after, selected)
    setNote(null)
    setResult(r)
    if (r.kind === 'right') onSolved()
  }

  const facts = { key: deletedKey, side: after === null ? null : markAfterDelete(after, after.key).side }
  const hints = copy.hints.slice(0, hintsUsed).map((h) => h(facts))

  return (
    <div className="practice">
      <div className="module-figures">
        <TreeView tree={before} label={copy.beforeLabel} />
        <TreeView tree={after} interactive selectedKey={selected} onSelect={select} hideBalance={solved ? undefined : {}} label={copy.afterLabel} />
      </div>
      <p>{copy.deleted(deletedKey)}</p>
      <form className="practice-form" onSubmit={check}>
        <p>{copy.pickLabel(selected)}</p>
        <button type="submit" className="module-button module-button-primary">
          {practiceModuleCopy.check}
        </button>
      </form>
      <PracticeFeedback
        verdict={solved && result === null ? 'right' : result === null ? null : result.kind === 'right' ? 'right' : 'not-yet'}
        text={result === null ? (solved ? copy.done : note) : copy.why(result)}
        after={copy.done}
        onTryAgain={() => setResult(null)}
        onReview={onReview}
      />
      <PracticeHints hints={hints} />
      <button type="button" className="module-button module-button-quiet" onClick={onNewTree}>
        {practiceModuleCopy.newTree}
      </button>
    </div>
  )
}
