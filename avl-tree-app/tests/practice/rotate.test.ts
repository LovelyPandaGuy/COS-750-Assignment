import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { analyseTree } from '../../src/engine/analyse'
import { insert } from '../../src/engine/bst'
import { balanceFactorOf, makeNode, subtreeAt, type Key, type Tree } from '../../src/engine/tree'
import {
  initPractice,
  inOrder,
  practiceReducer,
  rotateAt,
  rotationFeedback,
  rotationsNeeded,
  startTree,
  type PracticeState,
} from '../../src/practice/rotate'

// Spec: add-predict-and-do-it-yourself / do-it-yourself. Requirement IDs: FR-VIS-06, FR-ENG-04, NFR-08. Outcome: LO6.

const leaf = (k: Key) => makeNode(k, null, null)
const T1 = makeNode(30, leaf(20), null)
const T2 = makeNode(30, leaf(10), null)
const T3 = makeNode(40, makeNode(20, leaf(10), null), leaf(60))
const BAL = makeNode(20, leaf(10), leaf(30))
const CHAIN = startTree(T1, 10) // 30, 20, 10 in a left chain
const CHAIN5 = startTree(T3, 5) // 40 (left 20 with chain 10, 5; right 60)
const LR = startTree(T2, 20) // 30 with left 10 whose right is 20

const rot = (tree: Tree, key: Key, dir: 'left' | 'right'): Tree => {
  const r = rotateAt(tree, key, dir)
  if (!r.ok) throw new Error('refused')
  return r.tree
}
const shape = (t: Tree): unknown => (t === null ? null : [t.key, shape(t.left), shape(t.right)])

describe('FR-VIS-06 practice starts from the unbalanced tree', () => {
  it('is the plain BST insert, before any rebalancing', () => {
    expect(shape(CHAIN)).toEqual([30, [20, [10, null, null], null], null])
    expect(balanceFactorOf(CHAIN)).toBe(2)
    expect(analyseTree(CHAIN).heightMismatches).toEqual([])
    expect(insert(T3, 5).tree).toEqual(CHAIN5)
  })

  it('needs one rotation for LL and RR, two for LR and RL, none when balanced', () => {
    expect(rotationsNeeded(T1, 10)).toBe(1)
    expect(rotationsNeeded(makeNode(10, null, leaf(20)), 30)).toBe(1) // RR
    expect(rotationsNeeded(T2, 20)).toBe(2)
    expect(rotationsNeeded(makeNode(10, null, leaf(30)), 20)).toBe(2) // RL
    expect(rotationsNeeded(BAL, 5)).toBe(0)
  })
})

describe('FR-VIS-06 / FR-ENG-04 student-performed rotation', () => {
  it('valid rotation below the root fixes heights up to the root', () => {
    const t = rot(CHAIN5, 20, 'right')
    expect(shape(t)).toEqual([40, [10, [5, null, null], [20, null, null]], [60, null, null]])
    const h = (k: Key) => subtreeAt(t, k)!.height
    expect([h(5), h(20), h(10), h(60), h(40)]).toEqual([0, 0, 1, 0, 2])
  })

  it('refuses a rotation with no child to lift, naming the node and side', () => {
    const r = rotateAt(CHAIN, 30, 'left')
    expect(r).toMatchObject({ ok: false, reason: 'no-child', node: 30, side: 'right' })
    expect(rotateAt(CHAIN, 10, 'right')).toMatchObject({ ok: false, reason: 'no-child', node: 10, side: 'left' })
  })

  it('refuses a key that is not in the tree', () => {
    expect(rotateAt(CHAIN, 99, 'left')).toMatchObject({ ok: false, reason: 'no-node', node: 99 })
  })

  it('keeps order and heights for any rotation, and refusals return the same tree', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { minLength: 1, maxLength: 15 }),
        fc.nat(),
        fc.boolean(),
        (keys, pick, left) => {
          const tree = keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
          const key = keys[pick % keys.length]
          const r = rotateAt(tree, key, left ? 'left' : 'right')
          if (r.ok) {
            expect(inOrder(r.tree)).toEqual(inOrder(tree))
            expect(analyseTree(r.tree).heightMismatches).toEqual([])
            expect(analyseTree(r.tree).isBst).toBe(true)
          } else {
            expect(r.reason).toBe('no-child')
          }
        },
      ),
    )
    const refused = rotateAt(CHAIN, 30, 'left')
    expect(refused.ok).toBe(false)
  })

  it('returns the same tree object when refused', () => {
    const r = rotateAt(CHAIN, 30, 'left') as { ok: false; tree: Tree }
    expect(r.tree).toBe(CHAIN)
  })
})

