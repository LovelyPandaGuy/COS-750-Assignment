import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { avlInsertTrace } from '../../src/engine/avl'
import { insert, remove } from '../../src/engine/bst'
import { rotateLeft, rotateRight } from '../../src/engine/rotations'
import { balanceFactorOf, replaceAt, subtreeAt, type Key, type Tree } from '../../src/engine/tree'
import { attemptPolicy, attemptRecord } from '../../src/assessment/attempt'
import { instantiate } from '../../src/assessment/instantiate'
import { KINDS } from '../../src/assessment/kinds'
import { mark } from '../../src/assessment/mark'
import type { BankItem, Instance } from '../../src/assessment/types'
import { validateItems } from '../../src/assessment/validate'
import { CHECKS } from '../../src/content/questions/checks'
import { PRACTICE_HINTS, RETRY_CAP } from '../../src/modules/config'
import { freshLearnerState, parseLearnerState } from '../../src/state/learnerState'
import { SEEDS, engineAnswer, plain, sameShape } from './helpers'

// Spec: add-question-model-and-bank / question-model.
// Requirement IDs: FR-ASM-02, FR-ASM-03, FR-ASM-04, FR-ASM-07, FR-SCA-03, D9, D19, D21.

const bfItem: BankItem = {
  id: 'fx-bf',
  module: 'C3',
  kind: 'balance-factor',
  outcome: 'LO3',
  subSkill: 'compute-balance-factor',
  level: 'apply',
  stem: (f) => `What is the balance factor of node ${f.target}?`,
  why: {
    correct: (_f, w) => `${w.formula}.`,
    other: () => 'Compare the heights of the two subtrees.',
    'M-BF-SIGN': (_f, w) => `${w.formula}.`,
    'M-EMPTY-HEIGHT': (_f, w) => w.heightRule,
  },
}

const fixture = (patch: Partial<BankItem>): BankItem => ({ ...bfItem, ...patch })
const choiceItems = CHECKS.filter((i) => KINDS[i.kind].type === 'choice')
const byKind = (kind: string) => CHECKS.find((i) => i.kind === kind)!

/** Keys of a tree in pre-order: inserting them into a plain BST rebuilds the same shape. */
const preorder = (t: Tree): Key[] => (t === null ? [] : [t.key, ...preorder(t.left), ...preorder(t.right)])

describe('FR-ASM-02 every item is tagged', () => {
  it('complete tags pass', () => {
    expect(validateItems([bfItem]).filter((p) => p.kind === 'tag')).toEqual([])
  })

  it.each([
    ['no sub-skill', { subSkill: '' }, 'subSkill'],
    ['unknown level', { level: 'evaluate' as never }, 'level'],
    ['outcome outside LO1 to LO9', { outcome: 'LO10' as never }, 'outcome'],
    ['sub-skill of another outcome', { subSkill: 'choose-structure' }, 'subSkill'],
  ])('%s fails', (_name, patch, tag) => {
    const problems = validateItems([fixture(patch)]).filter((p) => p.kind === 'tag')
    expect(problems.length).toBeGreaterThan(0)
    expect(problems.some((p) => p.step === 'fx-bf' && p.message.includes(tag))).toBe(true)
  })
})

describe('FR-ASM-07 the engine builds every problem and answer', () => {
  it('deterministic', () => {
    for (const item of CHECKS) expect(instantiate(item, 17, 1), item.id).toEqual(instantiate(item, 17, 1))
  })

  it('every bank answer matches a direct engine call, seeds 0 to 99', () => {
    for (const item of CHECKS) {
      for (const seed of SEEDS) {
        const inst = instantiate(item, seed)
        const expected = engineAnswer(item.kind, inst)
        if (inst.type === 'tree') expect(sameShape(inst.answer as Tree, expected as Tree), `${item.id} seed ${seed}`).toBe(true)
        else expect(inst.answer, `${item.id} seed ${seed}`).toEqual(expected)
      }
    }
  })
})

