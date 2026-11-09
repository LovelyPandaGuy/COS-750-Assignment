import { EMPTY_HEIGHT, balanceFactor, leanOf, nodeHeight, type Lean } from './conventions'
import type { Key, Tree } from './tree'

export interface OrderViolation {
  key: Key
}
export interface BalanceViolation {
  key: Key
  balanceFactor: number
  lean: Lean
}
export interface HeightMismatch {
  key: Key
  stored: number
  actual: number
}

export interface TreeAnalysis {
  isBst: boolean
  isAvl: boolean
  orderViolations: OrderViolation[]
  balanceViolations: BalanceViolation[]
  heightMismatches: HeightMismatch[]
}

/**
 * Everything wrong with a tree, for feedback and marking. Lists are in
 * post-order, left before right, so the lowest offender comes first and the
 * first balance violation is the node checkAvl reports. Real heights are
 * recomputed from the shape; stored heights only feed heightMismatches.
 * Keys must lie strictly between those of their ancestors, so a duplicate
 * is an order violation.
 */
export function analyseTree(tree: Tree): TreeAnalysis {
  const orderViolations: OrderViolation[] = []
  const balanceViolations: BalanceViolation[] = []
  const heightMismatches: HeightMismatch[] = []

  const walk = (node: Tree, low: Key | null, high: Key | null): number => {
    if (node === null) return EMPTY_HEIGHT
    const l = walk(node.left, low, node.key)
    const r = walk(node.right, node.key, high)
    const actual = nodeHeight(l, r)
    const bf = balanceFactor(l, r)
    if ((low !== null && node.key <= low) || (high !== null && node.key >= high)) {
      orderViolations.push({ key: node.key })
    }
    if (Math.abs(bf) > 1) {
      balanceViolations.push({ key: node.key, balanceFactor: bf, lean: leanOf(bf) })
    }
    if (node.height !== actual) {
      heightMismatches.push({ key: node.key, stored: node.height, actual })
    }
    return actual
  }
  walk(tree, null, null)

  return {
    isBst: orderViolations.length === 0,
    isAvl: balanceViolations.length === 0,
    orderViolations,
    balanceViolations,
    heightMismatches,
  }
}
