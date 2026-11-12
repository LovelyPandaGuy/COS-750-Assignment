// Kinds for C5 and C6 (add-question-model-and-bank, design decision 5). Cases come from the engine
// and caseFor only, so no case name is spelled here (D19).
import { avlInsertTrace, rebalance } from '../../engine/avl'
import { insert } from '../../engine/bst'
import { caseFor, isOutOfBalance, REBALANCE_CASES, type RebalanceCase } from '../../engine/conventions'
import { generateInsertSequence, generateTree, variantSeed } from '../../engine/generate'
import { createRng } from '../../engine/random'
import { rotateLeft, rotateRight } from '../../engine/rotations'
import { balanceFactorOf, replaceAt, subtreeAt, type Key, type Tree } from '../../engine/tree'
import { generateRotationProblem, type RotationProblem } from '../../modules/generators'
import { rotationHintFacts, type RotationHintFacts } from '../../modules/practice'
import type { Built, Kind, WrongValue } from '../types'
import { avl, nodes, pathTo, unique } from './shared'

const PICK = 0x9e3779b9
const LOWEST_OPTIONS = 4

interface Problem extends RotationProblem {
  hint: RotationHintFacts
  /** The tree right after the plain BST insert, before any rotation. */
  after: Tree
  bf: (key: Key) => number
}

function withHint(p: RotationProblem): Problem {
  const after = insert(p.base, p.key).tree
  return { ...p, hint: rotationHintFacts(p.base, p.key), after, bf: (k) => balanceFactorOf(subtreeAt(after, k)) }
}

/** A rotation problem: one rotation on even seeds, two on odd ones. */
function problem(seed: number): Problem {
  return withHint(generateRotationProblem(seed, (seed & 1) === 0 ? 'single' : 'double'))
}

const DEEP_TRIES = 50
const DEEP_KEYS = 8
/** Checked: inserting 27 into the AVL tree of the first seven keys leaves 26, 42 and 86 out of range (lowest: 26). */
export const DEEP_FALLBACK: readonly Key[] = [99, 42, 26, 86, 90, 67, 34, 27]

const unbalancedCount = (t: Tree) => nodes(t).filter((n) => isOutOfBalance(balanceFactorOf(n))).length

/**
 * Every fourth seed, a larger problem whose plain insert leaves a second unbalanced node above the
 * lowest one, so the fix-a-higher-node slip can appear (design risk note). Other seeds: problem().
 */
function deepProblem(seed: number): Problem {
  if (seed % 4 !== 0) return problem(seed)
  for (let i = 0; i < DEEP_TRIES; i++) {
    const v = variantSeed(seed, 700 + i)
    const keys = generateInsertSequence(v, { count: DEEP_KEYS - 1 })
    const tree = avl(keys)
    const fits = Array.from({ length: 99 }, (_, j) => j + 1).filter((k) => !keys.includes(k) && unbalancedCount(insert(tree, k).tree) >= 2)
    if (fits.length > 0) {
      const key = fits[createRng(v).int(0, fits.length - 1)]
      return withHint({ keys: [...keys, key], base: tree, key })
    }
  }
  return withHint({ keys: [...DEEP_FALLBACK], base: avl(DEEP_FALLBACK.slice(0, -1)), key: DEEP_FALLBACK[DEEP_FALLBACK.length - 1] })
}

function base(p: Problem, extra: Record<string, number> = {}): Pick<Built, 'facts' | 'signature'> & { numbers: number[] } {
  const { z, y } = p.hint
  const values = { z, y, zBalance: p.bf(z), yBalance: p.bf(y), rotations: p.hint.rotations.length, ...extra }
  return {
    facts: { tree: p.base, keys: p.keys.slice(0, -1), target: p.key, values },
    numbers: unique([...p.keys, ...Object.values(values)]),
    signature: p.keys.join(','),
  }
}

export const rotationResult: Kind = {
  type: 'choice',
  misconceptions: ['M-ROTATION-DIRECTION', 'M-ROOT-STAYS'],
  build(seed) {
    const { keys, tree } = generateTree(seed, { count: 7 })
    const rng = createRng(seed ^ PICK)
    const full = nodes(tree).filter((n) => n.left !== null && n.right !== null)
    const node = full[rng.int(0, full.length - 1)]
    const dir = rng.int(0, 1) === 0 ? 'left' : 'right'
    const top = (d: 'left' | 'right') => (d === 'left' ? rotateLeft : rotateRight)(node)!.key
    const answer = top(dir)
    const other = top(dir === 'left' ? 'right' : 'left')
    return {
      facts: { tree, keys, target: node.key, dir, values: { top: answer, otherTop: other } },
      numbers: keys,
      signature: `${keys.join(',')}|${node.key}|${dir}`,
      answer,
      wrong: [
        { value: other, misconception: 'M-ROTATION-DIRECTION' },
        { value: node.key, misconception: 'M-ROOT-STAYS' },
      ],
    }
  },
}

