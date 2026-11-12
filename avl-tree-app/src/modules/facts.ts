// Facts for a step, computed with the engine (design decision 2). Content only formats these;
// it never types a height, a step count or a balance factor.
import { analyseTree } from '../engine/analyse'
import { avlInsert } from '../engine/avl'
import { insert } from '../engine/bst'
import { isOutOfBalance } from '../engine/conventions'
import { searchTrace } from '../engine/search'
import { balanceFactorOf, height, type Key, type Tree } from '../engine/tree'
import { generateFillInTree, generateRootLooksFine } from './generators'
import type { Step, TreeSource } from './schema'

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
}

export interface BoundFacts {
  n: number
  /** Steps when the tree is as short as possible: its height plus one. */
  best: number
  /** Steps when the tree is a chain. */
  worst: number
}

export interface StepFacts {
  figures: Record<string, FigureFacts>
  bounds: BoundFacts[]
}

export function buildTree(source: TreeSource, seed = 0): { keys: Key[]; tree: Tree } {
  switch (source.kind) {
    case 'bst':
      return { keys: [...source.keys], tree: source.keys.reduce<Tree>((t, k) => insert(t, k).tree, null) }
    case 'avl':
      return { keys: [...source.keys], tree: source.keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null) }
    case 'practice':
      return source.generator === 'fill-in' ? generateFillInTree(seed) : generateRootLooksFine(seed)
  }
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

export function figureFacts(id: string, tree: Tree, keys: Key[], searchKey?: Key): FigureFacts {
  const analysis = analyseTree(tree)
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
  }
}

/** Build every tree of a step and compute its facts. Practice trees use the seed. */
export function computeFacts(step: Step, seed = 0): StepFacts {
  const figures: Record<string, FigureFacts> = {}
  for (const f of step.figures ?? []) {
    const { keys, tree } = buildTree(f.source, seed)
    figures[f.id] = figureFacts(f.id, tree, keys, f.searchKey)
  }
  return { figures, bounds: (step.bounds ?? []).map(searchBounds) }
}

/** True when the root's balance factor is allowed. */
export function rootInRange(f: FigureFacts): boolean {
  return !isOutOfBalance(f.rootBalance)
}
