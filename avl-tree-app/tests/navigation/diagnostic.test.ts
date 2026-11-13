import { describe, it, expect } from 'vitest'
import { diagnosticPhase, diagnosticRoute, skillStatuses, DIAGNOSTIC_SKILLS } from '../../src/navigation/diagnostic'
import { DIAGNOSTIC } from '../../src/content/questions/diagnostic'
import type { Attempt } from '../../src/state/learnerState'

// Spec: add-diagnostic-c1-and-routing / diagnostic-routing, diagnostic-c1. Requirement IDs: FR-DIA-02, FR-DIA-03, D6, D8.

const at = '2026-11-13T10:00:00.000Z'
const att = (questionId: string, correct: boolean): Attempt => ({ questionId, at, answer: 'x', correct, hintsUsed: 0 })
const ids = DIAGNOSTIC.map((i) => i.id)
const round = (marks: boolean[]): Attempt[] => ids.map((id, i) => att(id, marks[i]))
const combos = Array.from({ length: 32 }, (_, n) => ids.map((_, i) => ((n >> i) & 1) === 1))

describe('FR-DIA-03 routing is a pure function of the five results', () => {
  it('every one of the 32 combinations: four or more correct goes to C2, fewer to the refresher', () => {
    for (const c of combos) expect(diagnosticRoute(c), c.join()).toBe(c.filter(Boolean).length >= 4 ? 'c2' : 'refresher')
  })
  it('order does not matter', () => {
    expect(diagnosticRoute([true, true, true, true, false])).toBe(diagnosticRoute([false, true, true, true, true]))
    expect(diagnosticRoute([true, true, true, false, false])).toBe(diagnosticRoute([false, false, true, true, true]))
  })
})

describe('FR-DIA-02 per-skill statuses', () => {
  it('four skills, secure when every item at the skill is right, needs review otherwise', () => {
    expect(DIAGNOSTIC_SKILLS).toEqual(['bst-terminology', 'bst-insert', 'bst-search', 'tree-height'])
    const all = skillStatuses(round([true, true, true, true, true]))
    expect(all.map((s) => s.status)).toEqual(['secure', 'secure', 'secure', 'secure'])
    // bst-terminology has two items: one wrong makes it need review.
    const one = skillStatuses(round([true, false, true, true, true]))
    expect(one.find((s) => s.skill === 'bst-terminology')!.status).toBe('needs-review')
    expect(one.filter((s) => s.status === 'secure')).toHaveLength(3)
  })
  it('the latest attempt at each item counts, so a right re-check shows secure', () => {
    const first = round([true, true, true, false, true])
    const search = DIAGNOSTIC.find((i) => i.subSkill === 'bst-search')!.id
    expect(skillStatuses(first).find((s) => s.skill === 'bst-search')!.status).toBe('needs-review')
    expect(skillStatuses([...first, att(search, true)]).find((s) => s.skill === 'bst-search')!.status).toBe('secure')
  })
})

describe('phases from stored attempts', () => {
  it('no attempts: questions from the first; some answered: the next unanswered', () => {
    expect(diagnosticPhase([])).toEqual({ name: 'questions', index: 0 })
    expect(diagnosticPhase(round([true, true, true, true, true]).slice(0, 3))).toEqual({ name: 'questions', index: 3 })
  })
  it('four or five right in the first round: done', () => {
    expect(diagnosticPhase(round([true, true, true, true, false])).name).toBe('done')
  })
  it('fewer than four right: the re-check of only the weak skills, then done', () => {
    const first = round([true, true, true, false, false])
    const phase = diagnosticPhase(first)
    const weak = DIAGNOSTIC.filter((i) => i.subSkill === 'bst-search' || i.subSkill === 'tree-height').map((i) => i.id)
    expect(phase).toEqual({ name: 'recheck', itemIds: weak, index: 0 })
    const half = diagnosticPhase([...first, att(weak[0], true)])
    expect(half).toEqual({ name: 'recheck', itemIds: weak, index: 1 })
    expect(diagnosticPhase([...first, att(weak[0], true), att(weak[1], false)]).name).toBe('done')
  })
})
