// Kinds for C2 to C4 (add-question-model-and-bank, design decision 5).
import { analyseTree } from '../../engine/analyse'
import { EMPTY_HEIGHT, LEAF_HEIGHT, balanceFactor } from '../../engine/conventions'
import { generateInsertSequence, generateTree, variantSeed } from '../../engine/generate'
import { createRng } from '../../engine/random'
import { searchTrace } from '../../engine/search'
import { balanceFactorOf, height, subtreeAt, type Key } from '../../engine/tree'
import { isPerfect, searchBounds } from '../../modules/facts'
import { brokenNode } from '../../modules/practice'
import { generateFillInTree, generateRootLooksFine } from '../../modules/generators'
import type { Kind } from '../types'
import { avl, depthOf, nodes, plain, unique } from './shared'

const TRIES = 50
/** Salt so a node pick does not reuse the tree's own draws. */
const PICK = 0x9e3779b9

export const bstHeight: Kind = {
  type: 'choice',
  misconceptions: ['M-HEIGHT-NODES', 'M-ORDER-IRRELEVANT'],
  build(seed) {
    const count = createRng(seed).int(5, 7)
    const keys = generateInsertSequence(seed, { count })
    const h = height(plain(keys))
    const balanced = height(avl(keys))
    return {
      facts: { tree: null, keys, values: { height: h, count, heightInNodes: h + 1, balancedHeight: balanced } },
      numbers: unique([...keys, count, h, h + 1, balanced]),
      signature: keys.join(','),
      answer: h,
      wrong: [
        { value: h + 1, misconception: 'M-HEIGHT-NODES' },
        { value: balanced, misconception: 'M-ORDER-IRRELEVANT' },
      ],
    }
  },
}

export const sortedSearch: Kind = {
  type: 'choice',
  misconceptions: ['M-ASSUMES-BALANCED', 'M-COUNTS-EDGES'],
  build(seed) {
    const n = createRng(seed).int(5, 9)
    const keys = generateInsertSequence(seed, { count: n }).sort((a, b) => a - b)
    const target = keys[n - 1]
    const steps = searchTrace(plain(keys), target).steps
    const best = searchBounds(n).best
    return {
      facts: { tree: null, keys, target, values: { count: n, steps, best, edges: steps - 1 } },
      numbers: unique([...keys, n, steps, best, steps - 1]),
      signature: keys.join(','),
      answer: steps,
      wrong: [
        { value: best, misconception: 'M-ASSUMES-BALANCED' },
        { value: steps - 1, misconception: 'M-COUNTS-EDGES' },
      ],
    }
  },
}

export const nodeHeight: Kind = {
  type: 'number',
  misconceptions: ['M-HEIGHT-NODES', 'M-HEIGHT-IS-DEPTH'],
  build(seed) {
    const { keys, tree } = generateFillInTree(seed)
    const inner = nodes(tree).filter((n) => n.height >= 1)
    const below = inner.filter((n) => n.key !== tree!.key)
    const pool = below.length > 0 ? below : inner
    const node = pool[createRng(seed ^ PICK).int(0, pool.length - 1)]
    const h = node.height
    const d = depthOf(tree, node.key)
    return {
      facts: {
        tree,
        keys,
        target: node.key,
        values: { height: h, depth: d, leftHeight: height(node.left), rightHeight: height(node.right), heightInNodes: h + 1 },
      },
      numbers: unique([...keys, h, h + 1, d, height(node.left), height(node.right)]),
      signature: `${keys.join(',')}|${node.key}`,
      answer: h,
      wrong: [
        { value: h + 1, misconception: 'M-HEIGHT-NODES' },
        { value: d, misconception: 'M-HEIGHT-IS-DEPTH' },
      ],
    }
  },
}

