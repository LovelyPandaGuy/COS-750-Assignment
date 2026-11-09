import { REBALANCE_CASES, type RebalanceCase } from './conventions'
import { balanceFactorOf, height, makeNode, type Key, type Tree, type TreeNode } from './tree'
import { rotateLeft, rotateRight } from './rotations'
import { INSERT_PSEUDOCODE_LINE, recorder, type OperationResult } from './trace'
import { attach, locate, rebuildPath, type PathEntry } from './path'

export interface AvlInsertResult extends OperationResult {
  inserted: boolean
}

type Side = 'left' | 'right'

/** The taller side of a node, or null when both sides have equal height. */
function tallerSide(node: TreeNode): Side | null {
  const l = height(node.left)
  const r = height(node.right)
  return l > r ? 'left' : r > l ? 'right' : null
}

/**
 * AVL insert (FR-ENG-04, SE 6.4): BST insert, walk back up updating heights,
 * and at the lowest unbalanced node z fix the subtree with one single or
 * double rotation, then stop. Case names are read from the conventions
 * module; the case is chosen by comparing heights, not by the sign of the
 * balance factor, so a sign change (D2) cannot alter the choice.
 */
export function insertAvl(tree: Tree, key: Key): AvlInsertResult {
  const rec = recorder(tree, INSERT_PSEUDOCODE_LINE)
  const { path, found } = locate(tree, key, rec)
  if (found) return { tree, trace: rec.steps, inserted: false }

  let sub: TreeNode = makeNode(key, null, null)
  let current = rebuildPath(path, sub)
  rec.step('insert', [key], current)

  for (let i = path.length - 1; i >= 0; i--) {
    const z = attach(path[i].node, path[i].dir, sub)
    rec.step('update-height', [z.key])
    if (Math.abs(balanceFactorOf(z)) > 1) {
      current = rebalance(z, path.slice(0, i), rec)
      return { tree: current, trace: rec.steps, inserted: true }
    }
    sub = z
  }
  return { tree: current, trace: rec.steps, inserted: true }
}

/** Fix the unbalanced node z (whose ancestors are `above`) and record the steps. */
function rebalance(z: TreeNode, above: PathEntry[], rec: ReturnType<typeof recorder>): Tree {
  const [LL, RR, LR, RL] = REBALANCE_CASES
  const zSide = tallerSide(z) as Side
  const y = z[zSide] as TreeNode
  const ySide = tallerSide(y) ?? zSide
  const label: RebalanceCase =
    zSide === 'left' ? (ySide === 'left' ? LL : LR) : ySide === 'right' ? RR : RL
  rec.step('imbalance', [z.key, y.key], undefined, label)

  const rotateAtZ = zSide === 'left' ? rotateRight : rotateLeft
  let zNode: TreeNode = z

  if (ySide !== zSide) {
    // Double rotation: first rotate y towards z's taller side, then rotate z.
    const x = y[ySide] as TreeNode
    const rotateAtY = ySide === 'right' ? rotateLeft : rotateRight
    zNode = attach(z, zSide, rotateAtY(y))
    rec.step('rotation', [y.key, x.key], rebuildPath(above, zNode), label)
    const result = rebuildPath(above, rotateAtZ(zNode))
    rec.step('rotation', [z.key, x.key], result, label)
    return result
  }

  const result = rebuildPath(above, rotateAtZ(zNode))
  rec.step('rotation', [z.key, y.key], result, label)
  return result
}