describe('FR-ASM-07 D9 retries are new problems', () => {
  it('attempts 0, 1 and 2 each differ from the one before', () => {
    for (const item of CHECKS) {
      for (const seed of SEEDS) {
        const [a, b, c] = [0, 1, 2].map((n) => instantiate(item, seed, n))
        expect(b.signature, `${item.id} seed ${seed}`).not.toBe(a.signature)
        expect(c.signature, `${item.id} seed ${seed}`).not.toBe(b.signature)
      }
    }
  })

  it('choice options reshuffle: the correct option moves, and there is still exactly one', () => {
    for (const item of choiceItems) {
      let moved = 0
      for (const seed of SEEDS) {
        const [a, b] = [instantiate(item, seed, 0), instantiate(item, seed, 1)]
        expect(b.options!.filter((o) => o.correct)).toHaveLength(1)
        if (a.options!.findIndex((o) => o.correct) !== b.options!.findIndex((o) => o.correct)) moved++
      }
      expect(moved, item.id).toBeGreaterThan(50)
    }
  })
})

describe('FR-ASM-02 FR-ASM-03 choice options', () => {
  it('wrong options are tagged and explained; texts are distinct', () => {
    for (const item of choiceItems) {
      for (const seed of SEEDS) {
        const opts = instantiate(item, seed).options!
        expect(opts.length, item.id).toBeGreaterThanOrEqual(2)
        expect(new Set(opts.map((o) => o.text)).size, `${item.id} seed ${seed}`).toBe(opts.length)
        for (const o of opts) {
          expect(o.explanation.trim().length, `${item.id} ${o.id}`).toBeGreaterThan(0)
          if (!o.correct) expect(o.misconceptionId, `${item.id} ${o.id}`).toMatch(/^M-/)
        }
      }
    }
  })

  it('marking a choice by ID works after a reshuffle', () => {
    const inst = instantiate(byKind('rebalance-case'), 3, 1)
    for (const o of inst.options!) {
      const m = mark(inst, { choice: o.id })
      expect(m.status).toBe(o.correct ? 'correct' : 'not-yet')
      expect(m.explanation).toBe(o.explanation)
      expect(m.misconceptionId).toBe(o.correct ? undefined : o.misconceptionId)
    }
  })

  it('option IDs depend on the value, not the position', () => {
    const inst = instantiate(byKind('rebalance-case'), 3, 0)
    for (const o of inst.options!) expect(o.id).toBe(`opt-${String(o.value)}`)
  })
})

describe('FR-ASM-03 number answers', () => {
  it('the sign slip is recognised, typed as +n, -n or −n', () => {
    for (const seed of SEEDS.slice(0, 20)) {
      const inst = instantiate(bfItem, seed)
      const answer = inst.answer as number
      expect(answer).not.toBe(0)
      const slip = -answer
      for (const typed of [String(slip), slip > 0 ? `+${slip}` : `−${-slip}`]) {
        const m = mark(inst, { number: typed })
        expect(m.status).toBe('not-yet')
        expect(m.misconceptionId).toBe('M-BF-SIGN')
        expect(m.explanation.length).toBeGreaterThan(0)
      }
      expect(mark(inst, { number: answer > 0 ? `+${answer}` : String(answer) }).status).toBe('correct')
    }
  })

  it('any other wrong number gets the general explanation and no tag', () => {
    const inst = instantiate(bfItem, 4)
    const m = mark(inst, { number: '57' })
    expect(m).toMatchObject({ status: 'not-yet', explanation: 'Compare the heights of the two subtrees.' })
    expect(m.misconceptionId).toBeUndefined()
  })

  it('unreadable input is not wrong, and records nothing', () => {
    const inst = instantiate(bfItem, 4)
    for (const typed of ['two', '']) {
      const m = mark(inst, { number: typed })
      expect(m.status).toBe('unreadable')
      expect(attemptRecord(inst, { number: typed }, m, { hintsUsed: 0, at: '2026-11-12T10:00:00.000Z' })).toBeNull()
    }
  })
})

