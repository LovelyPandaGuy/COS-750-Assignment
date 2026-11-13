import { describe, it, expect } from 'vitest'
import { instantiate } from '../../src/assessment/instantiate'
import { validateBank } from '../../src/assessment/validate'
import { confidentErrors, firstPassDone, lectureList, outcomeStatus, readinessComplete, recycleItems, summaryText } from '../../src/assessment/readiness'
import { lectureQuestionFor } from '../../src/assessment/scaffold'
import { checkSeed } from '../../src/assessment/session'
import { ALL_ITEMS } from '../../src/content/questions/bank'
import { READINESS, PRIMARY_ITEM } from '../../src/content/questions/readiness'
import { MISCONCEPTIONS } from '../../src/content/questions/misconceptions'
import { SCAFFOLDS } from '../../src/content/questions/scaffolds'
import { LO_IDS } from '../../src/assessment/ids'
import { avl, plain } from '../../src/assessment/kinds/shared'
import { maxAvlHeight } from '../../src/modules/facts'
import { searchTrace } from '../../src/engine/search'
import type { Attempt } from '../../src/state/learnerState'
import { SEEDS, engineAnswer } from './helpers'

// Spec: add-readiness-c9 / readiness-check, readiness-summary, question-bank.
// Requirement IDs: FR-ASM-06, FR-RDY-01, FR-RDY-02, FR-RDY-03, D4, D8, D13, D14.

const at = '2026-11-13T10:00:00.000Z'
const att = (questionId: string, correct: boolean, extra: Partial<Attempt> = {}): Attempt => ({ questionId, at, answer: 'x', correct, hintsUsed: 0, ...extra })
const item = (id: string) => ALL_ITEMS.find((i) => i.id === id)!
const state = (s: ReturnType<typeof outcomeStatus>, lo: string) => s.find((o) => o.outcome === lo)!.state

describe('FR-ASM-06 the eleven C9 items', () => {
  it('eleven, covering LO1 to LO9, only LO8 optional, one primary item per outcome', () => {
    expect(READINESS).toHaveLength(11)
    for (const i of READINESS) expect(i.module).toBe('C9')
    expect(new Set(READINESS.map((i) => i.outcome))).toEqual(new Set(LO_IDS))
    expect(READINESS.filter((i) => i.optional).map((i) => i.outcome)).toEqual(['LO8'])
    for (const lo of LO_IDS) expect(item(PRIMARY_ITEM[lo]).outcome).toBe(lo)
  })
  it('the whole bank validates with C9 at eleven', () => {
    expect(validateBank(ALL_ITEMS)).toEqual([])
  }, 30_000)
  it('the reused kinds answer as the engine does', () => {
    for (const i of READINESS.filter((x) => !['search-bound', 'avl-build-root', 'build-and-search', 'scenario-choice'].includes(x.kind))) {
      for (const seed of SEEDS.slice(0, 40)) {
        const inst = instantiate(i, seed)
        expect(inst.answer, `${i.id} ${seed}`).toEqual(engineAnswer(i.kind, inst))
      }
    }
  })
  it('search-bound: the AVL height bound plus one; wrong values are n and a perfect tree', () => {
    for (const seed of SEEDS) {
      const inst = instantiate(READINESS.find((i) => i.kind === 'search-bound')!, seed)
      const n = inst.facts.values.n
      expect(inst.answer).toBe(maxAvlHeight(n) + 1)
      expect(inst.options!.map((o) => o.value)).toContain(n)
    }
  })
  it('avl-build-root and build-and-search come from the engine', () => {
    for (const seed of SEEDS) {
      const r = instantiate(READINESS.find((i) => i.kind === 'avl-build-root')!, seed)
      expect(r.answer).toBe(avl(r.facts.keys)!.key)
      expect(r.answer).not.toBe(plain(r.facts.keys)!.key)
      const s = instantiate(READINESS.find((i) => i.kind === 'build-and-search')!, seed)
      expect(s.answer).toBe(searchTrace(avl(s.facts.keys), s.facts.target!).steps)
    }
  })
  it('the new misconception is catalogued with a hint and a lecture question', () => {
    expect(MISCONCEPTIONS['M-AVL-WORST-LINEAR']).toBeDefined()
    expect(SCAFFOLDS.hints['M-AVL-WORST-LINEAR']).toBeTypeOf('function')
    expect(SCAFFOLDS.lecture['M-AVL-WORST-LINEAR']).toBeTypeOf('function')
  })
})

