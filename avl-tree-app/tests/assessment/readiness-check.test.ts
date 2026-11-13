import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { instantiate } from '../../src/assessment/instantiate'
import { KINDS } from '../../src/assessment/kinds'
import { mark } from '../../src/assessment/mark'
import { itemSeed, readinessInstance, readinessStep, startReadiness, type ReadinessSession } from '../../src/assessment/readiness'
import type { BankItem, Instance, Response } from '../../src/assessment/types'
import { validateBank, validateReadinessBank } from '../../src/assessment/validate'
import { CHECKS } from '../../src/content/questions/checks'
import { READINESS } from '../../src/content/questions/readiness'
import { avlInsertTrace } from '../../src/engine/avl'
import type { Tree } from '../../src/engine/tree'
import { READINESS_RETURNS } from '../../src/modules/config'
import { SEEDS, avlOf, engineAnswer, plain, sameShape } from './helpers'

// Spec: add-readiness-c9 / readiness-check.
// Requirement IDs: FR-ASM-06, FR-ASM-07, FR-ASM-04, LO4, LO5, LO7, D4, D9, D14, D20.

const AT = '2026-11-13T12:00:00.000Z'
const LOS = ['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6', 'LO7', 'LO8', 'LO9']
const item = (id: string) => READINESS.find((i) => i.id === id)!
const build = () => READINESS.find((i) => i.combined && i.kind === 'build-avl')!
const search = () => READINESS.find((i) => i.combined && i.kind === 'search-built')!
const lo = (outcome: string) => READINESS.find((i) => i.outcome === outcome && !i.combined)!

type How = 'correct' | 'wrong' | 'unreadable'

function respond(inst: Instance, how: How): Response {
  if (how === 'unreadable') return { choice: 'opt-none' }
  if (inst.type === 'choice') return { choice: inst.options!.find((o) => o.correct === (how === 'correct'))!.id }
  if (inst.type === 'number') return { number: String(how === 'correct' ? (inst.answer as number) : (inst.answer as number) + 1) }
  return { tree: how === 'correct' ? (inst.answer as Tree) : null }
}

function answer(s: ReadinessSession, how: How) {
  return readinessStep(s, { type: 'answer', response: respond(readinessInstance(s)!, how), at: AT })
}

/** Answers correctly until the current item is `id`. */
function advanceTo(s: ReadinessSession, id: string): ReadinessSession {
  while (readinessInstance(s)!.itemId !== id) s = answer(s, 'correct').session
  return s
}

/** Rotations performed while inserting `keys` one by one into an empty AVL tree. */
function rotationsBuilding(keys: number[]): number {
  let t: Tree = null
  let n = 0
  for (const k of keys) {
    const r = avlInsertTrace(t, k)
    n += r.trace.filter((x) => x.kind === 'rotation').length
    t = r.tree
  }
  return n
}

describe('FR-ASM-06 one item per outcome and two combined items', () => {
  it('coverage', () => {
    for (const o of LOS) expect(READINESS.filter((i) => i.outcome === o && !i.combined), o).toHaveLength(1)
    const combined = READINESS.filter((i) => i.combined)
    expect(combined.map((i) => i.outcome).sort()).toEqual(['LO4', 'LO7'])
    expect(build().outcome).toBe('LO7')
    expect(search().outcome).toBe('LO4')
    for (const i of READINESS) expect(i.module).toBe('C9')
  })

  it('only LO8 is optional', () => {
    for (const i of READINESS) expect(i.optional === true, i.id).toBe(i.outcome === 'LO8' && !i.combined)
  })

  it('module checks are unchanged', () => {
    expect(CHECKS.filter((i) => i.module === 'C9')).toEqual([])
    expect(validateBank(CHECKS)).toEqual([])
  })
})

