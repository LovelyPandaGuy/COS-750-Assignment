import { describe, it, expect } from 'vitest'
import { checkComplete, checkSeed, checksFor, firstAttemptMisses } from '../../src/assessment/session'
import { REVIEW_AFTER_MISSES } from '../../src/modules/config'
import { recommendRoute } from '../../src/navigation/policy'
import type { Attempt } from '../../src/state/learnerState'

// Spec: add-checks-and-feedback / module-checks, route-choice. Requirement IDs: FR-LRN-05, FR-ASM-07, D4, D9, D20, D28.

const at = '2026-11-13T10:00:00.000Z'
const att = (questionId: string, correct: boolean): Attempt => ({ questionId, at, answer: 'x', correct, hintsUsed: 0 })
const ids = (m: Parameters<typeof checksFor>[0]) => checksFor(m).map((i) => i.id)

describe('checksFor', () => {
  it('gives the bank items of a module in bank order, none for C1 and C9', () => {
    expect(ids('C2')).toEqual(['chk2-height', 'chk2-worst'])
    expect(checksFor('C3')).toHaveLength(3)
    expect(checksFor('C1')).toEqual([])
    expect(checksFor('C9')).toEqual([])
  })
})

describe('checkSeed', () => {
  it('is the same for the same profile and item, and differs across them', () => {
    expect(checkSeed('p1', 'chk2-height')).toBe(checkSeed('p1', 'chk2-height'))
    expect(checkSeed('p1', 'chk2-height')).not.toBe(checkSeed('p2', 'chk2-height'))
    expect(checkSeed('p1', 'chk2-height')).not.toBe(checkSeed('p1', 'chk2-worst'))
    expect(Number.isInteger(checkSeed('p1', 'a'))).toBe(true)
  })
})

describe('FR-LRN-05 checkComplete', () => {
  it('needs every required item answered correctly, on any attempt', () => {
    expect(checkComplete('C2', [])).toBe(false)
    expect(checkComplete('C2', [att('chk2-height', true)])).toBe(false)
    expect(checkComplete('C2', [att('chk2-height', false), att('chk2-height', true), att('chk2-worst', true)])).toBe(true)
  })
  it('a wrong answer alone does not count', () => {
    expect(checkComplete('C2', [att('chk2-height', true), att('chk2-worst', false)])).toBe(false)
  })
  it('C7 items are optional: complete only when every one is right', () => {
    expect(checkComplete('C7', [])).toBe(false)
    expect(checkComplete('C7', ids('C7').map((id) => att(id, true)))).toBe(true)
  })
  it('C1 and C9 have no bank check, so never complete', () => {
    expect(checkComplete('C1', [])).toBe(false)
    expect(checkComplete('C9', [])).toBe(false)
  })
})

describe('first-attempt misses and the recommendation', () => {
  it('counts a required item whose earliest attempt was not correct', () => {
    expect(firstAttemptMisses('C2', [att('chk2-height', true), att('chk2-worst', true)])).toBe(0)
    expect(firstAttemptMisses('C2', [att('chk2-height', false), att('chk2-height', true), att('chk2-worst', true)])).toBe(1)
  })
  it('ignores optional items', () => {
    expect(firstAttemptMisses('C7', ids('C7').map((id) => att(id, false)))).toBe(0)
  })
  it('suggests the next module with no misses, this module at the threshold', () => {
    const good = [att('chk2-height', true), att('chk2-worst', true)]
    const miss = [att('chk2-height', false), att('chk2-height', true), att('chk2-worst', true)]
    expect(REVIEW_AFTER_MISSES).toBe(1)
    expect(recommendRoute('C2', good)).toBe('C3')
    expect(recommendRoute('C2', miss)).toBe('C2')
    expect(recommendRoute('C2')).toBe('C3')
    expect(recommendRoute('C6', [att('chk6-node', true)])).toBe('C7')
  })
})
