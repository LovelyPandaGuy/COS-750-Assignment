import { describe, it, expect } from 'vitest'
import { subSkillStatus } from '../../src/assessment/mastery'
import { MASTERY_CORRECT, MASTERY_WINDOW } from '../../src/modules/config'
import type { Attempt } from '../../src/state/learnerState'

// Spec: add-scaffold-ladder-and-retry-cap / mastery. Requirement IDs: FR-SCA-01, D8.

const at = '2026-11-13T10:00:00.000Z'
// chk2-height and chk2-worst share no sub-skill; chk3-height (node-height) and chk3-bf are separate too.
const att = (questionId: string, correct: boolean): Attempt => ({ questionId, at, answer: 'x', correct, hintsUsed: 0 })
const run = (marks: string) => [...marks].map((c) => att('chk2-height', c === 'R'))
const status = (marks: string) => subSkillStatus(run(marks), 'bst-shape')

describe('FR-SCA-01 one threshold', () => {
  it('the window is 3 and 2 must be right', () => {
    expect([MASTERY_WINDOW, MASTERY_CORRECT]).toEqual([3, 2])
  })
})

describe('status from recent attempts', () => {
  it('table: R; WR; WRR; WWW; RW', () => {
    expect(['R', 'WR', 'WRR', 'WWW', 'RW'].map(status)).toEqual(['secure', 'developing', 'secure', 'not-yet', 'developing'])
  })
  it('only the last three count', () => {
    expect(status('WWRR')).toBe('secure')
    expect(status('RRWW')).toBe('developing')
  })
  it('no attempts means no status', () => {
    expect(subSkillStatus([], 'bst-shape')).toBeNull()
  })
  it('attempts at other sub-skills are ignored', () => {
    expect(subSkillStatus([att('chk2-worst', true), att('chk3-height', true)], 'bst-shape')).toBeNull()
  })
  it('attempts at unknown items are ignored', () => {
    expect(subSkillStatus([att('old-question', true)], 'bst-shape')).toBeNull()
  })
})
