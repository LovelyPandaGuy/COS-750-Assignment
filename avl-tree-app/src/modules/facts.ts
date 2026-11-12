// Facts for a step, computed with the engine (design decision 2). Content only formats these;
// it never types a height, a step count or a balance factor.
import { analyseTree } from '../engine/analyse'
import { avlInsert } from '../engine/avl'
import { insert } from '../engine/bst'
import { isOutOfBalance, type RebalanceCase } from '../engine/conventions'
import { searchTrace } from '../engine/search'
import { balanceFactorOf, height, type Key, type Tree } from '../engine/tree'
import { rotateAt } from '../practice/rotate'
import { generateFillInTree, generateRootLooksFine, generateRotationProblem, rotationsFor } from './generators'
import { SCENARIOS } from '../content/modules/structures'
import { answersOf, binarySearchProbes, reasonOf, STRUCTURE_IDS, type NeedId, type StructureId } from './compare'
import type { ArraySpec, RotationSpec, Step, TreeSource } from './schema'

export interface NodeFacts {
  height: number
  balanceFactor: number
  leftHeight: number
  rightHeight: number
}

export interface FigureFacts {
  id: string
  tree: Tree
  keys: Key[]
  height: number
  nodeCount: number
  rootKey: Key | null
  rootBalance: number
  isAvl: boolean
  isPerfect: boolean
  /** Keys of nodes outside the allowed range, lowest first. */
  violations: Key[]
  searchKey?: Key
  searchSteps?: number
  nodes: Record<Key, NodeFacts>
  /** Keys in order (left subtree, node, right subtree). */
  inOrder: Key[]
  /** Every rebalance when the same keys go into an AVL tree, in insert order. */
  rebalances: RebalanceFacts[]
  /** Root of the AVL tree built from the same keys. */
  avlRootKey: Key | null
  /** Rotations in the source that could not be performed (shown by the validator). */
  sourceProblems: string[]
}

export interface RebalanceFacts {
  /** The key whose insert caused it. */
  key: Key
  /** The unbalanced node. */
  node: Key
  case: RebalanceCase
  /** Single rotations used: 1 for a single rotation, 2 for a double. */
  rotations: 1 | 2
}

export interface BoundFacts {
  n: number
  /** Steps when the tree is as short as possible: its height plus one. */
  best: number
  /** Steps when the tree is a chain. */
  worst: number
}

export interface ArrayFacts {
  id: string
  /** The keys in increasing order, as the array holds them. */
  sorted: Key[]
  searchKey: Key
  /** The key at each binary search probe, in order. */
  probes: Key[]
  probeCount: number
  found: boolean
}

export interface ScenarioFacts {
  id: string
  needs: NeedId[]
  /** The one structure that meets every need; null only for an invalid scenario (the validator reports it). */
  answer: StructureId | null
  /** Every other structure, with the first need it does not meet. */
  ruledOut: { structure: StructureId; need: NeedId }[]
}

export interface StepFacts {
  figures: Record<string, FigureFacts>
  bounds: BoundFacts[]
  arrays: Record<string, ArrayFacts>
  scenarios: Record<string, ScenarioFacts>
}

export interface BuiltTree {
  keys: Key[]
  tree: Tree
  /** Rotations that could not be performed; empty for every other source. */
  problems?: string[]
}

const plain = (keys: readonly Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)

/** Apply each rotation with the engine; one that cannot happen leaves the tree and is reported. */
function rotate(tree: Tree, rotations: readonly RotationSpec[]): { tree: Tree; problems: string[] } {
  const problems: string[] = []
  for (const { dir, at } of rotations) {
    const r = rotateAt(tree, at, dir)
    if (r.ok === false) {
      problems.push(r.reason === 'no-node' ? `rotate ${dir} at ${at}: ${at} is not in the tree` : `rotate ${dir} at ${at}: node ${at} has no ${r.side} child`)
    } else tree = r.tree
  }
  return { tree, problems }
}

export function buildTree(source: TreeSource, seed = 0): BuiltTree {
  switch (source.kind) {
    case 'bst':
      return { keys: [...source.keys], tree: plain(source.keys) }
    case 'avl':
      return { keys: [...source.keys], tree: source.keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null) }
    case 'rotated': {
      const { tree, problems } = rotate(plain(source.keys), source.rotations)
      return { keys: [...source.keys], tree, problems }
    }
    case 'practice':
      switch (source.generator) {
        case 'fill-in':
          return generateFillInTree(seed)
        case 'root-looks-fine':
          return generateRootLooksFine(seed)
        case 'single-rotation':
        case 'double-rotation': {
          // The student sees the tree after the plain BST insert, before any rebalancing.
          const p = generateRotationProblem(seed, source.generator === 'single-rotation' ? 'single' : 'double')
          return { keys: p.keys, tree: insert(p.base, p.key).tree }
        }
      }
  }
}

