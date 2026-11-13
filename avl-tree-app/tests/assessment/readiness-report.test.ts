import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { c9RunFinished } from '../../src/assessment/readiness'
import { lectureList, readinessReport, summaryText } from '../../src/assessment/report'
import { readinessCopy } from '../../src/content/readiness'
import { CHECKS } from '../../src/content/questions/checks'
import { MISCONCEPTIONS } from '../../src/content/questions/misconceptions'
import { READINESS, lectureListText } from '../../src/content/questions/readiness'
import { OWN_LECTURE_QUESTION } from '../../src/modules/config'
import { freshLearnerState, parseLearnerState, type Attempt, type LectureQuestion } from '../../src/state/learnerState'

// Spec: add-readiness-c9 / readiness-report.
// Requirement IDs: FR-RDY-01, FR-RDY-02, FR-ASM-05, FR-ASM-06, D4, D8, D14.

const LOS = ['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6', 'LO7', 'LO8', 'LO9'] as const
const JUDGING = /\b(?:wrong|fail\w*|incorrect)\b/i
const ALL = [...CHECKS, ...READINESS]
const lo = (outcome: string) => READINESS.find((i) => i.outcome === outcome && !i.combined)!
const searchItem = () => READINESS.find((i) => i.combined && i.outcome === 'LO4')!
const time = (n: number) => new Date(Date.UTC(2026, 10, 13, 9, 0, n)).toISOString()

let clock = 0
function att(questionId: string, correct: boolean, extra: Partial<Attempt> = {}): Attempt {
  return { questionId, at: time(clock++), answer: null, correct, hintsUsed: 0, ...extra }
}
const outcomeOf = (report: ReturnType<typeof readinessReport>, o: string) => report.outcomes.find((x) => x.outcome === o)!
const itemState = (report: ReturnType<typeof readinessReport>, id: string) =>
  report.outcomes.flatMap((o) => o.items).find((i) => i.itemId === id)!.state

/** Every readiness item answered correctly, except the ones listed. */
const allCorrectExcept = (...wrong: string[]): Attempt[] => READINESS.map((i) => att(i.id, !wrong.includes(i.id)))

describe('FR-RDY-01 D8 item status comes from stored attempts', () => {
  it('the four states', () => {
    const [a, b, c, d] = [lo('LO1'), lo('LO2'), lo('LO3'), lo('LO6')].map((i) => i.id)
    const report = readinessReport([att(b, false), att(c, false), att(c, true), att(d, true)])
    expect([a, b, c, d].map((id) => itemState(report, id))).toEqual(['unassessed', 'not-yet', 'developing', 'secure'])
  })

  it('the latest run decides', () => {
    const id = lo('LO1').id
    expect(itemState(readinessReport([att(id, true), att(id, false)]), id)).toBe('not-yet')
  })
})

describe('FR-RDY-01 FR-ASM-06 Ready or Revise per outcome', () => {
  it('ready with a return', () => {
    const id = lo('LO2').id
    const o = outcomeOf(readinessReport([att(id, false), att(id, true)]), 'LO2')
    expect(o.verdict).toBe('ready')
    expect(o.state).toBe('developing')
  })

  it('a combined item can hold an outcome back', () => {
    const o = outcomeOf(readinessReport([att(lo('LO4').id, true), att(searchItem().id, false)]), 'LO4')
    expect(o.verdict).toBe('revise')
    expect(o.state).toBe('not-yet')
  })

  it('nothing answered yet', () => {
    const report = readinessReport([])
    for (const o of report.outcomes) {
      expect(o.verdict).toBe('revise')
      expect(o.state).toBe('unassessed')
    }
    expect(report.overall).toBe('revise')
  })

  it('verdicts match the rule applied directly to the attempts (property)', () => {
    const ids = READINESS.map((i) => i.id)
    const attemptArb = fc.record({ id: fc.constantFrom(...ids), correct: fc.boolean() })
    fc.assert(
      fc.property(fc.array(attemptArb, { maxLength: 30 }), (raw) => {
        const attempts = raw.map((r, n) => ({ questionId: r.id, at: time(n), answer: null, correct: r.correct, hintsUsed: 0 }))
        const report = readinessReport(attempts)
        const rank = { 'not-yet': 0, developing: 1, secure: 2 } as const
        for (const o of LOS) {
          const states = READINESS.filter((i) => i.outcome === o).flatMap((i) => {
            const mine = attempts.filter((a) => a.questionId === i.id)
            if (mine.length === 0) return []
            const last = mine[mine.length - 1]
            if (!last.correct) return ['not-yet' as const]
            return [mine.length > 1 && !mine[mine.length - 2].correct ? ('developing' as const) : ('secure' as const)]
          })
          const lowest = states.length === 0 ? 'unassessed' : states.reduce((x, y) => (rank[x] <= rank[y] ? x : y))
          const ready = states.length > 0 && states.every((x) => x !== 'not-yet')
          expect(outcomeOf(report, o).state).toBe(lowest)
          expect(outcomeOf(report, o).verdict).toBe(ready ? 'ready' : 'revise')
        }
      }),
      { numRuns: 200 },
    )
  })
})

