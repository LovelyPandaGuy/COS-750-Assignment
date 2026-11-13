import { describe, expect, it } from 'vitest'
import { instantiate } from '../../src/assessment/instantiate'
import { KINDS } from '../../src/assessment/kinds'
import { validateBank, validateItems, type BankRecords } from '../../src/assessment/validate'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { CHECKS } from '../../src/content/questions/checks'
import { MISCONCEPTIONS } from '../../src/content/questions/misconceptions'
import { OUTCOMES } from '../../src/content/questions/outcomes'
import { GENERAL_HINTS, HINTS, lectureQuestionText, type HintEntry } from '../../src/content/questions/scaffolds'
import { SUB_SKILLS } from '../../src/content/questions/subSkills'
import { SEEDS } from './helpers'

// Spec: add-scaffold-ladder-and-retry-cap / scaffold-ladder (coverage and wording).
// Requirement IDs: FR-SCA-02, SE 7.1 content validation, D19, D27.

const RECORDS: BankRecords = { outcomes: OUTCOMES, subSkills: SUB_SKILLS, misconceptions: MISCONCEPTIONS, hints: HINTS, generalHints: GENERAL_HINTS }
const byKind = (kind: string) => CHECKS.find((i) => i.kind === kind)!
const JUDGING = /\b(?:wrong|fail\w*|incorrect)\b/i

/** Every hint the ladder can show for an item: its sub-skill's general hint and one per misconception its kind produces. */
const reachable = (kind: string, subSkill: string): HintEntry[] => [GENERAL_HINTS[subSkill], ...KINDS[kind as keyof typeof KINDS].misconceptions.map((m) => HINTS[m])]

describe('FR-SCA-02 every misconception and sub-skill has a scaffold', () => {
  it('full coverage, every hint marked beyond ID', () => {
    for (const m of Object.keys(MISCONCEPTIONS)) expect(HINTS[m], m).toBeDefined()
    for (const s of Object.keys(SUB_SKILLS)) expect(GENERAL_HINTS[s], s).toBeDefined()
    for (const h of [...Object.values(HINTS), ...Object.values(GENERAL_HINTS)]) expect(h.source).toBe('beyond ID')
    expect(validateBank(CHECKS).filter((p) => p.kind === 'scaffold')).toEqual([])
  })

  it('a missing hint is caught', () => {
    const hints = Object.fromEntries(Object.entries(HINTS).filter(([m]) => m !== 'M-BF-SIGN'))
    const problems = validateBank(CHECKS, { seeds: [0], records: { ...RECORDS, hints } })
    expect(problems.some((p) => p.kind === 'scaffold' && p.value === 'M-BF-SIGN')).toBe(true)
  })

  it('a missing general hint is caught', () => {
    const generalHints = Object.fromEntries(Object.entries(GENERAL_HINTS).filter(([s]) => s !== 'node-height'))
    const problems = validateBank(CHECKS, { seeds: [0], records: { ...RECORDS, generalHints } })
    expect(problems.some((p) => p.kind === 'scaffold' && p.value === 'node-height')).toBe(true)
  })
})

describe('D19 D27 hint wording follows the content rules', () => {
  it('hints are clean over the bank', () => {
    const problems = validateBank(CHECKS).filter((p) => ['wording', 'number', 'answer', 'scaffold'].includes(p.kind))
    expect(problems).toEqual([])
  })

  it('a hint that gives a choice answer is caught', () => {
    const item = byKind('is-avl')
    const giveaway: HintEntry = { text: () => 'Yes, it is an AVL tree. No, it is not an AVL tree.', source: 'beyond ID' }
    const problems = validateItems([item], { seeds: SEEDS.slice(0, 10), records: { ...RECORDS, hints: { ...HINTS, 'M-ROOT-ONLY': giveaway } } })
    expect(problems.some((p) => p.kind === 'answer' && p.step === item.id)).toBe(true)
  })

  it('a hint that gives a number answer is caught', () => {
    const item = byKind('balance-factor')
    const giveaway: HintEntry = { text: (f, w) => `It comes to ${w.num(f.values.balanceFactor)}.`, source: 'beyond ID' }
    const problems = validateItems([item], { seeds: SEEDS.slice(0, 20), records: { ...RECORDS, hints: { ...HINTS, 'M-BF-SIGN': giveaway } } })
    expect(problems.some((p) => p.kind === 'answer' && p.step === item.id)).toBe(true)
  })

  it('a placeholder in a hint is caught', () => {
    const item = byKind('node-height')
    const broken: HintEntry = { text: (f) => `Start at node ${f.values.noSuchValue}.`, source: 'beyond ID' }
    const problems = validateItems([item], { seeds: [0], records: { ...RECORDS, generalHints: { ...GENERAL_HINTS, 'node-height': broken } } })
    expect(problems.some((p) => p.kind === 'wording' && p.step === item.id)).toBe(true)
  })

  it('reversed conventions flow into the balance-factor hints', () => {
    const item = byKind('balance-factor')
    const reversed = conventionsWording(['right', 'left'])
    const standard = conventionsWording()
    const facts = instantiate(item, 3).facts
    const texts = reachable(item.kind, item.subSkill).map((h) => h.text(facts, reversed))
    expect(HINTS['M-BF-SIGN'].text(facts, reversed)).toContain(reversed.formula)
    for (const t of texts) expect(t).not.toContain(standard.formula)
  })

  it('calm wording in every hint and the lecture-question template', () => {
    const w = conventionsWording()
    for (const item of CHECKS) {
      for (const seed of SEEDS.slice(0, 20)) {
        const inst = instantiate(item, seed)
        for (const h of reachable(item.kind, item.subSkill)) expect(h.text(inst.facts, w)).not.toMatch(JUDGING)
        for (const m of KINDS[item.kind].misconceptions) expect(lectureQuestionText(MISCONCEPTIONS[m].label, inst.stem)).not.toMatch(JUDGING)
        expect(lectureQuestionText(undefined, inst.stem)).not.toMatch(JUDGING)
      }
    }
  })
})
