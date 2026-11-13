import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { instantiate } from '../../src/assessment/instantiate'
import { KINDS } from '../../src/assessment/kinds'
import {
  canContinue,
  checkStep,
  currentInstance,
  guidedSteps,
  hintFor,
  openRungs,
  scaffolds,
  startCheck,
  workedExample,
  type CheckAction,
  type CheckSession,
} from '../../src/assessment/scaffold'
import type { BankItem, Instance, Response } from '../../src/assessment/types'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { CHECKS } from '../../src/content/questions/checks'
import { MISCONCEPTIONS } from '../../src/content/questions/misconceptions'
import { GENERAL_HINTS, HINTS } from '../../src/content/questions/scaffolds'
import type { Tree } from '../../src/engine/tree'
import { RETRY_CAP, SCAFFOLD_LADDER } from '../../src/modules/config'
import { freshLearnerState, parseLearnerState } from '../../src/state/learnerState'
import { SEEDS, engineAnswer, sameShape } from './helpers'

// Spec: add-scaffold-ladder-and-retry-cap / scaffold-ladder.
// Requirement IDs: FR-SCA-02, FR-SCA-03, FR-ASM-05, FR-ASM-07, D9, D21.

const AT = '2026-11-13T10:00:00.000Z'
const byKind = (kind: string) => CHECKS.find((i) => i.kind === kind)!
const bfItem = byKind('balance-factor')
const treeItem = byKind('insert-final-tree')
const nonTreeItems = CHECKS.filter((i) => KINDS[i.kind].type !== 'tree')

type How = 'correct' | 'wrong' | 'unreadable'

/** A response of the wanted kind for an instance. A choice response with no matching option is unreadable for every type. */
function respond(inst: Instance, how: How): Response {
  if (how === 'unreadable') return { choice: 'opt-none' }
  if (inst.type === 'choice') {
    const opt = inst.options!.find((o) => o.correct === (how === 'correct'))!
    return { choice: opt.id }
  }
  if (inst.type === 'number') return { number: String(how === 'correct' ? (inst.answer as number) : (inst.answer as number) + 1) }
  return { tree: how === 'correct' ? (inst.answer as Tree) : null }
}

function answer(item: BankItem, s: CheckSession, how: How) {
  return checkStep(item, s, { type: 'answer', response: respond(currentInstance(item, s), how), at: AT })
}

const help = (item: BankItem, s: CheckSession) => checkStep(item, s, { type: 'help' }).session

function wrongTimes(item: BankItem, seed: number, n: number): CheckSession {
  let s = startCheck(item, seed)
  for (let i = 0; i < n; i++) s = answer(item, s, 'wrong').session
  return s
}

/** A wrong number for an instance that no misconception produces. */
function unrecognised(inst: Instance): number {
  const taken = new Set<number>([inst.answer as number, ...(inst.known ?? []).map((k) => k.value as number)])
  let n = 90
  while (taken.has(n)) n++
  return n
}

/** First seed whose attempt `attempt` balance factor is not 0, so the negated answer is a sign slip. */
function seedWithNonZero(attempt: number): number {
  return SEEDS.find((seed) => instantiate(bfItem, seed, attempt).answer !== 0)!
}

describe('FR-ASM-07 a check question is a session', () => {
  it('fresh session: open, attempt 0, no rungs, no lecture question', () => {
    for (const item of CHECKS) {
      const s = startCheck(item, 4)
      expect(s.outcome).toBe('open')
      expect(s.attempt).toBe(0)
      expect(openRungs(s)).toEqual([])
      expect(s.lectureQuestion).toBeUndefined()
    }
  })

  it('a correct answer closes the session as correct', () => {
    for (const item of CHECKS) {
      const { session, mark } = answer(item, startCheck(item, 7), 'correct')
      expect(mark?.status).toBe('correct')
      expect(session.outcome).toBe('correct')
      expect(session.attempt).toBe(0)
    }
  })

  it('a wrong answer gives the question model\'s next variant, a new problem', () => {
    for (const item of CHECKS) {
      for (const seed of SEEDS) {
        const s = answer(item, startCheck(item, seed), 'wrong').session
        expect(s.attempt).toBe(1)
        const next = currentInstance(item, s)
        expect(next).toEqual(instantiate(item, seed, 1))
        expect(next.signature).not.toBe(instantiate(item, seed, 0).signature)
      }
    }
  })

  it('unreadable input counts for nothing', () => {
    const s0 = help(bfItem, startCheck(bfItem, 3))
    const r = checkStep(bfItem, s0, { type: 'answer', response: { number: 'two' }, at: AT })
    expect(r.session).toEqual(s0)
    expect(r.attempt).toBeUndefined()
  })
})

