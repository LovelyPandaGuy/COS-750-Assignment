import { describe, it, expect } from 'vitest'
import { instantiate } from '../../src/assessment/instantiate'
import { MISCONCEPTIONS } from '../../src/content/questions/misconceptions'
import { SUB_SKILLS } from '../../src/content/questions/subSkills'
import { CHECKS } from '../../src/content/questions/checks'
import { SCAFFOLDS, SCAFFOLD_SOURCE } from '../../src/content/questions/scaffolds'
import { validateBank } from '../../src/assessment/validate'
import { capped, finished, hintFor, ladderLevel, lectureQuestionFor, stepsOf, workedExampleFor } from '../../src/assessment/scaffold'
import { checkComplete } from '../../src/assessment/session'
import { RETRY_CAP } from '../../src/modules/config'
import { engineAnswer, SEEDS } from './helpers'
import type { Attempt } from '../../src/state/learnerState'

// Spec: add-scaffold-ladder-and-retry-cap / scaffold-ladder, retry-cap, question-bank.
// Requirement IDs: FR-SCA-02, FR-SCA-03, D19, D21.

const at = '2026-11-13T10:00:00.000Z'
const att = (questionId: string, correct: boolean): Attempt => ({ questionId, at, answer: 'x', correct, hintsUsed: 0 })
const SAMPLE = SEEDS.filter((s) => s % 7 === 0)

describe('ladder order', () => {
  it('wrong attempts open the next level, up to 3', () => {
    expect([0, 1, 2, 3, 4].map((w) => ladderLevel(w, 0))).toEqual([0, 1, 2, 3, 3])
  })
  it('a request raises the level by one at a time and never lowers it', () => {
    expect(ladderLevel(0, 1)).toBe(1)
    expect(ladderLevel(2, 1)).toBe(2)
    expect(ladderLevel(1, 2)).toBe(2)
  })
})

describe('retry cap and finished items', () => {
  it('capped: RETRY_CAP attempts with none correct', () => {
    expect(RETRY_CAP).toBe(3)
    expect(capped([att('a', false), att('a', false)], 'a')).toBe(false)
    expect(capped([att('a', false), att('a', false), att('a', false)], 'a')).toBe(true)
    expect(capped([att('a', false), att('a', true), att('a', false)], 'a')).toBe(false)
    expect(capped([att('b', false), att('b', false), att('b', false)], 'a')).toBe(false)
  })
  it('finished: correct or capped', () => {
    expect(finished([att('a', true)], 'a')).toBe(true)
    expect(finished([att('a', false)], 'a')).toBe(false)
    expect(finished([att('a', false), att('a', false), att('a', false)], 'a')).toBe(true)
  })
  it('a module completes with a capped item', () => {
    const wrong3 = [att('chk2-worst', false), att('chk2-worst', false), att('chk2-worst', false)]
    expect(checkComplete('C2', [att('chk2-height', true), ...wrong3])).toBe(true)
    expect(checkComplete('C2', wrong3)).toBe(false)
  })
})

describe('FR-SCA-02 scaffold builders over every item', () => {
  it('the hint is text, never the explanation of the answer', () => {
    for (const item of CHECKS) {
      for (const seed of SAMPLE) {
        const inst = instantiate(item, seed, 0)
        const m = inst.options?.find((o) => !o.correct)?.misconceptionId ?? inst.known?.[0]?.misconception
        for (const mis of [m, undefined]) {
          const h = hintFor(item, inst, mis)
          expect(h.trim(), `${item.id} ${seed}`).not.toBe('')
          expect(h).not.toContain(inst.correctExplanation)
        }
      }
    }
  })
  it('the worked example is another problem whose answer is the engine answer', () => {
    const bank = CHECKS.filter((i) => i.kind !== 'scenario-choice')
    for (const item of bank) {
      for (const seed of SAMPLE) {
        const inst = instantiate(item, seed, 0)
        const ex = workedExampleFor(item, inst)
        expect(ex.signature, `${item.id} ${seed}`).not.toBe(inst.signature)
        if (item.kind !== 'insert-final-tree' && item.kind !== 'delete-rebalances' && item.kind !== 'delete-root') {
          expect(ex.answer).toEqual(engineAnswer(item.kind, ex))
        }
      }
    }
  })
  it('the worked example is deterministic', () => {
    const item = CHECKS[0]
    const inst = instantiate(item, 5, 0)
    expect(workedExampleFor(item, inst)).toEqual(workedExampleFor(item, inst))
  })
  it('steps are the sentences of the correct explanation, in order', () => {
    for (const item of CHECKS) {
      const inst = instantiate(item, 3, 0)
      const steps = stepsOf(inst)
      expect(steps.length).toBeGreaterThanOrEqual(1)
      expect(steps.join(' ')).toBe(inst.correctExplanation.replace(/\s+/g, ' ').trim())
    }
  })
})

describe('FR-SCA-03 lecture questions', () => {
  it('every item has one, for a misconception or the sub-skill, free of the D19 wording', () => {
    for (const item of CHECKS) {
      for (const seed of SAMPLE) {
        const inst = instantiate(item, seed, 0)
        const m = inst.options?.find((o) => !o.correct)?.misconceptionId
        for (const mis of [m, undefined]) {
          const q = lectureQuestionFor(item, inst, mis)
          expect(q.trim(), `${item.id} ${seed}`).not.toBe('')
          expect(q).toMatch(/\?$/)
        }
      }
    }
  })
})

describe('FR-SCA-02 every misconception and sub-skill is covered', () => {
  it('the content has an entry for each, flagged beyond ID', () => {
    expect(SCAFFOLD_SOURCE).toBe('beyond ID')
    for (const m of Object.keys(MISCONCEPTIONS)) {
      expect(SCAFFOLDS.hints[m], m).toBeTypeOf('function')
      expect(SCAFFOLDS.lecture[m], m).toBeTypeOf('function')
    }
    const used = new Set(CHECKS.map((i) => i.subSkill))
    for (const s of Object.keys(SUB_SKILLS).filter((k) => used.has(k))) {
      expect(SCAFFOLDS.subSkillHints[s], s).toBeTypeOf('function')
      expect(SCAFFOLDS.subSkillLecture[s], s).toBeTypeOf('function')
    }
  })
  it('the bank validator passes', () => {
    expect(validateBank(CHECKS)).toEqual([])
  })
  it('a missing hint is caught and named', () => {
    const { 'M-BF-SIGN': _gone, ...hints } = SCAFFOLDS.hints
    void _gone
    const problems = validateBank(CHECKS, { scaffolds: { ...SCAFFOLDS, hints } })
    expect(problems.some((p) => p.kind === 'scaffold' && p.message.includes('M-BF-SIGN'))).toBe(true)
  })
  it('a missing lecture template is caught and named', () => {
    const { 'M-HEIGHT-NODES': _gone, ...lecture } = SCAFFOLDS.lecture
    void _gone
    const problems = validateBank(CHECKS, { scaffolds: { ...SCAFFOLDS, lecture } })
    expect(problems.some((p) => p.kind === 'scaffold' && p.message.includes('M-HEIGHT-NODES'))).toBe(true)
  })
})