describe('FR-ASM-02 FR-ASM-03 the readiness bank is validated like the checks', () => {
  it('the readiness bank is clean', () => {
    expect(validateReadinessBank(READINESS)).toEqual([])
  })

  it('a missing outcome is caught', () => {
    const without = READINESS.filter((i) => i !== lo('LO5'))
    const problems = validateReadinessBank(without, { seeds: [0] })
    expect(problems.some((p) => p.kind === 'bank' && p.value === 'LO5')).toBe(true)
  })

  it('every answer comes from the engine', () => {
    for (const entry of READINESS) {
      for (const seed of SEEDS) {
        const inst = instantiate(entry, seed)
        const direct = engineAnswer(entry.kind, inst)
        if (KINDS[entry.kind].type === 'tree') expect(sameShape(inst.answer as Tree, direct as Tree)).toBe(true)
        else expect(inst.answer, `${entry.id} seed ${seed}`).toEqual(direct)
      }
    }
  })
})

describe('LO5 D13 worst-case search item', () => {
  it('engine worst cases', () => {
    for (const seed of SEEDS) {
      const inst = instantiate(lo('LO5'), seed)
      expect(inst.answer).toBe('plain-n-avl-log')
      expect(engineAnswer('worst-search', inst)).toBe('plain-n-avl-log')
      const correct = inst.options!.find((o) => o.correct)!
      expect(correct.text).toContain(String(inst.facts.values.n))
      expect(correct.text).toContain(String(inst.facts.values.avlWorst))
    }
  })

  it('wrong options are tagged', () => {
    for (const seed of SEEDS) {
      const tags = instantiate(lo('LO5'), seed).options!.filter((o) => !o.correct).map((o) => o.misconceptionId).sort()
      expect(tags).toEqual(['M-ASSUMES-BALANCED', 'M-SEARCH-VISITS-ALL'])
    }
  })
})

describe('LO7 LO4 FR-ASM-04 build, then search the same tree', () => {
  it('the build needs a rotation', () => {
    for (const seed of SEEDS) {
      const inst = instantiate(build(), seed)
      expect(rotationsBuilding(inst.facts.keys)).toBeGreaterThan(0)
      expect(sameShape(inst.answer as Tree, avlOf(inst.facts.keys))).toBe(true)
    }
  })

  it('a plain BST build is recognised', () => {
    for (const seed of SEEDS) {
      const inst = instantiate(build(), seed)
      const m = mark(inst, { tree: plain(inst.facts.keys) })
      expect(m.status).toBe('not-yet')
      expect(m.misconceptionId).toBe('M-FORGETS-REBALANCE')
    }
  })

  it('the search uses the built tree', () => {
    for (const seed of SEEDS) {
      const b = instantiate(build(), seed)
      const s = instantiate(search(), seed)
      expect(sameShape(s.facts.tree, b.answer as Tree)).toBe(true)
      expect(s.answer).toBe(engineAnswer('search-built', s))
    }
  })
})

describe('FR-ASM-06 the C9 session runs every item, then the returns', () => {
  it('every item once, in bank order, no returns when all correct', () => {
    let s = startReadiness(3)
    const seen: string[] = []
    for (let guard = 0; readinessInstance(s) !== null && guard < 50; guard++) {
      seen.push(readinessInstance(s)!.itemId)
      const r = answer(s, 'correct')
      expect(r.mark?.status).toBe('correct')
      expect(r.attempt).toMatchObject({ correct: true, hintsUsed: 0 })
      s = r.session
    }
    expect(seen).toEqual(READINESS.map((i) => i.id))
    expect(s.phase).toBe('done')
  })

  it('combined items share a seed', () => {
    const iBuild = READINESS.indexOf(build())
    const iSearch = READINESS.indexOf(search())
    for (const seed of SEEDS) {
      expect(itemSeed(seed, build(), iBuild)).toBe(itemSeed(seed, search(), iSearch))
      let s = advanceTo(startReadiness(seed), build().id)
      const built = readinessInstance(s)!
      s = answer(s, 'correct').session
      expect(sameShape(readinessInstance(s)!.facts.tree, built.answer as Tree)).toBe(true)
    }
  })

  it('unreadable input counts for nothing', () => {
    const numberItem = READINESS.find((i) => KINDS[i.kind].type === 'number')!
    const s = advanceTo(startReadiness(1), numberItem.id)
    const r = readinessStep(s, { type: 'answer', response: { number: 'two' }, at: AT })
    expect(r.session).toEqual(s)
    expect(r.attempt).toBeUndefined()
  })
})

