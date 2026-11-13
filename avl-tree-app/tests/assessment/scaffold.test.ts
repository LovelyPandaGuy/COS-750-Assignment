import { describe, it, expect } from 'vitest'
import { ALL_ITEMS } from '../../src/content/questions/bank'
import { validateBank } from '../../src/assessment/validate'
import { capped, checkComplete, finished } from '../../src/assessment/session'
import { RETRY_CAP } from '../../src/modules/config'
import type { Attempt } from '../../src/state/learnerState'

// Spec: add-scaffold-ladder-and-retry-cap / retry-cap, question-bank. Requirement IDs: FR-SCA-03, FR-LRN-05, D20.
// Cut down at the 13 Nov merge: the ladder, hint, worked-example, step-through and lecture tests of the
// version not chosen are superseded by tests/assessment/scaffold-ladder.test.ts and scaffold-content.test.ts.
// `capped` and `finished` now live in the session module, next to `checkComplete`.

const at = '2026-11-13T10:00:00.000Z'
const att = (questionId: string, correct: boolean): Attempt => ({ questionId, at, answer: 'x', correct, hintsUsed: 0 })

describe('FR-SCA-03 retry cap and finished items', () => {
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
  it('FR-LRN-05 a module completes with a capped item', () => {
    const wrong3 = [att('chk2-worst', false), att('chk2-worst', false), att('chk2-worst', false)]
    expect(checkComplete('C2', [att('chk2-height', true), ...wrong3])).toBe(true)
    expect(checkComplete('C2', wrong3)).toBe(false)
  })
})

describe('FR-SCA-02 every misconception and sub-skill is covered', () => {
  it('the bank validator passes over the diagnostic and the checks', () => {
    expect(validateBank(ALL_ITEMS)).toEqual([])
  }, 60_000)
})