describe('FR-RDY-01 D4 LO8 never blocks Ready', () => {
  it('revise on LO8 only: overall ready, LO8 still listed', () => {
    const report = readinessReport(allCorrectExcept(lo('LO8').id))
    expect(report.overall).toBe('ready')
    expect(outcomeOf(report, 'LO8').verdict).toBe('revise')
    expect(outcomeOf(report, 'LO8').blocksReady).toBe(false)
    expect(report.outcomes.map((o) => o.outcome)).toEqual([...LOS])
  })

  it('revise elsewhere: overall revise', () => {
    expect(readinessReport(allCorrectExcept(lo('LO3').id)).overall).toBe('revise')
  })
})

describe('FR-RDY-01 FR-ASM-05 confident errors are flagged', () => {
  it('counted per outcome', () => {
    const bf = CHECKS.find((i) => i.id === 'chk3-bf')!
    const report = readinessReport([
      att(bf.id, false, { confidence: 'sure' }),
      att(bf.id, false, { confidence: 'unsure' }),
      att(lo('LO3').id, true, { confidence: 'sure' }),
    ])
    for (const o of LOS) expect(outcomeOf(report, o).confidentErrors, o).toBe(o === 'LO3' ? 1 : 0)
  })

  it('unknown IDs ignored', () => {
    const report = readinessReport([att('no-such-item', false, { confidence: 'sure' })])
    for (const o of report.outcomes) expect(o.confidentErrors).toBe(0)
  })
})

describe('FR-RDY-01 links back to the examples', () => {
  it('links per outcome', () => {
    const expected: Record<string, string[]> = {
      LO1: ['C2'], LO2: ['C3'], LO3: ['C3'], LO4: ['C4'], LO5: ['C4', 'C8'], LO6: ['C5'], LO7: ['C6'], LO8: ['C7'], LO9: ['C8'],
    }
    const report = readinessReport([])
    for (const o of LOS) {
      expect(outcomeOf(report, o).links).toEqual(expected[o].map((module) => ({ module, activity: 'example' })))
    }
  })
})

