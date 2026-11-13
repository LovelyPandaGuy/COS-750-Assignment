import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { avlDelete, avlInsert } from '../../src/engine/avl'
import { remove } from '../../src/engine/bst'
import type { Tree } from '../../src/engine/tree'
import { needMisconception } from '../../src/assessment/ids'
import { instantiate } from '../../src/assessment/instantiate'
import { DELETE_FALLBACK, DELETE_ROOT_FALLBACK, KINDS } from '../../src/assessment/kinds'
import { validateBank } from '../../src/assessment/validate'
import { CHECKS } from '../../src/content/questions/checks'
import { ALL_ITEMS } from '../../src/content/questions/bank'
import { MISCONCEPTIONS } from '../../src/content/questions/misconceptions'
import { OUTCOMES } from '../../src/content/questions/outcomes'
import { SUB_SKILLS } from '../../src/content/questions/subSkills'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { NEED_IDS } from '../../src/modules/compare'
import { SEEDS } from './helpers'

// Spec: add-question-model-and-bank / question-bank.
// Requirement IDs: FR-ASM-01, FR-ASM-02, FR-ASM-03, D4, D15, D19, D27; LO1 to LO9.

const CHECK_MODULES = ['C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'] as const
const EXPECTED_OUTCOMES: Record<(typeof CHECK_MODULES)[number], string[]> = {
  C2: ['LO1'],
  C3: ['LO2', 'LO3'],
  C4: ['LO4'],
  C5: ['LO6'],
  C6: ['LO7'],
  C7: ['LO8'],
  C8: ['LO9'],
}

/** Every text an instance can show: stem, option texts, explanations. */
function texts(item: (typeof CHECKS)[number], seed: number, wording = conventionsWording()): string[] {
  const inst = instantiate(item, seed, 0, { wording })
  return [
    inst.stem,
    inst.correctExplanation,
    inst.otherExplanation ?? '',
    ...(inst.options ?? []).flatMap((o) => [o.text, o.explanation]),
    ...(inst.known ?? []).map((k) => k.explanation),
  ].filter((t) => t !== '')
}

describe('FR-ASM-01 D15 a check for each module from C2 to C8', () => {
  it('2 or 3 items per module, none for C1 or C9', () => {
    for (const m of CHECK_MODULES) {
      const n = CHECKS.filter((i) => i.module === m).length
      expect(n, m).toBeGreaterThanOrEqual(2)
      expect(n, m).toBeLessThanOrEqual(3)
    }
    expect(CHECKS.filter((i) => i.module === 'C1' || i.module === 'C9')).toEqual([])
  })

  it('each module covers its outcomes', () => {
    for (const m of CHECK_MODULES) {
      const got = new Set(CHECKS.filter((i) => i.module === m).map((i) => i.outcome))
      expect([...got].sort(), m).toEqual(EXPECTED_OUTCOMES[m])
    }
  })

  it('D4 C7 items are optional and no others are', () => {
    for (const i of CHECKS) expect(i.optional === true, i.id).toBe(i.module === 'C7')
  })

  it('item IDs are unique', () => {
    expect(new Set(CHECKS.map((i) => i.id)).size).toBe(CHECKS.length)
  })
})

describe('FR-ASM-01 item kinds', () => {
  it('the plan’s five kinds are present', () => {
    const has = (kind: string, type: string) => CHECKS.some((i) => i.kind === kind && KINDS[i.kind].type === type)
    expect(has('balance-factor', 'number')).toBe(true)
    expect(has('rebalance-case', 'choice')).toBe(true)
    expect(has('insert-final-tree', 'tree')).toBe(true)
    expect(has('scenario-choice', 'choice')).toBe(true)
    const otherChoice = CHECKS.filter((i) => KINDS[i.kind].type === 'choice' && !['rebalance-case', 'scenario-choice'].includes(i.kind))
    expect(otherChoice.length).toBeGreaterThan(0)
  })

  it('every item instantiates for seeds 0 to 99', () => {
    for (const item of CHECKS) for (const seed of SEEDS) expect(() => instantiate(item, seed), `${item.id} ${seed}`).not.toThrow()
  })
})

