import { useState } from 'react'
import { practiceModuleCopy } from '../../../content/modules/practice'
import { pseudocode } from '../../../content/pseudocode'
import { replayCopy } from '../../../content/replay'
import { searchTrace, type SearchForm } from '../../../engine/search'
import type { Key, Tree } from '../../../engine/tree'
import { markPick, nextMove, searchPath, type Pick, type PickResult } from '../../../modules/searchPractice'
import { TreeView } from '../../tree/TreeView'
import { PseudocodePanel } from '../../replay/PseudocodePanel'
import { PracticeFeedback, PracticeHints } from './PracticeFeedback'

const copy = practiceModuleCopy.search

export interface BeTheAlgorithmProps {
  tree: Tree
  searchKey: Key
  /** Nodes picked so far, a prefix of the engine's path. Kept by the player (FR-LRN-04). */
  path: Key[]
  onPath: (path: Key[]) => void
  solved: boolean
  onSolved: () => void
  hintsUsed: number
  onReview: () => void
  onNewTree: () => void
  label?: string
}

/**
 * C4 "be the algorithm" (ID C4 activity, LO4): select the next node the search visits while the
 * matching pseudocode line lights up. Marking follows the engine's trace; a not-yet never moves it.
 */
export function BeTheAlgorithm({
  tree,
  searchKey,
  path,
  onPath,
  solved,
  onSolved,
  hintsUsed,
  onReview,
  onNewTree,
  label = copy.treeLabel,
}: BeTheAlgorithmProps) {
  const [form, setForm] = useState<SearchForm>('loop')
  const [result, setResult] = useState<PickResult | null>(null)
  const { found } = searchPath(tree, searchKey)
  const trace = searchTrace(tree, searchKey, form)

  // The lit line: the compare step at the last node picked, or the end step once solved.
  const last = path[path.length - 1]
  const lit = solved
    ? trace.trace[trace.trace.length - 1]
    : last === undefined
      ? null
      : trace.trace.find((s) => s.kind === 'compare' && s.nodes[0] === last)

  const pick = (picked: Pick) => {
    if (solved) return
    const r = markPick(tree, searchKey, path, picked)
    if (r.kind === 'not-yet') return setResult(r)
    setResult(null)
    if (picked === 'not-in-tree') return onSolved()
    const next = [...path, picked]
    onPath(next)
    if (picked === searchKey) onSolved()
  }

  const move = nextMove(tree, searchKey, path)
  const hints = copy.hints.slice(0, hintsUsed).map((h) => h(searchKey, move))
  const done = found ? copy.foundDone(searchKey, trace.steps) : copy.missingDone(searchKey, trace.steps)

  return (
    <div className="practice search-practice">
      <p className="search-practice-goal">
        <strong>{copy.find(searchKey)}</strong>
      </p>
      <TreeView tree={tree} interactive selectedKey={last ?? null} onSelect={(k) => pick(k)} label={label} />
      <p>{copy.visited(path)}</p>
      {!found && (
        <button type="button" className="module-button module-button-secondary" onClick={() => pick('not-in-tree')}>
          {copy.notInTree}
        </button>
      )}
      <PseudocodePanel
        name={form === 'loop' ? replayCopy.panel.searchLoop : replayCopy.panel.searchRecursive}
        listing={form === 'loop' ? pseudocode.searchLoop : pseudocode.searchRecursive}
        line={lit?.pseudocodeLine ?? null}
        form={form}
        onForm={setForm}
      />
      <PracticeFeedback
        verdict={solved ? 'right' : result === null ? null : 'not-yet'}
        text={solved ? done : result === null ? null : copy.why(result, searchKey)}
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