describe('FR-SCA-02 rungs escalate in a fixed order', () => {
  const actionArb = fc.constantFrom<How | 'help'>('wrong', 'correct', 'help', 'unreadable')

  it('open rungs are a prefix of the ladder that never shrinks (property)', () => {
    fc.assert(
      fc.property(fc.nat(CHECKS.length - 1), fc.nat(99), fc.array(actionArb, { maxLength: 10 }), (i, seed, actions) => {
        const item = CHECKS[i]
        let s = startCheck(item, seed)
        let before = 0
        for (const a of actions) {
          s = a === 'help' ? help(item, s) : answer(item, s, a).session
          const rungs = openRungs(s)
          expect(rungs).toEqual(SCAFFOLD_LADDER.slice(0, rungs.length))
          expect(rungs.length).toBeGreaterThanOrEqual(before)
          before = rungs.length
        }
      }),
      { numRuns: 150 },
    )
  })

  it('help on request before any answer opens the hint only', () => {
    const s = help(bfItem, startCheck(bfItem, 0))
    expect(openRungs(s)).toEqual(['hint'])
    expect(s.attempt).toBe(0)
  })

  it('a wrong answer opens the next rung', () => {
    const s = answer(bfItem, help(bfItem, startCheck(bfItem, 0)), 'wrong').session
    expect(openRungs(s)).toEqual(['hint', 'worked-example'])
  })

  it('nothing beyond the top rung', () => {
    let s = startCheck(bfItem, 0)
    for (let i = 0; i < SCAFFOLD_LADDER.length; i++) s = help(bfItem, s)
    expect(openRungs(s)).toEqual([...SCAFFOLD_LADDER])
    expect(help(bfItem, s)).toEqual(s)
  })

  it('scaffolds lists one entry per open rung, in order', () => {
    let s = startCheck(bfItem, 2)
    for (let i = 0; i <= SCAFFOLD_LADDER.length; i++) {
      expect(scaffolds(bfItem, s).map((x) => x.rung)).toEqual(openRungs(s))
      s = help(bfItem, s)
    }
  })

  it('the ladder order is defined in the config only', () => {
    expect(SCAFFOLD_LADDER).toEqual(['hint', 'worked-example', 'guided'])
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = join(dir, f)
        return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(p) ? [p] : []
      })
    const order = /['"]hint['"]\s*,\s*['"]worked-example['"]/
    const defining = files('src').filter((p) => order.test(readFileSync(p, 'utf8')))
    expect(defining.map((p) => p.replace(/\\/g, '/'))).toEqual(['src/modules/config.ts'])
  })
})

describe('FR-ASM-05 D21 hints used are recorded', () => {
  it('counts the rungs open when the answer is given', () => {
    const s = help(bfItem, help(bfItem, startCheck(bfItem, 1)))
    const { attempt } = answer(bfItem, s, 'wrong')
    expect(attempt?.hintsUsed).toBe(2)
    const state = parseLearnerState(JSON.parse(JSON.stringify({ ...freshLearnerState('p'), attempts: [attempt] })))
    expect(state?.attempts).toHaveLength(1)
  })

  it('no help used', () => {
    const { attempt } = answer(bfItem, startCheck(bfItem, 1), 'correct')
    expect(attempt).toMatchObject({ hintsUsed: 0, correct: true, questionId: bfItem.id })
  })
})

