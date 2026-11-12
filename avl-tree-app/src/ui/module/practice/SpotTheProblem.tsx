import { useState, type FormEvent } from 'react'
import { conventionsWording } from '../../../content/modules/conventionsWording'
import { practiceModuleCopy } from '../../../content/modules/practice'
import type { Key, Tree } from '../../../engine/tree'
import { markSpot, type SpotResult } from '../../../modules/practice'
import { TreeView } from '../../tree/TreeView'
import { PracticeFeedback, PracticeHints } from './PracticeFeedback'

const copy = practiceModuleCopy.spot
const w = conventionsWording()

export interface SpotTheProblemProps {
  tree: Tree
  solved: boolean
  onSolved: () => void
  hintsUsed: number
  onReview: () => void
  onNewTree: () => void
  label?: string
}

/** C3 practice: spot the node that breaks the rule in a tree whose root looks fine (LO3). */
export function SpotTheProblem({ tree, solved, onSolved, hintsUsed, onReview, onNewTree, label = copy.treeLabel }: SpotTheProblemProps) {
  const [selected, setSelected] = useState<Key | null>(null)
  const [result, setResult] = useState<SpotResult | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const select = (key: Key) => {
    setSelected(key)
    setResult(null)
    setNote(null)
  }

  const check = (e?: FormEvent) => {
    e?.preventDefault()
    if (selected === null) return setNote(copy.pickLabel(null))
    const r = markSpot(tree, selected)
    setNote(null)
    setResult(r)
    if (r.kind === 'right') onSolved()
  }

  const side = tree === null ? null : markSpot(tree, tree.key).answerSide
  const hints = side === null ? [] : copy.hints.slice(0, hintsUsed).map((h) => h({ side }, w))

  return (
    <div className="practice">
      <TreeView tree={tree} interactive selectedKey={selected} onSelect={select} hideBalance={solved ? undefined : {}} label={label} />
      <form className="practice-form" onSubmit={check}>
        <p>{copy.pickLabel(selected)}</p>
        <button type="submit" className="module-button module-button-primary">
          {practiceModuleCopy.check}
        </button>
      </form>
      <PracticeFeedback
        verdict={result === null ? null : result.kind === 'right' ? 'right' : 'not-yet'}
        text={result === null ? note : copy.why(result, w)}
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
