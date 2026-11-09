import { EMPTY_HEIGHT, balanceFactor, nodeHeight } from './conventions'
import type { Key, Tree } from './tree'

export type AvlCheck = { valid: true } | { valid: false; node: Key }

/**
 * Is every node's balance factor within -1..+1? Heights are recomputed from
 * the real shape; stored heights are ignored. When several nodes break the
 * rule the lowest one is reported (post-order, left before right). That
 * tie-break is an assumption (proposal, open question 3).
 */
export function checkAvl(tree: Tree): AvlCheck {
  let offender: Key | null = null
  const walk = (node: Tree): number => {
    if (node === null) return EMPTY_HEIGHT
    const l = walk(node.left)
    const r = walk(node.right)
    if (offender === null && Math.abs(balanceFactor(l, r)) > 1) offender = node.key
    return nodeHeight(l, r)
  }
  walk(tree)
  return offender === null ? { valid: true } : { valid: false, node: offender }
}
