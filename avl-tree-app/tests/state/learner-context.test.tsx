import { act, render, screen } from '@testing-library/react'
import { StrictMode, useEffect } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { LearnerProvider, useLearner } from '../../src/state/LearnerContext'
import { hasProgress } from '../../src/state/learnerReducer'
import { freshLearnerState } from '../../src/state/learnerState'
import { createLearnerStorage, memoryBackend } from '../../src/state/storage'
import {
  backendWith,
  boot,
  controllableBackend,
  progressState,
  throwingBackend,
} from '../ui/learner-fixtures'

// Spec: openspec/changes/add-learner-storage-ui/specs/learner-session/spec.md

let seen: ReturnType<typeof useLearner> | null = null
function Probe() {
  const session = useLearner()
  useEffect(() => {
    seen = session
  })
  return (
    <div>
      <span data-testid="status">{session.loadStatus}</span>
      <span data-testid="persistent">{String(session.persistent)}</span>
      <span data-testid="module">{session.learner.currentModule}</span>
    </div>
  )
}

function mount(booted: ReturnType<typeof boot>) {
  const ui = (
    <StrictMode>
      <LearnerProvider storage={booted.storage} initial={booted.initial}>
        <Probe />
      </LearnerProvider>
    </StrictMode>
  )
  const r = render(ui)
  return { ...r, again: () => r.rerender(ui) }
}

describe('FR-ONB-03 / NFR-06 one load per app start', () => {
  it('reads storage once and keeps "reset-corrupt" across re-renders', () => {
    const c = controllableBackend(backendWith('{not json'))
    const booted = boot(c.backend)
    const { again } = mount(booted)
    again()
    again()
    expect(c.counts.getItem).toBe(1)
    expect(screen.getByTestId('status')).toHaveTextContent('reset-corrupt')
  })

  it('first launch status is "new" with a fresh state', () => {
    mount(boot(memoryBackend()))
    expect(seen!.loadStatus).toBe('new')
    expect(seen!.learner.currentModule).toBe('C1')
    expect(seen!.learner.attempts).toEqual([])
    expect(seen!.learner.completedModules).toEqual([])
  })
})

describe('FR-ONB-03 restore on return', () => {
  it('every screen sees exactly the stored state', () => {
    const stored = progressState()
    mount(boot(backendWith(stored)))
    expect(seen!.loadStatus).toBe('restored')
    expect(seen!.learner).toEqual(stored)
  })
})

describe('FR-ONB-03 changes are saved', () => {
  it('a reset is saved and a second app start restores it', () => {
    const backend = backendWith(progressState())
    mount(boot(backend))
    act(() => seen!.reset())
    const fresh = seen!.learner
    const second = createLearnerStorage(backend).load()
    expect(second.status).toBe('restored')
    expect(second.state).toEqual(fresh)
  })

  it('makes no save on start', () => {
    const booted = boot(backendWith(progressState()))
    const save = vi.spyOn(booted.storage, 'save')
    const { again } = mount(booted)
    again()
    expect(save).not.toHaveBeenCalled()
  })
})

describe('NFR-06 persistence status is visible to screens', () => {
  it('storage blocked at start: renders, persistence off, fresh state', () => {
    expect(() => mount(boot(throwingBackend()))).not.toThrow()
    expect(seen!.persistent).toBe(false)
    expect(seen!.learner.currentModule).toBe('C1')
    expect(seen!.learner.attempts).toEqual([])
  })

  it('storage fills up later: persistence turns off without a reload', () => {
    const c = controllableBackend(backendWith(progressState()))
    mount(boot(c.backend))
    expect(seen!.persistent).toBe(true)
    c.control.failWrites = true
    act(() => seen!.reset())
    expect(screen.getByTestId('persistent')).toHaveTextContent('false')
    expect(seen!.learner.currentModule).toBe('C1')
    expect(seen!.learner.attempts).toEqual([])
  })
})

describe('FR-ONB-04 reset from any screen', () => {
  it('replaces the state with a fresh one, saved, and records the reset', () => {
    const backend = backendWith(progressState())
    const booted = boot(backend)
    mount(booted)
    const before = seen!.learner.profileId
    act(() => seen!.reset())
    expect(seen!.learner).toEqual(freshLearnerState(seen!.learner.profileId))
    expect(seen!.learner.profileId).not.toBe(before)
    expect(createLearnerStorage(backend).load().state).toEqual(seen!.learner)
    expect(seen!.loadStatus).toBe('reset-by-user')
  })

  it('clears the corrupt-data status', () => {
    mount(boot(backendWith('{not json')))
    expect(seen!.loadStatus).toBe('reset-corrupt')
    act(() => seen!.reset())
    expect(seen!.loadStatus).toBe('reset-by-user')
  })
})

describe('FR-ONB-02 progress rule', () => {
  it('counts a non-C1 module, a completed module or an attempt as progress', () => {
    const fresh = freshLearnerState('p')
    expect(hasProgress(fresh)).toBe(false)
    expect(hasProgress({ ...fresh, currentModule: 'C2' })).toBe(true)
    expect(hasProgress({ ...fresh, completedModules: ['C1'] })).toBe(true)
    expect(hasProgress(progressState({ currentModule: 'C1', completedModules: [] }))).toBe(true)
  })
})