/** Fold the keys into an AVL tree, keeping each rebalance the engine performs. */
function avlFold(keys: readonly Key[]): { tree: Tree; rebalances: RebalanceFacts[] } {
  const rebalances: RebalanceFacts[] = []
  let tree: Tree = null
  for (const key of keys) {
    const r = avlInsert(tree, key)
    tree = r.tree
    if (r.rebalance !== null) rebalances.push({ key, node: r.rebalance.node, case: r.rebalance.case, rotations: rotationsFor(r.rebalance.case) })
  }
  return { tree, rebalances }
}

export function inOrderKeys(tree: Tree): Key[] {
  return tree === null ? [] : [...inOrderKeys(tree.left), tree.key, ...inOrderKeys(tree.right)]
}

export function nodeCount(tree: Tree): number {
  return tree === null ? 0 : 1 + nodeCount(tree.left) + nodeCount(tree.right)
}

/** Every leaf at the same depth and every inner node with two children. */
export function isPerfect(tree: Tree): boolean {
  return nodeCount(tree) === 2 ** (height(tree) + 1) - 1
}

/** Best and worst case search step counts for n keys (ID C2: about log2 n, and n). */
export function searchBounds(n: number): BoundFacts {
  const best = n < 1 ? 0 : Math.floor(Math.log2(n)) + 1
  return { n, best, worst: n }
}

function nodesOf(tree: Tree, into: Record<Key, NodeFacts> = {}): Record<Key, NodeFacts> {
  if (tree === null) return into
  into[tree.key] = {
    height: tree.height,
    balanceFactor: balanceFactorOf(tree),
    leftHeight: height(tree.left),
    rightHeight: height(tree.right),
  }
  nodesOf(tree.left, into)
  nodesOf(tree.right, into)
  return into
}

export function figureFacts(id: string, tree: Tree, keys: Key[], searchKey?: Key, sourceProblems: string[] = []): FigureFacts {
  const analysis = analyseTree(tree)
  const avl = avlFold(keys)
  return {
    id,
    tree,
    keys,
    height: height(tree),
    nodeCount: nodeCount(tree),
    rootKey: tree?.key ?? null,
    rootBalance: balanceFactorOf(tree),
    isAvl: analysis.isAvl,
    isPerfect: isPerfect(tree),
    violations: analysis.balanceViolations.map((v) => v.key),
    ...(searchKey !== undefined && { searchKey, searchSteps: searchTrace(tree, searchKey).steps }),
    nodes: nodesOf(tree),
    inOrder: inOrderKeys(tree),
    rebalances: avl.rebalances,
    avlRootKey: avl.tree?.key ?? null,
    sourceProblems,
  }
}

/** Build every tree of a step and compute its facts. Practice trees use the seed. */
export function computeFacts(step: Step, seed = 0): StepFacts {
  const figures: Record<string, FigureFacts> = {}
  for (const f of step.figures ?? []) {
    const { keys, tree, problems } = buildTree(f.source, seed)
    figures[f.id] = figureFacts(f.id, tree, keys, f.searchKey, problems)
  }
  const arrays: Record<string, ArrayFacts> = {}
  for (const a of step.arrays ?? []) arrays[a.id] = arrayFacts(a)
  const scenarios: Record<string, ScenarioFacts> = {}
  for (const id of step.scenario === undefined ? [] : [step.scenario]) {
    const f = scenarioFacts(id)
    if (f !== null) scenarios[id] = f
  }
  return { figures, bounds: (step.bounds ?? []).map(searchBounds), arrays, scenarios }
}

export function arrayFacts(spec: ArraySpec): ArrayFacts {
  // Duplicate keys are dropped: an array of keys holds each key once.
  const sorted = [...new Set(spec.keys)].sort((a, b) => a - b)
  const { probes, found } = binarySearchProbes(sorted, spec.searchKey)
  return { id: spec.id, sorted, searchKey: spec.searchKey, probes, probeCount: probes.length, found }
}

/** Answer and reasons for a scenario in the record, or null when the id is unknown. */
export function scenarioFacts(id: string): ScenarioFacts | null {
  const sc = SCENARIOS[id]
  if (sc === undefined) return null
  const answers = answersOf(sc)
  const answer = answers.length === 1 ? answers[0] : null
  const ruledOut = STRUCTURE_IDS.filter((s) => s !== answer).flatMap((structure) => {
    const need = reasonOf(sc, structure)
    return need === null ? [] : [{ structure, need }]
  })
  return { id, needs: [...sc.needs], answer, ruledOut }
}

/** True when the root's balance factor is allowed. */
export function rootInRange(f: FigureFacts): boolean {
  return !isOutOfBalance(f.rootBalance)
}
