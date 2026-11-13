import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  MODULE_IDS,
  SCHEMA_VERSION,
  type Attempt,
  type LearnerState,
  type LectureQuestion,
} from '../../src/state/learnerState'
import { learnerReducer, type SessionState } from '../../src/state/learnerReducer'
import {
  APP_PREFIX,
  LEARNER_KEY,
  STORAGE_INVENTORY,
  createLearnerStorage,
  memoryBackend,
  type KeyValueBackend,
} from '../../src/state/storage'

/** Predictable profile IDs for tests. */
function counterIds(prefix = 'id'): () => string {
  let n = 0
  return () => `${prefix}-${++n}`
}

function sampleState(overrides: Partial<LearnerState> = {}): LearnerState {
  return {
    schemaVersion: 1,
    profileId: 'profile-abc',
    nickname: 'Rotator',
    path: 'guided',
    currentModule: 'C4',
    completedModules: ['C1', 'C2', 'C3'],
    attempts: [
      {
        questionId: 'c3-q1',
        at: '2026-11-10T10:00:00.000Z',
        answer: 'b',
        correct: false,
        confidence: 'sure',
        misconceptionId: 'bf-sign-flipped',
        hintsUsed: 1,
      },
      {
        questionId: 'c3-q2',
        at: '2026-11-10T10:01:00.000Z',
        answer: { keys: [3, 2, 1] },
        correct: true,
        hintsUsed: 0,
      },
    ],
    subSkillStatus: { 'bf-compute': 'developing', 'height-count': 'secure' },
    lectureQuestions: [],
    ...overrides,
  }
}

function expectFresh(state: LearnerState) {
  expect(state.schemaVersion).toBe(1)
  expect(typeof state.profileId).toBe('string')
  expect(state.profileId.length).toBeGreaterThan(0)
  expect(state.nickname).toBeUndefined()
  expect(state.path).toBe('guided')
  expect(state.currentModule).toBe('C1')
  expect(state.completedModules).toEqual([])
  expect(state.attempts).toEqual([])
  expect(state.subSkillStatus).toEqual({})
  expect(state.lectureQuestions).toEqual([])
}

/** A backend whose every call throws, like blocked storage in some private modes. */
function throwingBackend(): KeyValueBackend {
  const fail = () => {
    throw new Error('SecurityError: storage is blocked')
  }
  return {
    getItem: fail,
    setItem: fail,
    removeItem: fail,
    key: fail,
    get length(): number {
      return fail()
    },
  }
}

/** A working backend whose setItem throws a quota error once `full` is set. */
function fillableBackend() {
  const inner = memoryBackend()
  const control = { full: false }
  const backend: KeyValueBackend = {
    getItem: (k) => inner.getItem(k),
    setItem: (k, v) => {
      if (control.full) throw new DOMException('quota exceeded', 'QuotaExceededError')
      inner.setItem(k, v)
    },
    removeItem: (k) => inner.removeItem(k),
    key: (i) => inner.key(i),
    get length() {
      return inner.length
    },
  }
  return { backend, control }
}

/** Records every key written through setItem. */
function recordingBackend() {
  const inner = memoryBackend()
  const written = new Set<string>()
  const backend: KeyValueBackend = {
    getItem: (k) => inner.getItem(k),
    setItem: (k, v) => {
      written.add(k)
      inner.setItem(k, v)
    },
    removeItem: (k) => inner.removeItem(k),
    key: (i) => inner.key(i),
    get length() {
      return inner.length
    },
  }
  return { backend, written }
}

// ---------- arbitraries ----------

const moduleArb = fc.constantFrom(...MODULE_IDS)
const statusArb = fc.constantFrom('secure' as const, 'developing' as const, 'not-yet' as const)
const jsonValueArb = fc.jsonValue().map((v) => JSON.parse(JSON.stringify(v)) as unknown)

const attemptArb: fc.Arbitrary<Attempt> = fc
  .record(
    {
      questionId: fc.string({ minLength: 1 }),
      at: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
      answer: jsonValueArb,
      correct: fc.boolean(),
      confidence: fc.constantFrom('sure' as const, 'unsure' as const),
      misconceptionId: fc.string({ minLength: 1 }),
      hintsUsed: fc.nat(10),
    },
    { requiredKeys: ['questionId', 'at', 'answer', 'correct', 'hintsUsed'] },
  )