export const rotationsNeeded: Kind = {
  type: 'choice',
  misconceptions: ['M-SINGLE-FOR-BENT', 'M-ALWAYS-DOUBLE'],
  build(seed) {
    const p = problem(seed)
    const count = p.hint.rotations.length
    const one = count === 1
    const other = one ? count + 1 : count - 1
    const b = base(p, { other })
    return { ...b, answer: count, wrong: [{ value: other, misconception: one ? 'M-ALWAYS-DOUBLE' : 'M-SINGLE-FOR-BENT' }] }
  },
}

export const lowestUnbalanced: Kind = {
  type: 'choice',
  misconceptions: ['M-HIGHEST-UNBALANCED', 'M-IN-RANGE-PICKED'],
  build(seed) {
    const p = deepProblem(seed)
    const { z } = p.hint
    const path = pathTo(p.after, p.key)
    const at = path.indexOf(z)
    const others = path
      .map((k, i) => ({ k, d: Math.abs(i - at) }))
      .filter((o) => o.k !== z)
      .sort((a, b) => a.d - b.d)
      .slice(0, LOWEST_OPTIONS - 1)
      .map((o) => o.k)
    const balances = Object.fromEntries(path.map((k) => [`bf:${k}`, p.bf(k)]))
    const b = base(p, balances)
    return {
      ...b,
      answer: z,
      wrong: others.map((k): WrongValue => ({ value: k, misconception: isOutOfBalance(p.bf(k)) ? 'M-HIGHEST-UNBALANCED' : 'M-IN-RANGE-PICKED' })),
    }
  },
}

/** The (z leans left, y leans left) pair the engine's case stands for. */
function leans(c: RebalanceCase): [boolean, boolean] {
  for (const zl of [true, false]) for (const yl of [true, false]) if (caseFor(zl, yl) === c) return [zl, yl]
  throw new RangeError(`unknown case ${c}`)
}

export const rebalanceCase: Kind = {
  type: 'choice',
  misconceptions: ['M-BF-SIGN', 'M-SINGLE-FOR-BENT', 'M-ALWAYS-DOUBLE'],
  build(seed) {
    const p = problem(seed)
    const c = p.hint.case
    const [zl, yl] = leans(c)
    const bent = zl !== yl
    const wrong: WrongValue[] = [
      { value: caseFor(!zl, !yl), misconception: 'M-BF-SIGN' },
      bent ? { value: caseFor(zl, zl), misconception: 'M-SINGLE-FOR-BENT' } : { value: caseFor(zl, !zl), misconception: 'M-ALWAYS-DOUBLE' },
    ]
    if (!wrong.every((x) => REBALANCE_CASES.includes(x.value as RebalanceCase))) throw new RangeError('case outside the conventions')
    return { ...base(p), answer: c, wrong }
  },
}

export const insertFinalTree: Kind = {
  type: 'tree',
  misconceptions: ['M-FORGETS-REBALANCE', 'M-SINGLE-FOR-BENT', 'M-ROTATION-DIRECTION', 'M-HIGHEST-UNBALANCED'],
  build(seed) {
    const p = deepProblem(seed)
    const { trace, tree } = avlInsertTrace(p.base, p.key)
    const { z } = p.hint
    const zl = p.bf(z) > 0
    const toward = zl ? rotateRight : rotateLeft
    const away = zl ? rotateLeft : rotateRight
    const wrong: WrongValue[] = [{ value: p.after, misconception: 'M-FORGETS-REBALANCE' }]
    if (p.hint.rotations.length === 2) wrong.push({ value: replaceAt(p.after, z, toward), misconception: 'M-SINGLE-FOR-BENT' })
    wrong.push({ value: replaceAt(p.after, z, away), misconception: 'M-ROTATION-DIRECTION' })
    const higher = pathTo(p.after, z).filter((k) => isOutOfBalance(p.bf(k)))
    if (higher.length > 0) {
      const a = higher[higher.length - 1]
      wrong.push({ value: replaceAt(p.after, a, (t) => rebalance(t).tree), misconception: 'M-HIGHEST-UNBALANCED' })
    }
    return { ...base(p), answer: tree, wrong, trace }
  },
}
