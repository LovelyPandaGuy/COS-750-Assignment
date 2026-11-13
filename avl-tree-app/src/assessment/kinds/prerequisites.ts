// Kinds for the C1 prerequisite diagnostic (add-diagnostic-c1-and-routing, design decision 3).
// Every tree, answer and wrong value comes from the engine.
import { analyseTree } from '../../engine/analyse'
import { generateTree, variantSeed } from '../../engine/generate'
import { createRng } from '../../engine/random'
import { makeNode, type Key, type Tree, type TreeNode } from '../../engine/tree'
import type { Kind } from '../types'
import { nodes, pathTo, unique } from './shared'

const TRIES = 300
/** Keeps a pick independent of the tree's own draws from the same seed. */
const PICK = 0x9e3779b9
const isLeaf = (n: TreeNode) => n.left === null && n.right === null

export const treeTerms: Kind = {
  type: 'number',
  misconceptions: ['M-LEAVES-COUNT-ALL', 'M-LEAVES-COUNT-PARENTS'],
  build(seed) {
    for (let k = 0; k < TRIES; k++) {
      const s = variantSeed(seed, 5000 + k)
      const count = createRng(s).int(6, 8)
      const { keys, tree } = generateTree(s, { count, balanced: false })
      const leaves = nodes(tree).filter(isLeaf).length
      const parents = count - leaves
      if (new Set([leaves, count, parents]).size < 3) continue
      return {
        facts: { tree, keys, values: { leaves, count, parents } },
        numbers: unique([...keys, leaves, count, parents]),
        signature: keys.join(','),
        answer: leaves,
        wrong: [
          { value: count, misconception: 'M-LEAVES-COUNT-ALL' },
          { value: parents, misconception: 'M-LEAVES-COUNT-PARENTS' },
        ],
      }
    }
    throw new RangeError('tree-terms: no tree with three different counts')
  },
}

/** `tree` with the leaf `old` given the key `fresh`. */
function replaceLeaf(tree: Tree, old: Key, fresh: Key): Tree {
  if (tree === null) return null
  if (tree.key === old && isLeaf(tree)) return makeNode(fresh, null, null)
  return makeNode(tree.key, replaceLeaf(tree.left, old, fresh), replaceLeaf(tree.right, old, fresh))
}

/** A tree with one leaf that fits its parent but breaks the ordering against its grandparent. */
function withViolation(tree: Tree, keys: readonly Key[], rng: ReturnType<typeof createRng>): { tree: Tree; offender: Key; ancestor: Key; dir: 'left' | 'right' } | null {
  const options: { leaf: Key; ancestor: Key; dir: 'left' | 'right'; fresh: Key[] }[] = []
  for (const g of nodes(tree)) {
    const [p, side] = g.right !== null && g.right.left !== null ? [g.right, 'right' as const] : g.left !== null && g.left.right !== null ? [g.left, 'left' as const] : [null, 'left' as const]
    if (p === null) continue
    const c = side === 'right' ? p.left : p.right
    if (c === null || !isLeaf(c)) continue
    // In g's right subtree but below g: the new key must be smaller than g; in its left subtree: larger.
    const fresh = side === 'right' ? Array.from({ length: g.key - 1 }, (_, i) => i + 1) : Array.from({ length: 99 - g.key }, (_, i) => g.key + 1 + i)
    options.push({ leaf: c.key, ancestor: g.key, dir: side, fresh: fresh.filter((n) => !keys.includes(n)) })
  }
  const usable = options.filter((o) => o.fresh.length > 0)
  if (usable.length === 0) return null
  const pick = usable[rng.int(0, usable.length - 1)]
  const offender = pick.fresh[rng.int(0, pick.fresh.length - 1)]
  return { tree: replaceLeaf(tree, pick.leaf, offender), offender, ancestor: pick.ancestor, dir: pick.dir }
}

export const isBst: Kind = {
  type: 'choice',
  misconceptions: ['M-BST-PARENT-ONLY', 'M-BST-NEEDS-BALANCE'],
  build(seed) {
    for (let k = 0; k < TRIES; k++) {
      const s = variantSeed(seed, 6000 + k)
      const rng = createRng(s ^ PICK)
      const { keys, tree } = generateTree(s, { count: 7, balanced: false })
      if (rng.next() < 0.5) {
        return {
          facts: { tree, keys, values: {} },
          numbers: unique([...keys]),
          signature: `${keys.join(',')}|ok`,
          answer: 'yes',
          wrong: [{ value: 'no', misconception: 'M-BST-NEEDS-BALANCE' }],
        }
      }
      const bad = withViolation(tree, keys, rng)
      if (bad === null || analyseTree(bad.tree).isBst) continue
      return {
        facts: { tree: bad.tree, keys, target: bad.offender, dir: bad.dir, values: { offender: bad.offender, ancestor: bad.ancestor } },
        numbers: unique([...keys, bad.offender, bad.ancestor]),
        signature: `${keys.join(',')}|${bad.offender}`,
        answer: 'no',
        wrong: [{ value: 'yes', misconception: 'M-BST-PARENT-ONLY' }],
      }
    }
    throw new RangeError('is-bst: no tree built')
  },
}

export const insertParent: Kind = {
  type: 'number',
  misconceptions: ['M-INSERT-AT-ROOT', 'M-INSERT-NEAR-VALUE'],
  build(seed) {
    for (let k = 0; k < TRIES; k++) {
      const s = variantSeed(seed, 7000 + k)
      const rng = createRng(s ^ PICK)
      const { keys, tree } = generateTree(s, { count: 6, balanced: false })
      const key = rng.int(1, 99)
      if (keys.includes(key)) continue
      const path = pathTo(tree, key)
      const parent = path[path.length - 1]
      const root = tree!.key
      const closest = [...keys].sort((a, b) => Math.abs(a - key) - Math.abs(b - key) || a - b)[0]
      if (parent === root || parent === undefined) continue
      return {
        facts: { tree, keys, target: key, values: { parent, root, closest } },
        numbers: unique([...keys, key, parent, root, closest]),
        signature: `${keys.join(',')}|${key}`,
        answer: parent,
        wrong: [
          { value: root, misconception: 'M-INSERT-AT-ROOT' },
          // The nearest value is only a distractor when it is a different node (a free-text answer can still be it).
          ...(closest !== parent && closest !== root ? [{ value: closest, misconception: 'M-INSERT-NEAR-VALUE' }] : []),
        ],
      }
    }
    throw new RangeError('insert-parent: no key found')
  },
}