describe('FR-SCA-02 the hint matches the misconception', () => {
  const w = conventionsWording()

  it('a sign slip gets the subtraction-order hint for the next problem', () => {
    const seed = seedWithNonZero(0)
    const inst0 = instantiate(bfItem, seed, 0)
    const { session, mark } = checkStep(bfItem, startCheck(bfItem, seed), {
      type: 'answer',
      response: { number: String(-(inst0.answer as number)) },
      at: AT,
    })
    expect(mark?.misconceptionId).toBe('M-BF-SIGN')
    expect(session.lastMisconception).toBe('M-BF-SIGN')
    const inst1 = currentInstance(bfItem, session)
    expect(hintFor(bfItem, session)).toBe(HINTS['M-BF-SIGN'].text(inst1.facts, w))
  })

  it('general hint before any answer, for every item', () => {
    for (const item of CHECKS) {
      const s = help(item, startCheck(item, 5))
      const inst = currentInstance(item, s)
      expect(hintFor(item, s)).toBe(GENERAL_HINTS[item.subSkill].text(inst.facts, w))
    }
  })

  it('general hint after an unrecognised wrong number', () => {
    const inst0 = instantiate(bfItem, 6, 0)
    const { session, mark } = checkStep(bfItem, startCheck(bfItem, 6), {
      type: 'answer',
      response: { number: String(unrecognised(inst0)) },
      at: AT,
    })
    expect(mark?.status).toBe('not-yet')
    expect(mark?.misconceptionId).toBeUndefined()
    expect(session.lastMisconception).toBeUndefined()
    expect(hintFor(bfItem, session)).toBe(GENERAL_HINTS[bfItem.subSkill].text(currentInstance(bfItem, session).facts, w))
  })
})

describe('FR-SCA-02 D9 the worked example is a solved sibling problem', () => {
  it('differs from every attempt the session can reach', () => {
    for (const item of CHECKS) {
      for (const seed of SEEDS) {
        const we = workedExample(item, seed)
        for (let a = 0; a < RETRY_CAP; a++) expect(we.instance.signature).not.toBe(instantiate(item, seed, a).signature)
      }
    }
  })

  it('its answer comes from the engine and its explanation is the item\'s', () => {
    for (const item of CHECKS) {
      for (const seed of SEEDS) {
        const we = workedExample(item, seed)
        const direct = engineAnswer(item.kind, we.instance)
        if (KINDS[item.kind].type === 'tree') expect(sameShape(we.answer as Tree, direct as Tree)).toBe(true)
        else expect(we.answer).toEqual(direct)
        expect(we.explanation).toBe(we.instance.correctExplanation)
        expect(we.explanation.trim()).not.toBe('')
      }
    }
  })

  it('deterministic', () => {
    for (const item of CHECKS) expect(workedExample(item, 11)).toEqual(workedExample(item, 11))
  })
})

describe('FR-SCA-02 D21 the guided step-through walks the student\'s problem', () => {
  it('tree items follow the trace', () => {
    for (const seed of SEEDS) {
      const s = startCheck(treeItem, seed)
      const trace = currentInstance(treeItem, s).trace!
      const steps = guidedSteps(treeItem, s)
      expect(steps).toHaveLength(trace.length)
      steps.forEach((st, i) => expect(st).toEqual({ kind: 'trace', step: trace[i] }))
    }
  })

  it('other items follow the correct explanation, sentence by sentence', () => {
    for (const item of nonTreeItems) {
      for (const seed of SEEDS) {
        const s = startCheck(item, seed)
        const steps = guidedSteps(item, s)
        expect(steps.length).toBeGreaterThan(0)
        const texts = steps.map((st) => (st.kind === 'text' ? st.text : ''))
        for (const t of texts) expect(t.trim()).not.toBe('')
        expect(texts.join(' ')).toBe(currentInstance(item, s).correctExplanation)
      }
    }
  })

  it('a capped session walks the last problem', () => {
    const s = wrongTimes(bfItem, 8, RETRY_CAP)
    const text = guidedSteps(bfItem, s).map((st) => (st.kind === 'text' ? st.text : '')).join(' ')
    expect(text).toBe(instantiate(bfItem, 8, RETRY_CAP - 1).correctExplanation)
  })
})

