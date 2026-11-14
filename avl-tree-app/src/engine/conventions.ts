// The only place the height convention, the balance-factor definition, the case names and the
// student-facing labels, captions and pseudocode are read (ID 7.3, ID 12.1, D93). They come from
// src/live_content/conventions.json, the ID's conventions file; nothing else hard-codes them.
import raw from '../live_content/conventions.json'

export type Side = 'left' | 'right'

/** The conventions file as the app reads it. */
export interface ConventionsFile {
  heightOfLeaf: number
  heightOfEmptyTree: number
  balanceFactor: string
  validBalanceFactors: number[]
  unbalancedNode: string
  cases: Record<'1' | '2' | '3' | '4', { code: string; side: string; insertedInto: string; fix: string[] }>
  deletion: string
  deletionRotation: {
    bfPlus2: { childBfAtLeast0: string; childBfNegative: string[] }
    bfMinus2: { childBfAtMost0: string; childBfPositive: string[] }
    note: string
  }
  keys: string
  labels: {
    caseName: Record<'1' | '2' | '3' | '4', string>
    rotation: Record<string, string>
    branch: Record<Side, string>
    progress: string
    [k: string]: unknown
  }
  feedback: Record<string, unknown>
  routing: Record<string, unknown>
  captions: Record<string, string>
  pseudocode: {
    'search-loop': string[]
    'search-recursive': string[]
    lineForStep: Record<'search-loop' | 'search-recursive', Record<string, number>>
  }
  concepts: Record<string, { label: string; screen: string }>
  glossary: Record<string, string>
  questionTypes: Record<string, string>
  wrongAnswerPatterns: Record<string, string>
  settings: Record<string, unknown>
}

export const CONVENTIONS = raw as unknown as ConventionsFile

/** The two formulas the conventions file may state; any other is a content error (live-content). */
export const BALANCE_FORMULAS: Record<string, readonly [Side, Side]> = {
  'height(right) - height(left)': ['right', 'left'],
  'height(left) - height(right)': ['left', 'right'],
}

/** Which subtree's height comes first in the balance factor, then which second (ID 7.3). */
export function orderFrom(file: Pick<ConventionsFile, 'balanceFactor'>): readonly [Side, Side] {
  const order = BALANCE_FORMULAS[file.balanceFactor]
  if (order === undefined) throw new RangeError(`conventions.json: unknown balanceFactor "${file.balanceFactor}"`)
  return order
}

export const BALANCE_FACTOR_ORDER: readonly [Side, Side] = orderFrom(CONVENTIONS)

/** Height of the empty tree, counted in edges. */
export const EMPTY_HEIGHT: number = CONVENTIONS.heightOfEmptyTree

/** Height of a leaf: one edge above the empty tree. */
export const LEAF_HEIGHT: number = CONVENTIONS.heightOfLeaf

/** The balance factors the AVL rule allows (agrees with isOutOfBalance). */
export const BALANCE_RANGE: readonly number[] = [...CONVENTIONS.validBalanceFactors].sort((a, b) => a - b)

/** Rebalancing cases by code. The engine works with the codes; students see `caseLabel`. */
export const REBALANCE_CASES = ['LL', 'RR', 'LR', 'RL'] as const
export type RebalanceCase = (typeof REBALANCE_CASES)[number]

/** Height of a node given its children's heights (use EMPTY_HEIGHT for none). */
export function nodeHeight(leftHeight: number, rightHeight: number): number {
  return Math.max(leftHeight, rightHeight) + 1
}

/** Balance factor from the two subtree heights, in the order the conventions file states. */
export function balanceFactorWith(order: readonly [Side, Side], leftHeight: number, rightHeight: number): number {
  const h = { left: leftHeight, right: rightHeight }
  return h[order[0]] - h[order[1]]
}

const RIGHT_FIRST = BALANCE_FACTOR_ORDER[0] === 'right'

/** Balance factor = height(right) - height(left) under the ID (D93). Hot path: no allocation. */
export function balanceFactor(leftHeight: number, rightHeight: number): number {
  return RIGHT_FIRST ? rightHeight - leftHeight : leftHeight - rightHeight
}

/** The taller side for a balance factor, or null when both sides are the same height. */
export function tallerSide(balance: number, order: readonly [Side, Side] = BALANCE_FACTOR_ORDER): Side | null {
  if (balance === 0) return null
  return balance > 0 ? order[0] : order[1]
}

const LEFT_FIRST = !RIGHT_FIRST

/**
 * Case name for an imbalance. z is the unbalanced node, y its taller child.
 * Same direction gives LL or RR, opposite directions give LR or RL.
 */
export function caseFor(zLeansLeft: boolean, yLeansLeft: boolean): RebalanceCase {
  if (zLeansLeft) return yLeansLeft ? 'LL' : 'LR'
  return yLeansLeft ? 'RL' : 'RR'
}

const CASE_NUMBER: Record<RebalanceCase, '1' | '2' | '3' | '4'> = { LL: '1', LR: '2', RL: '3', RR: '4' }

/** The case's number in the ID (Case 1 to 4). */
export function caseNumber(c: RebalanceCase): number {
  return Number(CASE_NUMBER[c])
}

/** The case as students see it: "Case 1 (LL)" (ID 7.3). */
export function caseLabel(c: RebalanceCase): string {
  return CONVENTIONS.labels.caseName[CASE_NUMBER[c]]
}

/** True when a balance factor breaks the AVL rule (outside the allowed range). */
const MIN_BF = BALANCE_RANGE[0]
const MAX_BF = BALANCE_RANGE[BALANCE_RANGE.length - 1]

export function isOutOfBalance(balance: number): boolean {
  return balance < MIN_BF || balance > MAX_BF
}

export type Lean = 'left-heavy' | 'right-heavy'

/** Which way a node with a non-zero balance factor is heavy. */
export function leanOf(balance: number): Lean {
  return tallerSide(balance) === 'left' ? 'left-heavy' : 'right-heavy'
}

/** True when the left branch is strictly taller. */
export function leansLeft(balance: number): boolean {
  return LEFT_FIRST ? balance > 0 : balance < 0
}

/** True when the right branch is strictly taller. */
export function leansRight(balance: number): boolean {
  return LEFT_FIRST ? balance < 0 : balance > 0
}
