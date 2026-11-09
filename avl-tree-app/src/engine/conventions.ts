// The only place the height convention, balance-factor definition and case
// names are defined (D2, FR-ENG-10). Nothing else hard-codes them.

/** Height of the empty tree, counted in edges. */
export const EMPTY_HEIGHT = -1

/** Height of a leaf: one edge above the empty tree. */
export const LEAF_HEIGHT = EMPTY_HEIGHT + 1

/** Rebalancing case names. Lecturer to confirm (D2). */
export const REBALANCE_CASES = ['LL', 'RR', 'LR', 'RL'] as const
export type RebalanceCase = (typeof REBALANCE_CASES)[number]

/** Height of a node given its children's heights (use EMPTY_HEIGHT for none). */
export function nodeHeight(leftHeight: number, rightHeight: number): number {
  return Math.max(leftHeight, rightHeight) + 1
}

/** Balance factor = height(left) - height(right). */
export function balanceFactor(leftHeight: number, rightHeight: number): number {
  return leftHeight - rightHeight
}

/**
 * Case name for an imbalance. z is the unbalanced node, y its taller child.
 * Same direction gives LL or RR, opposite directions give LR or RL.
 */
export function caseFor(zLeansLeft: boolean, yLeansLeft: boolean): RebalanceCase {
  if (zLeansLeft) return yLeansLeft ? REBALANCE_CASES[0] : REBALANCE_CASES[2]
  return yLeansLeft ? REBALANCE_CASES[3] : REBALANCE_CASES[1]
}

export type Lean = 'left-heavy' | 'right-heavy'

/** Which way a node with an out-of-range balance factor is heavy. */
export function leanOf(balance: number): Lean {
  return balance > 0 ? 'left-heavy' : 'right-heavy'
}