const lectureQuestionArb: fc.Arbitrary<LectureQuestion> = fc.record(
  {
    questionId: fc.string({ minLength: 1 }),
    module: moduleArb,
    at: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
    text: fc.string({ minLength: 1 }),
    misconceptionId: fc.string({ minLength: 1 }),
  },
  { requiredKeys: ['questionId', 'module', 'at', 'text'] },
)

const stateArb: fc.Arbitrary<LearnerState> = fc.record(
  {
    schemaVersion: fc.constant(1),
    profileId: fc.string({ minLength: 1 }),
    nickname: fc.string({ maxLength: 40 }),
    path: fc.constantFrom('guided' as const, 'diagnostic-skipped' as const),
    currentModule: moduleArb,
    completedModules: fc.uniqueArray(moduleArb),
    attempts: fc.array(attemptArb, { maxLength: 8 }),
    subSkillStatus: fc.dictionary(fc.string({ minLength: 1 }), statusArb),
    lectureQuestions: fc.array(lectureQuestionArb, { maxLength: 4 }),
  },
  { requiredKeys: ['schemaVersion', 'profileId', 'path', 'currentModule', 'completedModules', 'attempts', 'subSkillStatus', 'lectureQuestions'] },
)

function normaliseNickname(n: string | undefined): string | undefined {
  if (n === undefined) return undefined
  const t = n.trim().slice(0, 24)
  return t === '' ? undefined : t
}

// ---------- FR-ONB-02 ----------

