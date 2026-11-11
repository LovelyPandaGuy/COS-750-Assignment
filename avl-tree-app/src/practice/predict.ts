import type { RebalanceCase } from '../engine/conventions'
import { REBALANCE_CASES } from '../engine/conventions'
import { avlInsertTrace } from '../engine/avl'
import { balanceFactorOf, subtreeAt, type Key, type Tree } from '../engine/tree'

// Predict first (FR-VIS-05). Every answer is read from the engine's insert
// trace; nothing here is typed in.

export type PredictionKind = 'node' | 'case' | 'root'
export type Choice = Key | RebalanceCase | 'none'

export interface PredictionQuestion {
  kind: PredictionKind
  tree: Tree
  key: Key
  /** The insertion path in order (node, root) or the four cases (case), then 'none'. */
  options: Choice[]
  answer: Choice
  /** Trace index of the imbalance step, or null when the insert stays balanced. */
  stepIndex: number | null
  /** The unbalanced node z, its taller child y and their balance factors as drawn at the imbalance step. */
  z: Key | null
  y: Key | null
  zBf: number | null
  /** The tree as drawn at the imbalance step, or after the last step when there is none. */
  snapshot: Tree
}

export function predictionFor(tree: Tree, key: Key, kind: PredictionKind): PredictionQuestion {
  const { trace } = avlInsertTrace(tree, key)
  const imbalance = trace.find((s) => s.kind === 'imbalance')
  const lastRotation = [...trace].reverse().find((s) => s.kind === 'rotation')
  const path = trace.filter((s) => s.kind === 'compare').map((s) => s.nodes[0])

  const options: Choice[] = kind === 'case' ? [...REBALANCE_CASES, 'none'] : [...path, 'none']
  let answer: Choice = 'none'
  if (imbalance !== undefined) {
    answer = kind === 'node' ? imbalance.nodes[0] : kind === 'case' ? (imbalance.rebalanceCase as RebalanceCase) : lastRotation!.nodes[1]
  }
  const snapshot = imbalance !== undefined ? imbalance.before : (trace[trace.length - 1]?.after ?? tree)
  const z = imbalance?.nodes[0] ?? null
  return {
    kind,
    tree,
    key,
    options,
    answer,
    stepIndex: imbalance?.index ?? null,
    z,
    y: imbalance?.nodes[1] ?? null,
    zBf: z === null ? null : balanceFactorOf(subtreeAt(snapshot, z)),
    snapshot,
  }
}

export type Comparison =
  | { tag: 'match' }
  | { tag: 'none-but-unbalanced'; z: Key; zBf: number }
  | { tag: 'unbalanced-none-expected'; predicted: Choice; predictedBf: number | null }
  | { tag: 'in-range'; predicted: Key; predictedBf: number; z: Key; zBf: number }
  | { tag: 'also-unbalanced-higher'; predicted: Key; predictedBf: number; z: Key; zBf: number }
  | {
      tag: 'case-mismatch'
      predicted: RebalanceCase
      actual: RebalanceCase
      z: Key
      y: Key
      zLeansLeft: boolean
      yLeansLeft: boolean
    }
  | { tag: 'root-mismatch'; predicted: Key; actual: Key }

/** What the student predicted against what happened, as data; the words live in content. */
export function compare(q: PredictionQuestion, choice: Choice): Comparison {
  if (choice === q.answer) return { tag: 'match' }
  if (q.z === null || q.zBf === null || q.y === null) {
    const predictedBf =
      q.kind === 'node' && typeof choice === 'number' ? balanceFactorOf(subtreeAt(q.snapshot, choice)) : null
    return { tag: 'unbalanced-none-expected', predicted: choice, predictedBf }
  }
  if (choice === 'none') return { tag: 'none-but-unbalanced', z: q.z, zBf: q.zBf }

  if (q.kind === 'node') {
    const predicted = choice as Key
    const predictedBf = balanceFactorOf(subtreeAt(q.snapshot, predicted))
    return Math.abs(predictedBf) > 1
      ? { tag: 'also-unbalanced-higher', predicted, predictedBf, z: q.z, zBf: q.zBf }
      : { tag: 'in-range', predicted, predictedBf, z: q.z, zBf: q.zBf }
  }
  if (q.kind === 'case') {
    return {
      tag: 'case-mismatch',
      predicted: choice as RebalanceCase,
      actual: q.answer as RebalanceCase,
      z: q.z,
      y: q.y,
      zLeansLeft: (q.answer as string)[0] === 'L',
      yLeansLeft: (q.answer as string)[1] === 'L',
    }
  }
  return { tag: 'root-mismatch', predicted: choice as Key, actual: q.answer as Key }
}