export const balanceFactorKind: Kind = {
  type: 'number',
  misconceptions: ['M-BF-SIGN', 'M-EMPTY-HEIGHT'],
  build(seed) {
    // Even seeds prefer a node with an empty subtree, so the empty-height slip can show.
    const wantEmpty = (seed & 1) === 0
    for (let i = 0; i < TRIES; i++) {
      const { keys, tree } = generateFillInTree(i === 0 ? seed : variantSeed(seed, 500 + i))
      const lopsided = nodes(tree).filter((n) => balanceFactorOf(n) !== 0)
      if (lopsided.length === 0) continue
      const withEmpty = lopsided.filter((n) => n.left === null || n.right === null)
      const pool = wantEmpty && withEmpty.length > 0 ? withEmpty : lopsided
      const node = pool[createRng(seed ^ PICK).int(0, pool.length - 1)]
      const [lh, rh] = [height(node.left), height(node.right)]
      const bf = balanceFactorOf(node)
      const asLeaf = (h: number) => (h === EMPTY_HEIGHT ? LEAF_HEIGHT : h)
      const slip = balanceFactor(asLeaf(lh), asLeaf(rh))
      return {
        facts: { tree, keys, target: node.key, values: { balanceFactor: bf, leftHeight: lh, rightHeight: rh, signSlip: -bf, emptySlip: slip } },
        numbers: unique([...keys, bf, -bf, lh, rh, slip]),
        signature: `${keys.join(',')}|${node.key}`,
        answer: bf,
        wrong: [
          { value: -bf, misconception: 'M-BF-SIGN' },
          { value: slip, misconception: 'M-EMPTY-HEIGHT' },
        ],
      }
    }
    throw new RangeError(`no node with a non-zero balance factor for seed ${seed}`)
  },
}

/** Hand-checked: an AVL tree that is not perfect (root 50 has one child on its right). */
const NOT_PERFECT_FALLBACK: readonly Key[] = [50, 30, 70, 20]

export const isAvl: Kind = {
  type: 'choice',
  misconceptions: ['M-ROOT-ONLY', 'M-PERFECT-ONLY'],
  build(seed) {
    if ((seed & 1) === 0) {
      const { keys, tree } = generateRootLooksFine(seed)
      const broken = brokenNode(tree)!
      const bb = balanceFactorOf(subtreeAt(tree, broken))
      const rb = balanceFactorOf(tree)
      return {
        facts: { tree, keys, values: { broken, brokenBalance: bb, rootBalance: rb } },
        numbers: unique([...keys, bb, rb]),
        signature: keys.join(','),
        answer: 'no',
        wrong: [{ value: 'yes', misconception: 'M-ROOT-ONLY' }],
      }
    }
    let keys: Key[] = [...NOT_PERFECT_FALLBACK]
    for (let i = 0; i < TRIES; i++) {
      const v = i === 0 ? seed : variantSeed(seed, 500 + i)
      const g = generateTree(v, { count: createRng(v).int(6, 9) })
      if (!isPerfect(g.tree)) {
        keys = g.keys
        break
      }
    }
    const tree = avl(keys)
    const h = height(tree)
    return {
      facts: { tree, keys, values: { height: h, count: keys.length } },
      numbers: unique([...keys, h, keys.length]),
      signature: keys.join(','),
      answer: analyseTree(tree).isAvl ? 'yes' : 'no',
      wrong: [{ value: 'no', misconception: 'M-PERFECT-ONLY' }],
    }
  },
}

const SEARCH_SIZE = 7

export const searchVisits: Kind = {
  type: 'choice',
  misconceptions: ['M-COUNTS-EDGES', 'M-SEARCH-VISITS-ALL'],
  build(seed, params) {
    const found = params?.found !== false
    const { keys, tree } = generateTree(seed, { count: SEARCH_SIZE })
    const rng = createRng(seed ^ PICK)
    const sorted = [...keys].sort((a, b) => a - b)
    const candidates = found
      ? keys.filter((k) => k !== tree!.key)
      : Array.from({ length: sorted[sorted.length - 1] - sorted[0] }, (_, i) => sorted[0] + i).filter((k) => !keys.includes(k))
    const target = candidates[rng.int(0, candidates.length - 1)]
    const steps = searchTrace(tree, target).steps
    return {
      facts: { tree, keys, target, values: { steps, edges: steps - 1, count: SEARCH_SIZE } },
      numbers: unique([...keys, target, steps, steps - 1, SEARCH_SIZE]),
      signature: `${keys.join(',')}|${target}`,
      answer: steps,
      wrong: [
        { value: steps - 1, misconception: 'M-COUNTS-EDGES' },
        { value: SEARCH_SIZE, misconception: 'M-SEARCH-VISITS-ALL' },
      ],
    }
  },
}