describe('FR-ASM-04 tree answers mark by structure', () => {
  const treeItem = byKind('insert-final-tree')
  const base = (inst: Instance) => inst.facts.tree
  const key = (inst: Instance) => inst.facts.target as Key
  const double = SEEDS.map((s) => instantiate(treeItem, s)).find(
    (i) => avlInsertTrace(base(i), key(i)).trace.filter((s) => s.kind === 'rotation').length === 2,
  )!

  it('a separately built tree with the same keys and shape is accepted', () => {
    for (const seed of SEEDS.slice(0, 20)) {
      const inst = instantiate(treeItem, seed)
      const rebuilt = plain(preorder(inst.answer as Tree))
      expect(mark(inst, { tree: rebuilt }).status).toBe('correct')
    }
  })

  it('stopped before rebalancing: names the first rotation and the forgot-to-rebalance tag', () => {
    const inst = instantiate(treeItem, 5)
    const m = mark(inst, { tree: insert(base(inst), key(inst)).tree })
    expect(m.status).toBe('not-yet')
    expect(m.divergedKind).toBe('rotation')
    expect(inst.trace![m.divergedAt!].kind).toBe('rotation')
    expect(inst.trace!.findIndex((s) => s.kind === 'rotation')).toBe(m.divergedAt)
    expect(m.misconceptionId).toBe('M-FORGETS-REBALANCE')
  })

  it('one rotation for a bent shape', () => {
    expect(double).toBeDefined()
    const plainAfter = insert(base(double), key(double)).tree
    const z = avlInsertTrace(base(double), key(double)).trace.find((s) => s.kind === 'imbalance')!.nodes[0]
    const toward = balanceFactorOf(subtreeAt(plainAfter, z)) > 0 ? rotateRight : rotateLeft
    const m = mark(double, { tree: replaceAt(plainAfter, z, toward) })
    expect(m.status).toBe('not-yet')
    expect(m.misconceptionId).toBe('M-SINGLE-FOR-BENT')
  })

  it('keys lost or added: names the insert step', () => {
    const inst = instantiate(treeItem, 8)
    const answer = inst.answer as Tree
    const m = mark(inst, { tree: remove(answer, key(inst)).tree })
    expect(m.status).toBe('not-yet')
    expect(m.divergedKind).toBe('insert')
  })
})

describe('D21 FR-SCA-03 attempt policy', () => {
  it('check: cap 3, ladder hints', () => {
    expect(attemptPolicy('check')).toEqual({ retryCap: 3, hints: 'ladder' })
  })

  it('practice: no cap, 2 hints, then review', () => {
    expect(attemptPolicy('practice')).toEqual({ retryCap: null, hints: 2, afterHints: 'offer-review' })
  })

  it('the numbers live in the config only', () => {
    expect([RETRY_CAP, PRACTICE_HINTS]).toEqual([3, 2])
    const src = readFileSync('src/assessment/attempt.ts', 'utf8').replace(/\/\/.*$/gm, '')
    expect(src).not.toMatch(/\b[23]\b/)
  })
})

describe('FR-ASM-05 D21 attempt record', () => {
  it('records hints, confidence and the misconception, and passes the learner-state validator', () => {
    const inst = instantiate(byKind('rebalance-case'), 9)
    const wrong = inst.options!.find((o) => !o.correct)!
    const m = mark(inst, { choice: wrong.id })
    const rec = attemptRecord(inst, { choice: wrong.id }, m, { hintsUsed: 1, confidence: 'sure', at: '2026-11-12T10:00:00.000Z' })!
    expect(rec).toMatchObject({ questionId: inst.itemId, correct: false, misconceptionId: wrong.misconceptionId, hintsUsed: 1, confidence: 'sure' })
    const state = parseLearnerState(JSON.parse(JSON.stringify({ ...freshLearnerState('p'), attempts: [rec] })))
    expect(state?.attempts).toHaveLength(1)
  })
})

describe('FR-ASM-02 D19 bank validator', () => {
  it('a typed case name is caught', () => {
    const item = fixture({ why: { ...bfItem.why, correct: () => 'This one needs the LR fix.' } })
    expect(validateItems([item], { seeds: [0] }).some((p) => p.kind === 'wording' && p.step === 'fx-bf')).toBe(true)
  })

  it('an invented number is caught', () => {
    const item = fixture({ stem: (f) => `Node ${f.target} sits in a tree of 12345 nodes. What is its balance factor?` })
    expect(validateItems([item], { seeds: [0] }).some((p) => p.kind === 'number' && p.value === 12345)).toBe(true)
  })

  it('a misconception the kind can produce but the item does not explain is caught', () => {
    const why = Object.fromEntries(Object.entries(bfItem.why).filter(([k]) => k !== 'M-EMPTY-HEIGHT'))
    expect(validateItems([fixture({ why })], { seeds: [0] }).some((p) => p.kind === 'misconception')).toBe(true)
  })

  it('never throws on a broken item', () => {
    expect(() => validateItems([fixture({ kind: 'no-such-kind' as never })], { seeds: [0] })).not.toThrow()
  })
})