describe('FR-ONB-02: anonymous profile on first launch', () => {
  it('first launch creates and saves a fresh state', () => {
    const backend = memoryBackend()
    const store = createLearnerStorage(backend, { randomId: counterIds() })
    const { state, status } = store.load()
    expect(status).toBe('new')
    expect(SCHEMA_VERSION).toBe(1)
    expectFresh(state)
    const raw = backend.getItem(LEARNER_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toEqual(state)
  })

  it('profile IDs are random (default generator)', () => {
    const a = createLearnerStorage(memoryBackend()).load().state
    const b = createLearnerStorage(memoryBackend()).load().state
    expect(a.profileId).not.toBe(b.profileId)
  })
})

describe('FR-ONB-02, NFR-05: no personal identifiers stored', () => {
  it('only model fields are written', () => {
    const backend = memoryBackend()
    const store = createLearnerStorage(backend, { randomId: counterIds() })
    const withExtra = { ...sampleState(), email: 'student@example.com' } as LearnerState
    store.save(withExtra)
    const stored = JSON.parse(backend.getItem(LEARNER_KEY)!) as Record<string, unknown>
    expect(Object.keys(stored).sort()).toEqual(
      [
        'attempts',
        'completedModules',
        'currentModule',
        'lectureQuestions',
        'nickname',
        'path',
        'profileId',
        'schemaVersion',
        'subSkillStatus',
      ].sort(),
    )
    expect(JSON.stringify(stored)).not.toContain('student@example.com')
  })

  it('nickname is trimmed and capped at 24 characters', () => {
    const backend = memoryBackend()
    createLearnerStorage(backend).save(sampleState({ nickname: '  Rotation fan extraordinaire 2026  ' }))
    const { state } = createLearnerStorage(backend).load()
    expect(state.nickname).toBe('Rotation fan extraordina')
  })

  it('blank nickname is stored as no nickname', () => {
    const backend = memoryBackend()
    createLearnerStorage(backend).save(sampleState({ nickname: '   ' }))
    const { state } = createLearnerStorage(backend).load()
    expect(state.nickname).toBeUndefined()
    expect(backend.getItem(LEARNER_KEY)).not.toContain('nickname')
  })
})

// ---------- FR-ONB-03 ----------

describe('FR-ONB-03: restore after reload', () => {
  it('round trip on a new adapter over the same storage', () => {
    const backend = memoryBackend()
    const saved = sampleState()
    createLearnerStorage(backend).save(saved)
    const { state, status } = createLearnerStorage(backend).load()
    expect(status).toBe('restored')
    expect(state).toEqual(saved)
  })

  it('any valid state survives a round trip (property)', () => {
    fc.assert(
      fc.property(stateArb, (s) => {
        const backend = memoryBackend()
        createLearnerStorage(backend).save(s)
        const { state, status } = createLearnerStorage(backend).load()
        expect(status).toBe('restored')
        const expected: LearnerState = { ...s }
        const nick = normaliseNickname(s.nickname)
        if (nick === undefined) delete expected.nickname
        else expected.nickname = nick
        expect(state).toEqual(expected)
      }),
      { numRuns: 200 },
    )
  })

  it('last save wins', () => {
    const backend = memoryBackend()
    const store = createLearnerStorage(backend)
    store.save(sampleState({ currentModule: 'C4' }))
    store.save(sampleState({ currentModule: 'C6' }))
    expect(createLearnerStorage(backend).load().state.currentModule).toBe('C6')
  })
})

// ---------- NFR-06 ----------

describe('NFR-06: stored data is validated on load', () => {
  it('unreadable JSON resets and does not throw', () => {
    const backend = memoryBackend()
    backend.setItem(LEARNER_KEY, '{not json')
    const store = createLearnerStorage(backend, { randomId: counterIds() })
    const result = store.load()
    expect(result.status).toBe('reset-corrupt')
    expectFresh(result.state)
    expect(JSON.parse(backend.getItem(LEARNER_KEY)!)).toEqual(result.state)
  })

  it('unknown schema version resets', () => {
    const backend = memoryBackend()
    backend.setItem(LEARNER_KEY, JSON.stringify({ ...sampleState(), schemaVersion: 2 }))
    const result = createLearnerStorage(backend).load()
    expect(result.status).toBe('reset-corrupt')
    expectFresh(result.state)
  })

  const tamperings: [string, (s: Record<string, unknown>) => void][] = [
    ['currentModule C10', (s) => (s.currentModule = 'C10')],
    ['path skipped', (s) => (s.path = 'skipped')],
    ['completedModules a string', (s) => (s.completedModules = 'C1')],
    ['sub-skill status mastered', (s) => (s.subSkillStatus = { 'bf-compute': 'mastered' })],
    ['attempt correct "yes"', (s) => ((s.attempts as Record<string, unknown>[])[0].correct = 'yes')],
    ['attempt confidence maybe', (s) => ((s.attempts as Record<string, unknown>[])[0].confidence = 'maybe')],
    ['attempt hintsUsed -1', (s) => ((s.attempts as Record<string, unknown>[])[0].hintsUsed = -1)],
    ['profileId empty', (s) => (s.profileId = '')],
  ]

  it.each(tamperings)('tampered field resets: %s', (_label, tamper) => {
    const backend = memoryBackend()
    const raw = JSON.parse(JSON.stringify(sampleState())) as Record<string, unknown>
    tamper(raw)
    backend.setItem(LEARNER_KEY, JSON.stringify(raw))
    const result = createLearnerStorage(backend).load()
    expect(result.status).toBe('reset-corrupt')
    expectFresh(result.state)
  })

  it('fuzzed storage never crashes (property)', () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), fc.json(), jsonValueArb.map((v) => JSON.stringify(v))), (raw) => {
        const backend = memoryBackend()
        backend.setItem(LEARNER_KEY, raw)
        const result = createLearnerStorage(backend).load()
        expect(['restored', 'reset-corrupt']).toContain(result.status)
        expect(MODULE_IDS).toContain(result.state.currentModule)
        expect(result.state.schemaVersion).toBe(1)
      }),
      { numRuns: 300 },
    )
  })
})

describe('NFR-06: works when storage is unavailable', () => {
  it('storage that throws on every access', () => {
    const store = createLearnerStorage(throwingBackend(), { randomId: counterIds() })
    let loaded!: LearnerState
    expect(() => {
      loaded = store.load().state
    }).not.toThrow()
    expectFresh(loaded)
    expect(store.isPersistent()).toBe(false)
    const next = sampleState({ profileId: loaded.profileId })
    expect(() => store.save(next)).not.toThrow()
    expect(store.load().state).toEqual(next)
    expect(() => store.reset()).not.toThrow()
  })

  it('storage full on save falls back to memory', () => {
    const { backend, control } = fillableBackend()
    const store = createLearnerStorage(backend)
    store.load()
    expect(store.isPersistent()).toBe(true)
    control.full = true
    const next = sampleState()
    expect(() => store.save(next)).not.toThrow()
    expect(store.isPersistent()).toBe(false)
    expect(store.load().state).toEqual(next)
  })
})