describe('FR-VIS-06 feedback on a rotation', () => {
  it('balanced', () => {
    const after = rot(CHAIN, 30, 'right')
    expect(shape(after)).toEqual([20, [10, null, null], [30, null, null]])
    expect(rotationFeedback(CHAIN, 30, 'right', after)).toEqual({ kind: 'balanced' })
  })

  it('balanced by another rotation, whichever node was rotated', () => {
    const after = rot(CHAIN5, 40, 'right')
    expect(analyseTree(after).isAvl).toBe(true)
    expect(rotationFeedback(CHAIN5, 40, 'right', after)).toEqual({ kind: 'balanced' })
  })

  it('leans the other way', () => {
    const after = rot(LR, 30, 'right')
    expect(rotationFeedback(LR, 30, 'right', after)).toEqual({ kind: 'flipped', node: 10, balanceFactor: -2 })
  })

  it('still unbalanced names the lowest node out of balance', () => {
    const after = rot(CHAIN, 20, 'right')
    expect(rotationFeedback(CHAIN, 20, 'right', after)).toEqual({ kind: 'unbalanced', node: 30, balanceFactor: 2 })
  })

  it('double rotation in two steps', () => {
    const first = rot(LR, 10, 'left')
    expect(rotationFeedback(LR, 10, 'left', first)).toEqual({ kind: 'unbalanced', node: 30, balanceFactor: 2 })
    const second = rot(first, 30, 'right')
    expect(rotationFeedback(first, 30, 'right', second)).toEqual({ kind: 'balanced' })
  })
})

describe('LO6 in-order strip', () => {
  it('lists the keys in order', () => {
    expect(inOrder(CHAIN5)).toEqual([5, 10, 20, 40, 60])
    expect(inOrder(null)).toEqual([])
  })
})

describe('FR-VIS-06 practice history: select, rotate, undo, reset', () => {
  const sel = (s: PracticeState, key: Key) => practiceReducer(s, { type: 'select', key })
  const go = (s: PracticeState, dir: 'left' | 'right') => practiceReducer(s, { type: 'rotate', dir })

  it('starts with no history, selection or feedback', () => {
    const s = initPractice(CHAIN)
    expect(s).toMatchObject({ tree: CHAIN, history: [], selected: null, feedback: null })
  })

  it('a rotation records history, clears the selection and sets feedback', () => {
    const s = go(sel(initPractice(CHAIN), 30), 'right')
    expect(s.history).toEqual([CHAIN])
    expect(s.selected).toBeNull()
    expect(s.feedback).toEqual({ kind: 'balanced' })
    expect(shape(s.tree)).toEqual([20, [10, null, null], [30, null, null]])
  })

  it('a refused rotation adds no history, keeps the tree and reports the refusal', () => {
    const s = go(sel(initPractice(CHAIN), 30), 'left')
    expect(s.history).toEqual([])
    expect(s.tree).toBe(CHAIN)
    expect(s.feedback).toMatchObject({ kind: 'refused', node: 30, side: 'right' })
  })

  it('rotating with nothing selected does nothing', () => {
    const s0 = initPractice(CHAIN)
    expect(go(s0, 'right')).toEqual(s0)
  })

  it('undo restores exactly the previous tree and clears feedback', () => {
    const s1 = go(sel(initPractice(CHAIN), 30), 'right')
    const s2 = practiceReducer(s1, { type: 'undo' })
    expect(s2.tree).toBe(CHAIN)
    expect(s2.history).toEqual([])
    expect(s2.feedback).toBeNull()
    expect(s2.selected).toBeNull()
  })

  it('undo with no history changes nothing', () => {
    const s0 = initPractice(CHAIN)
    expect(practiceReducer(s0, { type: 'undo' })).toEqual(s0)
  })

  it('three rotations then three undos return to the start tree', () => {
    let s = initPractice(CHAIN5)
    s = go(sel(s, 20), 'right')
    s = go(sel(s, 10), 'left')
    s = go(sel(s, 40), 'right')
    expect(s.history).toHaveLength(3)
    for (let i = 0; i < 3; i++) s = practiceReducer(s, { type: 'undo' })
    expect(s.tree).toBe(CHAIN5)
  })

  it('reset returns to the start tree and clears history, selection and feedback', () => {
    let s = initPractice(CHAIN)
    s = go(sel(s, 20), 'right')
    s = practiceReducer(sel(s, 30), { type: 'reset' })
    expect(s).toMatchObject({ tree: CHAIN, history: [], selected: null, feedback: null })
  })

  it('clear-selection drops the selection and leaves the tree', () => {
    const s = practiceReducer(sel(initPractice(CHAIN), 30), { type: 'clear-selection' })
    expect(s.selected).toBeNull()
    expect(s.tree).toBe(CHAIN)
  })

  it('the in-order sequence is the same after every action', () => {
    fc.assert(
      fc.property(fc.array(fc.tuple(fc.constantFrom(40, 20, 10, 5, 60), fc.boolean()), { maxLength: 8 }), (moves) => {
        let s = initPractice(CHAIN5)
        for (const [key, left] of moves) {
          s = go(sel(s, key), left ? 'left' : 'right')
          expect(inOrder(s.tree)).toEqual([5, 10, 20, 40, 60])
        }
        s = practiceReducer(s, { type: 'undo' })
        expect(inOrder(s.tree)).toEqual([5, 10, 20, 40, 60])
      }),
    )
  })
})