describe('FR-SCA-03 retries are capped', () => {
  it('cap reached: capped at the last attempt, every rung open, a lecture question, continue offered', () => {
    for (const item of CHECKS) {
      for (const seed of SEEDS) {
        const s = wrongTimes(item, seed, RETRY_CAP)
        expect(s.outcome).toBe('capped')
        expect(s.attempt).toBe(RETRY_CAP - 1)
        expect(openRungs(s)).toEqual([...SCAFFOLD_LADDER])
        expect(s.lectureQuestion).toBeDefined()
        expect(canContinue(s)).toBe(true)
      }
    }
  })

  it('no loop without an exit (property)', () => {
    const actionArb = fc.constantFrom<How | 'help'>('wrong', 'correct', 'help', 'unreadable')
    fc.assert(
      fc.property(fc.nat(CHECKS.length - 1), fc.nat(99), fc.array(actionArb, { maxLength: 14 }), (i, seed, actions) => {
        const item = CHECKS[i]
        let s = startCheck(item, seed)
        let marked = 0
        for (const a of actions) {
          const action: CheckAction = a === 'help' ? { type: 'help' } : { type: 'answer', response: respond(currentInstance(item, s), a), at: AT }
          const r = checkStep(item, s, action)
          if (r.mark !== undefined && r.mark.status !== 'unreadable') marked++
          s = r.session
          expect(marked).toBeLessThanOrEqual(RETRY_CAP)
          if (marked === RETRY_CAP) expect(s.outcome).not.toBe('open')
          if (s.outcome !== 'open') expect(canContinue(s)).toBe(true)
        }
      }),
      { numRuns: 150 },
    )
  })

  it('a closed session ignores further answers and requests', () => {
    const capped = wrongTimes(bfItem, 2, RETRY_CAP)
    const r = answer(bfItem, capped, 'correct')
    expect(r.session).toEqual(capped)
    expect(r.mark).toBeUndefined()
    expect(help(bfItem, capped)).toEqual(capped)
  })

  it('correct on the last try: closed as correct, no lecture question', () => {
    const s = answer(bfItem, wrongTimes(bfItem, 2, RETRY_CAP - 1), 'correct').session
    expect(s.outcome).toBe('correct')
    expect(s.lectureQuestion).toBeUndefined()
  })
})

describe('FR-SCA-03 C9 the lecture question is drafted', () => {
  it('names the misconception and the last problem', () => {
    const last = RETRY_CAP - 1
    const seed = seedWithNonZero(last)
    let s = wrongTimes(bfItem, seed, last)
    const inst = currentInstance(bfItem, s)
    s = checkStep(bfItem, s, { type: 'answer', response: { number: String(-(inst.answer as number)) }, at: AT }).session
    const q = s.lectureQuestion!
    expect(q).toMatchObject({ questionId: bfItem.id, module: bfItem.module, at: AT, misconceptionId: 'M-BF-SIGN' })
    expect(q.text).toContain(MISCONCEPTIONS['M-BF-SIGN'].label)
    expect(q.text).toContain(inst.stem)
    const state = parseLearnerState(JSON.parse(JSON.stringify({ ...freshLearnerState('p'), lectureQuestions: [q] })))
    expect(state?.lectureQuestions).toEqual([q])
  })

  it('without a misconception: the stem only', () => {
    let s = wrongTimes(bfItem, 6, RETRY_CAP - 1)
    const inst = currentInstance(bfItem, s)
    s = checkStep(bfItem, s, { type: 'answer', response: { number: String(unrecognised(inst)) }, at: AT }).session
    const q = s.lectureQuestion!
    expect(q.misconceptionId).toBeUndefined()
    expect(q.text).toContain(inst.stem)
  })
})
