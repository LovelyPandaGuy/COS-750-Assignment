import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { PREREQUISITE, entryPolicy, recommendRoute } from '../../src/navigation/policy'
import { MODULE_IDS, freshLearnerState, type LearnerState, type ModuleId } from '../../src/state/learnerState'

// Spec: add-module-framework / module-entry and route-choice. Requirement IDs: D20, D28, FR-LRN-04, FR-LRN-05.

const fresh = () => freshLearnerState('profile-test')
const withCompleted = (completedModules: ModuleId[]): LearnerState => ({ ...fresh(), completedModules })

const moduleArb = fc.constantFrom(...MODULE_IDS)
const stateArb: fc.Arbitrary<LearnerState> = fc.record({
  schemaVersion: fc.constant(1),
  profileId: fc.string({ minLength: 1 }),
  path: fc.constantFrom('guided' as const, 'diagnostic-skipped' as const),
  currentModule: moduleArb,
  completedModules: fc.uniqueArray(moduleArb),
  attempts: fc.constant([]),
  subSkillStatus: fc.constant({}),
  lectureQuestions: fc.constant([]),
})

describe('D20 each module names one prerequisite', () => {
  it('C1 has none, C2 to C7 name the module before, C8 names C6, C9 names C8', () => {
    expect(PREREQUISITE).toEqual({
      C1: null,
      C2: 'C1',
      C3: 'C2',
      C4: 'C3',
      C5: 'C4',
      C6: 'C5',
      C7: 'C6',
      C8: 'C6',
      C9: 'C8',
    })
  })
})

describe('D20 FR-LRN-04 entry is never locked', () => {
  it('a fresh learner opening C3 may enter and is told about C2', () => {
    expect(entryPolicy('C3', fresh())).toEqual({ enter: true, prerequisite: 'C2' })
  })

  it('with C2 completed, C3 names no prerequisite', () => {
    expect(entryPolicy('C3', withCompleted(['C1', 'C2']))).toEqual({ enter: true, prerequisite: null })
  })

  it('C1 never names a prerequisite', () => {
    fc.assert(
      fc.property(stateArb, (s) => {
        expect(entryPolicy('C1', s)).toEqual({ enter: true, prerequisite: null })
      }),
    )
  })

  it('C8 does not need the optional C7', () => {
    expect(entryPolicy('C8', withCompleted(['C1', 'C2', 'C3', 'C4', 'C5', 'C6'])).prerequisite).toBeNull()
  })

  it('every module and every learner state may enter (property)', () => {
    fc.assert(
      fc.property(moduleArb, stateArb, (m, s) => {
        const d = entryPolicy(m, s)
        expect(d.enter).toBe(true)
        expect(d.prerequisite).toBe(s.completedModules.includes(PREREQUISITE[m] as ModuleId) ? null : PREREQUISITE[m])
      }),
    )
  })

  it('deciding changes nothing in the learner state', () => {
    fc.assert(
      fc.property(stateArb, (s) => {
        const before = structuredClone(s)
        for (const m of MODULE_IDS) entryPolicy(m, s)
        expect(s).toEqual(before)
      }),
    )
  })
})

describe('D20 D28 a route is recommended after a check', () => {
  it('recommends the next module in the guided order, including the optional C7', () => {
    expect(['C2', 'C3', 'C5', 'C6', 'C8'].map((m) => recommendRoute(m as ModuleId))).toEqual(['C3', 'C4', 'C6', 'C7', 'C9'])
  })

  it('recommends nothing after C9', () => {
    expect(recommendRoute('C9')).toBeNull()
  })
})
