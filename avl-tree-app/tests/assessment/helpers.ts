// Independent engine calls for each kind, so a test can check an instance's answer without the kind's own code.
import { analyseTree } from '../../src/engine/analyse'
import { avlDelete, avlInsert, avlInsertTrace } from '../../src/engine/avl'
import { insert } from '../../src/engine/bst'
import { rotateLeft, rotateRight } from '../../src/engine/rotations'
import { searchTrace } from '../../src/engine/search'
import { balanceFactorOf, height, subtreeAt, type Key, type Tree } from '../../src/engine/tree'
import { answersOf } from '../../src/modules/compare'
import { searchBounds } from '../../src/modules/facts'
import type { Instance } from '../../src/assessment/types'

export const SEEDS = Array.from({ length: 100 }, (_, i) => i)

export const plain = (keys: readonly Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
export const avlOf = (keys: readonly Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

/** Same keys and shape; stored heights ignored. */
export function sameShape(a: Tree, b: Tree): boolean {
  if (a === null || b === null) return a === b
  return a.key === b.key && sameShape(a.left, b.left) && sameShape(a.right, b.right)
}

/** The answer to an instance's problem, computed straight from the engine. */
export function engineAnswer(kind: string, inst: Instance): unknown {
  const f = inst.facts
  const t = f.tree
  const k = f.target as Key
  switch (kind) {
    case 'bst-height':
      return height(plain(f.keys))
    case 'sorted-search':
      return searchTrace(plain(f.keys), k).steps
    case 'node-height':
      return height(subtreeAt(t, k))
    case 'balance-factor':
      return balanceFactorOf(subtreeAt(t, k))
    case 'is-avl':
      return analyseTree(t).isAvl ? 'yes' : 'no'
    case 'search-visits':
      return searchTrace(t, k).steps
    case 'rotation-result':
      return (f.dir === 'left' ? rotateLeft : rotateRight)(subtreeAt(t, k))!.key
    case 'rotations-needed':
      return avlInsertTrace(t, k).trace.filter((s) => s.kind === 'rotation').length
    case 'lowest-unbalanced':
      return avlInsert(t, k).rebalance!.node
    case 'rebalance-case':
      return avlInsert(t, k).rebalance!.case
    case 'insert-final-tree':
      return avlInsert(t, k).tree
    case 'delete-rebalances':
      return avlDelete(t, k).rebalances.length
    case 'delete-root':
      return avlDelete(t, k).tree!.key
    case 'scenario-choice':
      return answersOf(f.scenario!)[0]
    // add-readiness-c9
    case 'worst-search': {
      const b = searchBounds(f.values.n)
      return b.worst === f.values.plainWorst && b.avlWorst === f.values.avlWorst && b.avlWorst < b.worst ? 'plain-n-avl-log' : 'mismatch'
    }
    case 'build-avl':
      return avlOf(f.keys)
    case 'search-built':
      return searchTrace(t, k).steps
    default:
      throw new Error(`no engine answer for ${kind}`)
  }
}