describe('FR-RDY-02 unresolved misconceptions become lecture questions', () => {
  const bfWrong = () => att('chk3-bf', false, { misconceptionId: 'M-BF-SIGN' })

  it('an unresolved misconception is listed', () => {
    const list = lectureList([bfWrong()], [])
    expect(list.generated).toHaveLength(1)
    expect(list.generated[0].misconceptionId).toBe('M-BF-SIGN')
    expect(list.generated[0].text).toContain(MISCONCEPTIONS['M-BF-SIGN'].label)
  })

  it('resolved by a later correct answer on the same sub-skill', () => {
    expect(lo('LO3').subSkill).toBe('compute-balance-factor')
    const list = lectureList([bfWrong(), att(lo('LO3').id, true)], [])
    expect(list.generated.map((g) => g.misconceptionId)).not.toContain('M-BF-SIGN')
  })

  it('empty exactly when nothing is unresolved, with no duplicates (property)', () => {
    const ids = ALL.map((i) => i.id)
    const tags = Object.keys(MISCONCEPTIONS)
    const arb = fc.record({ id: fc.constantFrom(...ids), correct: fc.boolean(), tag: fc.option(fc.constantFrom(...tags), { nil: undefined }) })
    const subSkillOf = (id: string) => ALL.find((i) => i.id === id)!.subSkill
    fc.assert(
      fc.property(fc.array(arb, { maxLength: 25 }), (raw) => {
        const attempts: Attempt[] = raw.map((r, n) => ({
          questionId: r.id,
          at: time(n),
          answer: null,
          correct: r.correct,
          hintsUsed: 0,
          ...(!r.correct && r.tag !== undefined ? { misconceptionId: r.tag } : {}),
        }))
        const unresolved = new Set<string>()
        for (const m of tags) {
          const lastWrong = attempts.map((a, n) => [a, n] as const).filter(([a]) => a.misconceptionId === m).pop()
          if (lastWrong === undefined) continue
          const [a, n] = lastWrong
          const fixed = attempts.slice(n + 1).some((b) => b.correct && subSkillOf(b.questionId) === subSkillOf(a.questionId))
          if (!fixed) unresolved.add(m)
        }
        const generated = lectureList(attempts, []).generated.map((g) => g.misconceptionId)
        expect(new Set(generated)).toEqual(unresolved)
        expect(generated.length).toBe(new Set(generated).size)
        expect(generated.length === 0).toBe(unresolved.size === 0)
      }),
      { numRuns: 200 },
    )
  })

  it('every misconception has a template', () => {
    for (const { label } of Object.values(MISCONCEPTIONS)) {
      const text = lectureListText(label)
      expect(text.trim()).not.toBe('')
      expect(text).toContain(label)
      expect(text).not.toMatch(JUDGING)
    }
  })
})

describe('FR-RDY-02 D14 drafted and own questions', () => {
  const drafted: LectureQuestion = { questionId: 'chk3-bf', module: 'C3', at: time(1), text: 'Could we go through a question like this one?', misconceptionId: 'M-BF-SIGN' }
  const own: LectureQuestion = { questionId: OWN_LECTURE_QUESTION, module: 'C9', at: time(2), text: 'When does a delete need two rotations?' }

  it('an own question is required', () => {
    const list = lectureList([], [drafted])
    expect(list.drafted).toEqual([drafted])
    expect(list.own).toEqual([])
    expect(list.needsOwn).toBe(true)
  })

  it('an own question is recorded', () => {
    expect(OWN_LECTURE_QUESTION).toBe('own')
    const list = lectureList([], [drafted, own])
    expect(list.own.map((q) => q.text)).toEqual([own.text])
    expect(list.drafted).toEqual([drafted])
    expect(list.needsOwn).toBe(false)
    const state = parseLearnerState(JSON.parse(JSON.stringify({ ...freshLearnerState('p'), lectureQuestions: [drafted, own] })))
    expect(state?.lectureQuestions).toEqual([drafted, own])
  })
})

// Added at the 13 Nov merge: the summary screen's text and C9's completion read from these.
describe('FR-RDY-03 the summary text', () => {
  it('holds every outcome, the overall verdict, the lecture list and own questions, and no profile ID', () => {
    const attempts = [att('rdy-lo3', false, { misconceptionId: 'M-BF-SIGN', confidence: 'sure' })]
    const own: LectureQuestion = { questionId: OWN_LECTURE_QUESTION, module: 'C9', at: time(3), text: 'Mine?' }
    const state = freshLearnerState('profile-xyz')
    const text = summaryText(readinessReport(attempts), lectureList(attempts, [own]))
    for (const o of LOS) expect(text).toContain(`${o}:`)
    expect(text).toContain(readinessCopy.overall(readinessCopy.states.revise))
    expect(text).toContain(lectureListText(MISCONCEPTIONS['M-BF-SIGN'].label))
    expect(text).toContain(readinessCopy.flag)
    expect(text).toContain('Mine?')
    expect(text).not.toContain(state.profileId)
  })
})

describe('decision 11: a C9 run is over', () => {
  it('when every required item has an attempt and each missed one has used its return', () => {
    const required = READINESS.filter((i) => i.optional !== true)
    expect(c9RunFinished([])).toBe(false)
    expect(c9RunFinished(required.map((i) => att(i.id, true)))).toBe(true)
    const missed = required.map((i) => att(i.id, i.id !== 'rdy-lo2'))
    expect(c9RunFinished(missed)).toBe(false)
    expect(c9RunFinished([...missed, att('rdy-lo2', false)])).toBe(true)
  })
})