describe('FR-RDY-01 outcome status', () => {
  it('Ready when the latest attempt at each tried sub-skill is right; Revise otherwise; LO8 not tried', () => {
    const s = outcomeStatus([att('chk3-height', true), att('chk3-bf', true), att('chk3-bf', false)])
    expect(state(s, 'LO2')).toBe('ready')
    expect(state(s, 'LO3')).toBe('revise')
    expect(state(s, 'LO1')).toBe('revise')
    expect(state(s, 'LO8')).toBe('not-tried')
  })
  it('a later right answer makes it Ready', () => {
    expect(state(outcomeStatus([att('chk3-bf', false), att('r-lo3', true)]), 'LO3')).toBe('ready')
  })
  it('confident errors flag their outcome only', () => {
    const flags = confidentErrors([att('chk3-bf', false, { confidence: 'sure' }), att('chk3-height', false, { confidence: 'unsure' }), att('chk2-height', true, { confidence: 'sure' })])
    expect([...flags]).toEqual(['LO3'])
  })
})

describe('FR-RDY-02 the bring-to-the-lecture list', () => {
  const profile = 'p1'
  const q = (id: string, idx: number, mis: string) => lectureQuestionFor(item(id), instantiate(item(id), checkSeed(profile, id), idx), mis)
  it('lists an unresolved misconception, not a resolved one, and recorded questions, without duplicates', () => {
    const unresolved = [att('chk3-bf', false, { misconceptionId: 'M-BF-SIGN' })]
    expect(lectureList(unresolved, [], profile)).toEqual([q('chk3-bf', 0, 'M-BF-SIGN')])
    expect(lectureList([...unresolved, att('chk3-bf', true)], [], profile)).toEqual([])
    const recorded = [{ questionId: 'chk3-bf', text: q('chk3-bf', 0, 'M-BF-SIGN'), at }]
    expect(lectureList(unresolved, recorded, profile)).toEqual([q('chk3-bf', 0, 'M-BF-SIGN')])
    expect(lectureList([], [{ questionId: 'chk2-height', text: 'Why edges?', at }], profile)).toEqual(['Why edges?'])
  })
  it('is empty when nothing is unresolved', () => {
    expect(lectureList([att('chk3-bf', true)], [], profile)).toEqual([])
  })
})

describe('FR-RDY-03 the summary text', () => {
  it('holds statuses, the list and own questions, and no profile ID', () => {
    const text = summaryText({
      statuses: outcomeStatus([att('chk3-height', true)]),
      flags: new Set(['LO3'] as const),
      lecture: ['Why edges?'],
      own: ['Why rotate at the lowest node?'],
    })
    expect(text).toMatch(/LO2.*Ready/)
    expect(text).toMatch(/LO8.*Not tried/)
    expect(text).toContain('Why edges?')
    expect(text).toContain('Why rotate at the lowest node?')
    expect(text).not.toContain('profile')
  })
})

describe('D14 recycle and completion', () => {
  const firstPass = (wrongIds: string[] = []) =>
    READINESS.flatMap((i) => (wrongIds.includes(i.id) ? [att(i.id, false), att(i.id, false), att(i.id, false)] : [att(i.id, true)]))
  it('nothing until the first pass is done', () => {
    expect(firstPassDone(firstPass().slice(0, 5))).toBe(false)
    expect(recycleItems(firstPass().slice(0, 5))).toEqual([])
  })
  it('all right: no recycle, complete', () => {
    expect(recycleItems(firstPass())).toEqual([])
    expect(readinessComplete(firstPass())).toBe(true)
  })
  it('a capped outcome comes back once, after its first-pass attempts', () => {
    const a = firstPass(['r-lo3'])
    expect(recycleItems(a)).toEqual([{ itemId: 'r-lo3', since: 3 }])
    expect(readinessComplete(a)).toBe(false)
    const after = [...a, att('r-lo3', true)]
    expect(readinessComplete(after)).toBe(true)
    expect(recycleItems(after)).toEqual([{ itemId: 'r-lo3', since: 3 }])
  })
  it('the optional LO8 item is not required', () => {
    const a = firstPass().filter((x) => x.questionId !== PRIMARY_ITEM.LO8)
    expect(firstPassDone(a)).toBe(true)
    expect(readinessComplete(a)).toBe(true)
  })
})
