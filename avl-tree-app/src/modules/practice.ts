// Marking for the C3 practice activities (design decision 8). Pure; every value comes from the
// engine. Nothing here is stored: practice never counts toward readiness (wireframe 1p).
import { analyseTree } from '../engine/analyse'
import { balanceFactorOf, height, subtreeAt, type Key, type Tree } from '../engine/tree'

export type BalanceFactorResult = {
  kind: 'right' | 'sign-slip' | 'not-yet'
  key: Key
  answer: number
  correct: number
  leftHeight: number
  rightHeight: number
}

export function markBalanceFactor(tree: Tree, key: Key, answer: number): BalanceFactorResult {
  const node = subtreeAt(tree, key)
  const correct = balanceFactorOf(node)
  const leftHeight = height(node?.left ?? null)
  const rightHeight = height(node?.right ?? null)
  const kind = answer === correct ? 'right' : correct !== 0 && answer === -correct ? 'sign-slip' : 'not-yet'
  return { kind, key, answer, correct, leftHeight, rightHeight }
}

export type SpotResult = {
  kind: 'right' | 'not-yet'
  picked: Key
  /** The node that breaks the rule (the lowest one if several do). */
  answer: Key
  pickedBalance: number
  /** Which side of the root the answer is on, for the fuller hint. */
  answerSide: 'left' | 'right'
}

/** The node that breaks the AVL rule, lowest first. */
export function brokenNode(tree: Tree): Key | null {
  return analyseTree(tree).balanceViolations[0]?.key ?? null
}

export function markSpot(tree: Tree, picked: Key): SpotResult {
  const answer = brokenNode(tree) ?? picked
  const violations = new Set(analyseTree(tree).balanceViolations.map((v) => v.key))
  return {
    kind: violations.has(picked) ? 'right' : 'not-yet',
    picked,
    answer,
    pickedBalance: balanceFactorOf(subtreeAt(tree, picked)),
    answerSide: tree !== null && answer < tree.key ? 'left' : 'right',
  }
}

/** Parse what a learner typed: "+2", "2", "-2", "−2". Null when it is not a whole number. */
export function parseWhole(text: string): number | null {
  const t = text.trim().replace('−', '-')
  return /^[+-]?\d+$/.test(t) ? Number(t) : null
}

/** Every key in the tree, in order. */
export function treeKeys(tree: Tree): Key[] {
  return tree === null ? [] : [...treeKeys(tree.left), tree.key, ...treeKeys(tree.right)]
}