describe('FR-ASM-02 outcomes and Bloom levels come from the ID', () => {
  it('levels match the ID', () => {
    const levels = Object.fromEntries(Object.entries(OUTCOMES).map(([lo, o]) => [lo, [...o.levels]]))
    expect(levels).toEqual({
      LO1: ['understand'],
      LO2: ['remember'],
      LO3: ['apply'],
      LO4: ['apply'],
      LO5: ['understand'],
      LO6: ['apply'],
      LO7: ['apply', 'analyse'],
      LO8: ['apply'],
      LO9: ['analyse'],
      PRE: ['remember', 'understand'],
    })
    for (const [lo, o] of Object.entries(OUTCOMES)) expect(o.source, lo).toBe(lo === 'PRE' ? 'beyond ID' : 'ID')
  })

  it('each item level fits its outcome', () => {
    for (const i of CHECKS) expect(OUTCOMES[i.outcome].levels, i.id).toContain(i.level)
  })
})

describe('FR-SCA-01 sub-skills', () => {
  it('every sub-skill names one outcome and is used or reserved', () => {
    const used = new Set(ALL_ITEMS.map((i) => i.subSkill))
    expect(Object.keys(SUB_SKILLS)).toHaveLength(18)
    for (const [id, s] of Object.entries(SUB_SKILLS)) {
      expect(Object.keys(OUTCOMES), id).toContain(s.outcome)
      expect(used.has(id) || s.reserved !== undefined, id).toBe(true)
    }
  })
})

describe('FR-ASM-02 FR-ASM-03 misconception catalogue', () => {
  const produced = new Set<string>()
  for (const item of ALL_ITEMS) {
    for (const seed of SEEDS) {
      const inst = instantiate(item, seed)
      for (const o of inst.options ?? []) if (o.misconceptionId) produced.add(o.misconceptionId)
      for (const k of inst.known ?? []) produced.add(k.misconception)
    }
  }

  it('catalogue and bank agree over seeds 0 to 99', () => {
    for (const m of produced) expect(Object.keys(MISCONCEPTIONS), m).toContain(m)
    for (const m of Object.keys(MISCONCEPTIONS)) expect(produced.has(m), m).toBe(true)
  })

  it('24 drafted entries plus one tag per need, all flagged beyond ID', () => {
    const needTags = NEED_IDS.map(needMisconception)
    expect(new Set(needTags).size).toBe(NEED_IDS.length)
    for (const t of needTags) expect(Object.keys(MISCONCEPTIONS)).toContain(t)
    expect(Object.keys(MISCONCEPTIONS)).toHaveLength(24 + NEED_IDS.length)
    for (const [id, m] of Object.entries(MISCONCEPTIONS)) {
      expect(m.source, id).toBe('beyond ID')
      expect(m.label.trim().length, id).toBeGreaterThan(0)
    }
  })
})

describe('D27 D19 explanations', () => {
  it('neutral wording: no "wrong", "fail" or "incorrect"', () => {
    for (const item of CHECKS) {
      for (const seed of SEEDS.slice(0, 30)) {
        for (const t of texts(item, seed)) expect(t, item.id).not.toMatch(/\b(?:wrong|fail\w*|incorrect)\b/i)
      }
    }
    for (const m of Object.values(MISCONCEPTIONS)) expect(m.label).not.toMatch(/\b(?:wrong|fail\w*|incorrect)\b/i)
  })

  it('a reversed conventions order flows into the balance-factor explanations', () => {
    const reversed = conventionsWording(['right', 'left'])
    const item = CHECKS.find((i) => i.kind === 'balance-factor')!
    expect(texts(item, 2, reversed).join(' ')).toContain(reversed.formula)
    for (const f of readdirSync('src/content/questions')) {
      expect(readFileSync(`src/content/questions/${f}`, 'utf8'), f).not.toMatch(/height of the (?:left|right) subtree\s*[−-]/)
    }
  })
})

describe('C7 delete fallbacks (hand-checked)', () => {
  const avl = (keys: readonly number[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

  it('the two-rebalance fallback needs two rebalances', () => {
    expect(avlDelete(avl(DELETE_FALLBACK.keys), DELETE_FALLBACK.key).rebalances).toHaveLength(2)
  })

  it('the root fallback changes the root, unlike a plain delete', () => {
    const t = avl(DELETE_ROOT_FALLBACK.keys)
    expect(avlDelete(t, DELETE_ROOT_FALLBACK.key).tree!.key).not.toBe(remove(t, DELETE_ROOT_FALLBACK.key).tree!.key)
  })
})

describe('FR-ASM-02 the bank validates cleanly', () => {
  it('validateBank reports nothing', () => {
    expect(validateBank(ALL_ITEMS)).toEqual([])
  }, 30_000)
})
