// Shared fixtures for the add-learner-storage-ui tests (learner-session, start-screen).
import { render } from '@testing-library/react'
import { StrictMode, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { LearnerState } from '../../src/state/learnerState'
import {
  LEARNER_KEY,
  createLearnerStorage,
  memoryBackend,
  type KeyValueBackend,
  type StorageAdapter,
} from '../../src/state/storage'
import { LearnerProvider } from '../../src/state/LearnerContext'
import { AppRoutes } from '../../src/App'

export function counterIds(prefix = 'id'): () => string {
  let n = 0
  return () => `${prefix}-${++n}`
}

export function progressState(overrides: Partial<LearnerState> = {}): LearnerState {
  return {
    schemaVersion: 1,
    profileId: 'profile-abc',
    path: 'guided',
    currentModule: 'C4',
    completedModules: ['C1', 'C2', 'C3'],
    attempts: [
      { questionId: 'c3-q1', at: '2026-11-10T10:00:00.000Z', answer: 'b', correct: false, confidence: 'sure', hintsUsed: 1 },
      { questionId: 'c3-q2', at: '2026-11-10T10:01:00.000Z', answer: { keys: [3, 2, 1] }, correct: true, hintsUsed: 0 },
    ],
    subSkillStatus: { 'bf-compute': 'developing', 'height-count': 'secure' },
    lectureQuestions: [],
    ...overrides,
  }
}

/** A memory backend holding a value at the learner key (a state is serialised). */
export function backendWith(value?: LearnerState | string): KeyValueBackend {
  const b = memoryBackend()
  if (value !== undefined) b.setItem(LEARNER_KEY, typeof value === 'string' ? value : JSON.stringify(value))
  return b
}

/** A backend whose every call throws (blocked storage, some private modes). */
export function throwingBackend(): KeyValueBackend {
  const boom = () => {
    throw new Error('SecurityError')
  }
  return {
    getItem: boom,
    setItem: boom,
    removeItem: boom,
    key: boom,
    get length(): number {
      return boom()
    },
  }
}

/** Wraps a backend, counting reads and allowing setItem to start failing (quota). */
export function controllableBackend(inner: KeyValueBackend = memoryBackend()) {
  const counts = { getItem: 0, setItem: 0 }
  const control = { failWrites: false }
  const backend: KeyValueBackend = {
    getItem: (k) => {
      counts.getItem++
      return inner.getItem(k)
    },
    setItem: (k, v) => {
      counts.setItem++
      if (control.failWrites) throw new DOMException('full', 'QuotaExceededError')
      inner.setItem(k, v)
    },
    removeItem: (k) => inner.removeItem(k),
    key: (i) => inner.key(i),
    get length() {
      return inner.length
    },
  }
  return { backend, counts, control, inner }
}

/** One app start: build the adapter and load once, as main.tsx does. */
export function boot(backend: KeyValueBackend | null) {
  const storage: StorageAdapter = createLearnerStorage(backend, { randomId: counterIds('fresh') })
  const initial = storage.load()
  return { storage, initial }
}

export function renderRoutes(backend: KeyValueBackend | null, path = '/', extra?: ReactNode) {
  const booted = boot(backend)
  const result = render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <LearnerProvider storage={booted.storage} initial={booted.initial}>
          <AppRoutes />
          {extra}
        </LearnerProvider>
      </MemoryRouter>
    </StrictMode>,
  )
  return { ...result, ...booted }
}