// ---------- FR-ONB-04 ----------

describe('FR-ONB-04: reset clears all stored data', () => {
  it('removes every app key, keeps other apps, returns a fresh saved state', () => {
    const backend = memoryBackend()
    const store = createLearnerStorage(backend, { randomId: counterIds('p') })
    const before = store.load().state
    store.save({ ...sampleState(), profileId: before.profileId })
    backend.setItem('other-app', 'keep me')
    backend.setItem(`${APP_PREFIX}extra`, 'remove me')

    const fresh = store.reset()

    expect(backend.getItem(`${APP_PREFIX}extra`)).toBeNull()
    expect(backend.getItem('other-app')).toBe('keep me')
    expectFresh(fresh)
    expect(fresh.profileId).not.toBe(before.profileId)
    const after = createLearnerStorage(backend).load()
    expect(after.status).toBe('restored')
    expect(after.state).toEqual(fresh)
  })
})

// ---------- NFR-05 inventory ----------

describe('NFR-05: stored-data inventory', () => {
  it('every written key is listed and prefixed', () => {
    const { backend, written } = recordingBackend()
    const store = createLearnerStorage(backend)
    store.load()
    store.save(sampleState())
    store.reset()
    const listed = STORAGE_INVENTORY.map((e) => e.key)
    expect(written.size).toBeGreaterThan(0)
    for (const key of written) {
      expect(listed).toContain(key)
      expect(key.startsWith(APP_PREFIX)).toBe(true)
    }
  })

  it('every entry has a key and a description', () => {
    expect(STORAGE_INVENTORY.length).toBeGreaterThan(0)
    for (const entry of STORAGE_INVENTORY) {
      expect(entry.key.length).toBeGreaterThan(0)
      expect(entry.description.trim().length).toBeGreaterThan(0)
    }
  })
})

// ---------- regressions from the fresh-context review ----------

describe('FR-ONB-03: round-trip edge cases (review)', () => {
  it('a sub-skill named "__proto__" survives a round trip', () => {
    const backend = memoryBackend()
    const saved = sampleState({
      subSkillStatus: Object.fromEntries([['__proto__', 'secure']]) as LearnerState['subSkillStatus'],
    })
    createLearnerStorage(backend).save(saved)
    const { state, status } = createLearnerStorage(backend).load()
    expect(status).toBe('restored')
    expect(Object.keys(state.subSkillStatus)).toEqual(['__proto__'])
    expect(state).toEqual(saved)
  })

  it('the round-trip property holds on the seed the review found (124854234)', () => {
    fc.assert(
      fc.property(stateArb, (s) => {
        const backend = memoryBackend()
        createLearnerStorage(backend).save(s)
        const { status } = createLearnerStorage(backend).load()
        expect(status).toBe('restored')
      }),
      { seed: 124854234, numRuns: 200 },
    )
  })

  it('an attempt with an undefined answer does not wipe progress', () => {
    const backend = memoryBackend()
    const saved = sampleState()
    saved.attempts[1] = { ...saved.attempts[1], answer: undefined }
    createLearnerStorage(backend).save(saved)
    const { state, status } = createLearnerStorage(backend).load()
    expect(status).toBe('restored')
    expect(state.attempts).toHaveLength(2)
    expect(state.attempts[1].answer).toBeUndefined()
  })
})

