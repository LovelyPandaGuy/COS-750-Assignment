// "Be the algorithm" practice for C4 (add-module-c4-search, LO4). Trees and keys are seeded; every
// answer is the engine's search trace. Nothing here is stored.
import { generateTree } from '../engine/generate'
import { createRng } from '../engine/random'
import { searchTrace } from '../engine/search'
import type { Key, Tree } from '../engine/tree'
import { SEARCH_PRACTICE_KEYS } from './config'

const MIN_KEY = 1
const MAX_KEY = 99

export interface SearchPracticeProblem {
  tree: Tree
  key: Key
}

/** A seeded AVL tree and a key to find: one of its keys, or one from 1 to 99 that it lacks. */
export function drawSearchPractice(seed: number, which: 'found' | 'missing'): SearchPracticeProblem {
  const { keys, tree } = generateTree(seed, { count: SEARCH_PRACTICE_KEYS, min: MIN_KEY, max: MAX_KEY, balanced: true })
  // A separate stream from the tree's, so the key does not repeat the first key drawn.
  const rng = createRng(seed ^ 0x5eed)
  if (which === 'found') return { tree, key: keys[rng.int(0, keys.length - 1)] }
  const absent: Key[] = []
  for (let k = MIN_KEY; k <= MAX_KEY; k++) if (!keys.includes(k)) absent.push(k)
  return { tree, key: absent[rng.int(0, absent.length - 1)] }
}

/** The nodes a search compares with, in order, and whether it finds the key. */
export function searchPath(tree: Tree, key: Key): { path: Key[]; found: boolean } {
  const t = searchTrace(tree, key)
  return { path: t.trace.filter((s) => s.kind === 'compare').map((s) => s.nodes[0]), found: t.found }
}

/** What the search does next, given the nodes visited so far. */
export type SearchMove =
  /** Nothing visited yet: the next node is the root. */
  | { kind: 'start' }
  /** At node `at`, the key is smaller (go left) or larger (go right). */
  | { kind: 'go'; at: Key; smaller: boolean }
  /** The key is at node `at`: the search is over. */
  | { kind: 'found'; at: Key }
  /** At node `at` the search would step to an empty spot: the key is not in the tree. */
  | { kind: 'off'; at: Key; smaller: boolean }

export type Pick = Key | 'not-in-tree'

export interface PickResult {
  kind: 'right' | 'not-yet'
  picked: Pick
  /** The move the search makes from the path the pick was made on. */
  move: SearchMove
}

/** The search's next move after `visited` (a prefix of the engine's path). */
export function nextMove(tree: Tree, key: Key, visited: readonly Key[]): SearchMove {
  const { path, found } = searchPath(tree, key)
  if (visited.length === 0) return { kind: 'start' }
  const at = visited[visited.length - 1]
  if (at === key) return { kind: 'found', at }
  const smaller = key < at
  return visited.length === path.length && !found ? { kind: 'off', at, smaller } : { kind: 'go', at, smaller }
}

/** Mark one pick against the engine's path (D21: unlimited retries, the path never moves on a not-yet). */
export function markPick(tree: Tree, key: Key, visited: readonly Key[], picked: Pick): PickResult {
  const { path } = searchPath(tree, key)
  const move = nextMove(tree, key, visited)
  const right = picked === 'not-in-tree' ? move.kind === 'off' : move.kind !== 'found' && move.kind !== 'off' && path[visited.length] === picked
  return { kind: right ? 'right' : 'not-yet', picked, move }
}
