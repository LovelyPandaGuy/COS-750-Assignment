// Seeded practice trees for C3 (design decision 5). Correct by construction: the engine checks
// each candidate, and a property test covers seeds 0 to 199.
import { analyseTree } from '../engine/analyse'
import { insert } from '../engine/bst'
import { avlInsert } from '../engine/avl'
import { caseFor, isOutOfBalance, REBALANCE_CASES, type RebalanceCase } from '../engine/conventions'
import { generateCaseSequence, generateInsertSequence, generateTree, variantSeed } from '../engine/generate'
import { createRng } from '../engine/random'
import { balanceFactorOf, type Key, type Tree } from '../engine/tree'
import { STRUCTURE_IDS, type StructureId } from './compare'
import { ROTATION_PRACTICE_KEYS } from './config'
import type { Step } from './schema'

const ATTEMPTS = 200
/** Hand-checked: root 50 is in range, node 30 is the only node out of range. */
export const ROOT_LOOKS_FINE_FALLBACK: readonly Key[] = [50, 30, 70, 20, 80, 10]

const plain = (keys: readonly Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)

/** A plain BST of 5 to 7 keys, so some balance factors may be out of range. */
export function generateFillInTree(seed: number): { keys: Key[]; tree: Tree } {
  const count = createRng(seed).int(5, 7)
  return generateTree(seed, { count, balanced: false })
}

function rootLooksFine(tree: Tree): boolean {
  if (tree === null || isOutOfBalance(balanceFactorOf(tree))) return false
  const v = analyseTree(tree).balanceViolations
  return v.length === 1 && v[0].key !== tree.key
}

/** A plain BST of 6 to 9 keys whose root is in range and exactly one other node is not. */
export function generateRootLooksFine(seed: number): { keys: Key[]; tree: Tree } {
  const rng = createRng(seed)
  for (let i = 0; i < ATTEMPTS; i++) {
    const keys = generateInsertSequence(rng.int(0, 0x7fffffff), { count: rng.int(6, 9) })
    const tree = plain(keys)
    if (rootLooksFine(tree)) return { keys, tree }
  }
  return { keys: [...ROOT_LOOKS_FINE_FALLBACK], tree: plain(ROOT_LOOKS_FINE_FALLBACK) }
}

// ---- Rotation practice (add-modules-c5-c6, design decision 5) ----

export type RotationSize = 'single' | 'double'

export interface RotationProblem {
  /** All keys, the last one being the key to insert. */
  keys: Key[]
  /** AVL tree of every key but the last. */
  base: Tree
  /** The key whose plain BST insert unbalances `base`. */
  key: Key
}

/**
 * Single rotations a rebalancing case uses: 1 when the unbalanced node and its taller child lean
 * the same way, else 2. Read through caseFor, so no case name is spelled here (D19).
 */
export function rotationsFor(c: RebalanceCase): 1 | 2 {
  return c === caseFor(true, true) || c === caseFor(false, false) ? 1 : 2
}

const CASE_TRIES = 5
/** Hand-checked fallbacks: 50, 30, 70, 20, 40 then 10 needs one rotation at 50; then 45 needs two. */
export const ROTATION_FALLBACK: Readonly<Record<RotationSize, readonly Key[]>> = {
  single: [50, 30, 70, 20, 40, 10],
  double: [50, 30, 70, 20, 40, 45],
}

const problemFrom = (keys: readonly Key[]): RotationProblem => ({
  keys: [...keys],
  base: keys.slice(0, -1).reduce<Tree>((t, k) => avlInsert(t, k).tree, null),
  key: keys[keys.length - 1],
})

/** A seeded problem whose last insert needs one rotation (single) or two (double), as the engine counts. */
export function generateRotationProblem(seed: number, size: RotationSize): RotationProblem {
  const wanted = size === 'single' ? 1 : 2
  const cases = REBALANCE_CASES.filter((c) => rotationsFor(c) === wanted)
  const pick = cases[createRng(seed).int(0, cases.length - 1)]
  for (let i = 0; i < CASE_TRIES; i++) {
    try {
      return problemFrom(generateCaseSequence(variantSeed(seed, i), pick, { count: ROTATION_PRACTICE_KEYS + 1, min: 1, max: 99 }))
    } catch (e) {
      if (!(e instanceof RangeError)) throw e
    }
  }
  return problemFrom(ROTATION_FALLBACK[size])
}

/** The rotation problem behind a rotation practice figure source, or null for any other source. */
export function practiceProblem(source: { kind: string; generator?: string }, seed: number): RotationProblem | null {
  if (source.kind !== 'practice') return null
  if (source.generator === 'single-rotation') return generateRotationProblem(seed, 'single')
  if (source.generator === 'double-rotation') return generateRotationProblem(seed, 'double')
  // C6 mixes both: the seed decides whether this problem needs one rotation or two.
  if (source.generator === 'insert-rebalance') return generateRotationProblem(seed, createRng(seed ^ 0xc6c6).next() < 0.5 ? 'single' : 'double')
  return null
}

// ---- Scenario practice (add-module-c8-choosing, design decision 5) ----

export interface ScenarioPick {
  scenario: string
  /** The four structures in the order the options are shown. */
  order: StructureId[]
}

/**
 * The scenario a practice step shows for this seed, and the option order (Fisher-Yates). When
 * `avoid` is the scenario that was showing, the next one in the list is used instead, so New
 * scenario always changes it when the step has more than one.
 */
export function pickScenario(step: Pick<Step, 'scenarios'>, seed: number, avoid?: string): ScenarioPick {
  const list = step.scenarios ?? []
  const rng = createRng(seed)
  let i = list.length === 0 ? 0 : rng.int(0, list.length - 1)
  if (list.length > 1 && list[i] === avoid) i = (i + 1) % list.length
  const order: StructureId[] = [...STRUCTURE_IDS]
  for (let j = order.length - 1; j > 0; j--) {
    const k = rng.int(0, j)
    ;[order[j], order[k]] = [order[k], order[j]]
  }
  return { scenario: list[i] ?? '', order }
}