describe('NFR-06: robustness edge cases (review)', () => {
  it('an attempt time that is not a date is corrupt', () => {
    const backend = memoryBackend()
    const raw = JSON.parse(JSON.stringify(sampleState())) as { attempts: { at: string }[] }
    raw.attempts[0].at = 'yesterday-ish'
    backend.setItem(LEARNER_KEY, JSON.stringify(raw))
    expect(createLearnerStorage(backend).load().status).toBe('reset-corrupt')
  })

  it('after falling back to memory, storage is not retried', () => {
    const { backend, control } = fillableBackend()
    const store = createLearnerStorage(backend)
    const first = store.load().state
    const storedBefore = backend.getItem(LEARNER_KEY)
    control.full = true
    store.save(sampleState({ profileId: first.profileId, currentModule: 'C5' }))
    control.full = false
    store.save(sampleState({ profileId: first.profileId, currentModule: 'C6' }))
    expect(store.isPersistent()).toBe(false)
    expect(backend.getItem(LEARNER_KEY)).toBe(storedBefore)
    expect(store.load().state.currentModule).toBe('C6')
  })

  it('load and reset do not throw when crypto is missing', () => {
    const original = globalThis.crypto
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true })
    try {
      const store = createLearnerStorage(memoryBackend())
      expect(() => store.load()).not.toThrow()
      expect(() => store.reset()).not.toThrow()
      expect(store.load().state.profileId.length).toBeGreaterThan(0)
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true })
    }
  })
})

// ---------- add-scaffold-ladder-and-retry-cap: lecture questions (FR-SCA-03, NFR-06, D9) ----------

const LQ_WITH: LectureQuestion = {
  questionId: 'chk3-bf',
  module: 'C3',
  at: '2026-11-13T10:00:00.000Z',
  text: 'My answer subtracts the subtree heights in the other order. Could we go through this one?',
  misconceptionId: 'M-BF-SIGN',
}
const LQ_WITHOUT: LectureQuestion = { questionId: 'chk6-tree', module: 'C6', at: '2026-11-13T10:05:00.000Z', text: 'Could we go through this one?' }

describe('FR-SCA-03: lecture questions are stored', () => {
  it('round trip with and without a misconception', () => {
    const backend = memoryBackend()
    const saved = sampleState({ lectureQuestions: [LQ_WITH, LQ_WITHOUT] })
    createLearnerStorage(backend).save(saved)
    const { state, status } = createLearnerStorage(backend).load()
    expect(status).toBe('restored')
    expect(state).toEqual(saved)
  })

  it('an older stored state without the field still loads', () => {
    const backend = memoryBackend()
    const raw = JSON.parse(JSON.stringify(sampleState())) as Record<string, unknown>
    delete raw.lectureQuestions
    backend.setItem(LEARNER_KEY, JSON.stringify(raw))
    const { state, status } = createLearnerStorage(backend).load()
    expect(status).toBe('restored')
    expect(state.schemaVersion).toBe(1)
    expect(state).toEqual(sampleState({ lectureQuestions: [] }))
  })

  const malformed: [string, (s: Record<string, unknown>) => void][] = [
    ['lectureQuestions a string', (s) => (s.lectureQuestions = 'ask about rotations')],
    ['an entry with module C10', (s) => (s.lectureQuestions = [{ ...LQ_WITH, module: 'C10' }])],
    ['an entry with empty text', (s) => (s.lectureQuestions = [{ ...LQ_WITH, text: '' }])],
    ['an entry with a numeric question ID', (s) => (s.lectureQuestions = [{ ...LQ_WITH, questionId: 7 }])],
  ]

  it.each(malformed)('malformed lecture question resets: %s', (_label, tamper) => {
    const backend = memoryBackend()
    const raw = JSON.parse(JSON.stringify(sampleState())) as Record<string, unknown>
    tamper(raw)
    backend.setItem(LEARNER_KEY, JSON.stringify(raw))
    const result = createLearnerStorage(backend).load()
    expect(result.status).toBe('reset-corrupt')
    expectFresh(result.state)
  })

  it('recorded through the session', () => {
    const before: SessionState = { learner: sampleState({ lectureQuestions: [LQ_WITHOUT] }), loadStatus: 'restored', persistent: true }
    const after = learnerReducer(before, { type: 'lecture-question', question: LQ_WITH })
    expect(after.learner.lectureQuestions).toEqual([LQ_WITHOUT, LQ_WITH])
    expect({ ...after.learner, lectureQuestions: [] }).toEqual({ ...before.learner, lectureQuestions: [] })
    expect(after.loadStatus).toBe('restored')
    expect(after.persistent).toBe(true)
  })

  it('the inventory describes lecture questions', () => {
    const learner = STORAGE_INVENTORY.find((e) => e.key === LEARNER_KEY)!
    expect(learner.description).toMatch(/lecture/i)
  })
})