describe('FR-ASM-06 FR-ASM-07 a missed item returns once as a new problem', () => {
  it('missed items come back at the end, in miss order, as attempt 1', () => {
    let s = startReadiness(5)
    const missed = [lo('LO2').id, lo('LO6').id]
    const first: Record<string, Instance> = {}
    for (let i = 0; i < READINESS.length; i++) {
      const inst = readinessInstance(s)!
      first[inst.itemId] = inst
      s = answer(s, missed.includes(inst.itemId) ? 'wrong' : 'correct').session
    }
    for (const id of missed) {
      const inst = readinessInstance(s)!
      expect(inst.itemId).toBe(id)
      expect(inst.attempt).toBe(1)
      expect(inst.signature).not.toBe(first[id].signature)
      s = answer(s, 'correct').session
    }
    expect(readinessInstance(s)).toBeNull()
    expect(s.phase).toBe('done')
  })

  it('each item returns only once, and the session always ends (property)', () => {
    const how = fc.constantFrom<How | 'skip'>('correct', 'wrong', 'wrong', 'unreadable', 'skip')
    fc.assert(
      fc.property(fc.nat(99), fc.array(how, { maxLength: 40 }), (seed, plan) => {
        let s = startReadiness(seed)
        const shown: Record<string, number> = {}
        let step = 0
        for (; readinessInstance(s) !== null && step < 200; step++) {
          const inst = readinessInstance(s)!
          const a = plan[step] ?? 'wrong'
          const r = a === 'skip' ? readinessStep(s, { type: 'skip' }) : answer(s, a)
          const moved = r.session !== s && JSON.stringify(r.session) !== JSON.stringify(s)
          if (moved) shown[inst.itemId] = (shown[inst.itemId] ?? 0) + 1
          s = r.session
        }
        expect(readinessInstance(s)).toBeNull()
        expect(s.phase).toBe('done')
        for (const n of Object.values(shown)) expect(n).toBeLessThanOrEqual(READINESS_RETURNS + 1)
      }),
      { numRuns: 100 },
    )
  })

  it('the number of returns is defined in the config only', () => {
    expect(READINESS_RETURNS).toBe(1)
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = join(dir, f)
        return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(p) ? [p] : []
      })
    const defining = files('src').filter((p) => /READINESS_RETURNS\s*=/.test(readFileSync(p, 'utf8')))
    expect(defining.map((p) => p.replace(/\\/g, '/'))).toEqual(['src/modules/config.ts'])
  })
})

describe('D4 D20 only the optional item may be skipped', () => {
  it('skip LO8: next item, no attempt, never returns', () => {
    const lo8 = lo('LO8')
    let s = advanceTo(startReadiness(2), lo8.id)
    const r = readinessStep(s, { type: 'skip' })
    expect(r.attempt).toBeUndefined()
    s = r.session
    expect(readinessInstance(s)!.itemId).toBe(READINESS[READINESS.indexOf(lo8) + 1].id)
    const later: string[] = []
    while (readinessInstance(s) !== null) {
      later.push(readinessInstance(s)!.itemId)
      s = answer(s, 'wrong').session
    }
    expect(later).not.toContain(lo8.id)
  })

  it('no skip elsewhere', () => {
    for (const entry of READINESS.filter((i: BankItem) => !i.optional)) {
      const s = advanceTo(startReadiness(4), entry.id)
      expect(readinessStep(s, { type: 'skip' }).session).toEqual(s)
    }
  })
})
