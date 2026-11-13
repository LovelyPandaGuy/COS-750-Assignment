import { act, render } from '@testing-library/react'
import { StrictMode, useEffect } from 'react'
import { describe, it, expect } from 'vitest'
import { LearnerProvider, useLearner } from '../../src/state/LearnerContext'
import { LEARNER_KEY } from '../../src/state/storage'
import type { Attempt } from '../../src/state/learnerState'
import { backendWith, boot, progressState } from '../ui/learner-fixtures'

// Spec: add-checks-and-feedback / learner-session "Screens can record results". Requirement IDs: FR-ASM-05, FR-LRN-05.

let seen: ReturnType<typeof useLearner>
function Probe() {
  const s = useLearner()
  useEffect(() => {
    seen = s
  })
  return null
}
function mount(backend = backendWith(progressState({ currentModule: 'C2', completedModules: ['C1'], attempts: [] }))) {
  const booted = boot(backend)
  render(
    <StrictMode>
      <LearnerProvider storage={booted.storage} initial={booted.initial}>
        <Probe />
      </LearnerProvider>
    </StrictMode>,
  )
  return { backend, booted }
}
const attempt: Attempt = { questionId: 'chk2-height', at: '2026-11-13T10:00:00.000Z', answer: 'opt-3', correct: false, hintsUsed: 0, confidence: 'unsure', misconceptionId: 'M-HEIGHT-NODES' }

describe('recording an attempt', () => {
  it('adds one attempt, saves it, and does not complete anything', () => {
    const { backend } = mount()
    act(() => seen.recordAttempt(attempt))
    expect(seen.learner.attempts).toEqual([attempt])
    expect(seen.learner.completedModules).toEqual(['C1'])
    const again = boot(backend)
    expect(again.initial.state.attempts).toEqual([attempt])
  })
  it('refuses an attempt the validator rejects', () => {
    mount()
    act(() => seen.recordAttempt({ ...attempt, hintsUsed: -1 }))
    expect(seen.learner.attempts).toEqual([])
  })
})

describe('completing a module', () => {
  it('adds it once, saves it, and advances currentModule from the completed one', () => {
    const { backend } = mount()
    act(() => seen.completeModule('C2'))
    act(() => seen.completeModule('C2'))
    expect(seen.learner.completedModules).toEqual(['C1', 'C2'])
    expect(seen.learner.currentModule).toBe('C3')
    expect(boot(backend).initial.state.completedModules).toEqual(['C1', 'C2'])
  })
  it('leaves currentModule alone when it was another module', () => {
    mount(backendWith(progressState({ currentModule: 'C5', completedModules: ['C1'], attempts: [] })))
    act(() => seen.completeModule('C2'))
    expect(seen.learner.currentModule).toBe('C5')
  })
  it('writes nothing for a repeat', () => {
    const { backend } = mount()
    act(() => seen.completeModule('C2'))
    const stored = backend.getItem(LEARNER_KEY)
    act(() => seen.completeModule('C2'))
    expect(backend.getItem(LEARNER_KEY)).toBe(stored)
  })
})

describe('reset', () => {
  it('clears attempts and completed modules', () => {
    mount()
    act(() => {
      seen.recordAttempt(attempt)
      seen.completeModule('C2')
    })
    act(() => seen.reset())
    expect(seen.learner.attempts).toEqual([])
    expect(seen.learner.completedModules).toEqual([])
  })
})
