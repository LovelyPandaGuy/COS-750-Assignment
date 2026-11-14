import { describe, expect, it } from 'vitest'
import { diagnosticResult } from '../../src/live/diagnostic'
import { loadContent } from '../../src/live/load'
import { lectureQuestions, readinessQueue, readinessReport, titleFor } from '../../src/live/readiness'
import type { Attempt } from '../../src/state/learnerState'

// Spec: live-c1-and-c9 / lesson-c1, lesson-c9. ID 7.2 C1 and C9, 9.1, 9.2, 10.4.
const content = loadContent().content!
let clock = 0
const a = (questionId: string, correct: boolean, extra: Partial<Attempt> = {}): Attempt => ({
  questionId,
  at: new Date(Date.UTC(2026, 10, 14, 10, 0, clock++)).toISOString(),
  answer: null,
  correct,
  hintsUsed: 0,
  attempt: 1,
  ...extra,
})
const DIA = ['dia-01', 'dia-02', 'dia-03', 'dia-04', 'dia-05']
const RDY = ['rdy-01', 'rdy-02', 'rdy-03', 'rdy-04', 'rdy-05', 'rdy-06', 'rdy-07', 'rdy-08', 'rdy-09']

describe('lesson-c1: per-skill result and route (ID 7.2)', () => {
  it('four right: C2, one skill needs review, C1 complete', () => {
    const r = diagnosticResult(DIA.map((id, i) => a(id, i !== 2)), content)
    expect(r.right).toBe(4)
    expect(r.route).toBe('c2')
    expect(r.skills.map((s) => s.status)).toEqual(['secure', 'secure', 'needs-review', 'secure', 'secure'])
    expect(r.skills[2].name).toBe('Where a new key is inserted')
    expect(r.complete).toBe(true)
  })

  it('three right: the refresher, not complete', () => {
    const r = diagnosticResult(DIA.map((id, i) => a(id, i < 3)), content)
    expect(r.route).toBe('refresher')
    expect(r.complete).toBe(false)
  })

  it('the re-check asks only the missed skills, then completes C1', () => {
    const first = DIA.map((id) => a(id, id !== 'dia-02' && id !== 'dia-05'))
    const before = diagnosticResult([...first.slice(0, 3), a('dia-04', false), first[4]], content)
    expect(before.recheck).toEqual(['dia-02-r', 'dia-04-r', 'dia-05-r'])
    const r = diagnosticResult([...first, a('dia-02-r', true), a('dia-05-r', false)], content)
    expect(r.recheck).toEqual(['dia-02-r', 'dia-05-r'])
    expect(r.complete).toBe(true)
    expect(r.skills[1].status).toBe('secure')
    expect(r.skills[4].status).toBe('needs-review')
  })
})

describe('lesson-c9: readiness questions with returns', () => {
  it('first pass in order, then a missed question returns once', () => {
    expect(readinessQueue([], content)).toEqual(RDY)
    const first = RDY.map((id) => a(id, id !== 'rdy-03'))
    expect(readinessQueue(first, content)).toEqual(['rdy-03-r'])
    expect(readinessQueue([...first, a('rdy-03-r', false)], content)).toEqual([])
  })
})

describe('lesson-c9: Ready or Revise per objective (readyRule)', () => {
  const all = (wrong: string[] = []) => RDY.map((id) => a(id, !wrong.includes(id)))
  it('return form counts', () => {
    const rep = readinessReport([...all(['rdy-02']), a('rdy-02-r', true)], content)
    expect(rep.rows.find((r) => r.outcome === 'LO2')!.verdict).toBe('ready')
  })
  it('combined question counts towards LO5', () => {
    const rep = readinessReport([...all(['rdy-08']), a('rdy-08-r', false)], content)
    expect(rep.rows.find((r) => r.outcome === 'LO5')!.verdict).toBe('revise')
  })
  it('LO7 optional: overall Ready', () => {
    const rep = readinessReport([...all(['rdy-07']), a('rdy-07-r', false)], content)
    expect(rep.rows.find((r) => r.outcome === 'LO7')).toMatchObject({ verdict: 'revise', optional: true })
    expect(rep.overall).toBe('ready')
  })
})

describe('lesson-c9: flags, title and lists (ID 9.2, 10.4)', () => {
  it('title: every question right is Structural Savant', () => {
    expect(readinessReport(RDY.map((id) => a(id, true)), content).title.title).toBe('Structural Savant')
    expect(titleFor(0.66, content).title).toBe('AVL Ace')
    expect(titleFor(0.5, content).title).toBe('BST Boss')
    expect(titleFor(0.1, content).title).toBe('Complexity Cadet')
  })
  it('a confident wrong answer flags its objective', () => {
    const rep = readinessReport([a('rdy-02', false, { confidence: 'sure' })], content)
    expect(rep.rows.find((r) => r.outcome === 'LO2')!.flagged).toBe(true)
    expect(rep.rows.find((r) => r.outcome === 'LO1')!.flagged).toBe(false)
  })
  it('a lecture question from a misconception, unless put right later', () => {
    const sign = a('rdy-02', false, { misconceptionId: 'misc-bf-sign' })
    expect(lectureQuestions([sign], content)).toEqual(['Which sign convention does the lecture use for balance factors, and what does a negative value mean?'])
    expect(lectureQuestions([sign, a('rdy-02-r', true)], content)).toEqual([])
  })
})
