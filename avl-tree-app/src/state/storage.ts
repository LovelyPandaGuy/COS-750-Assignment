/**
 * StorageAdapter (D16, SE §6.2): the only module that touches browser
 * storage (NFR-05). Load never throws; bad stored data gives a fresh state
 * (NFR-06); blocked or full storage falls back to memory for the session.
 */
import { parseTheme, type Theme } from '../ui/theme'
import { freshLearnerState, normaliseNickname, parseLearnerState, type LearnerState } from './learnerState'

/** The subset of the Web Storage API the app needs. */
export interface KeyValueBackend {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  key(index: number): string | null
  readonly length: number
}

export const APP_PREFIX = 'avl-primer:'
export const LEARNER_KEY = `${APP_PREFIX}learner`
/** Display settings (add-dark-mode-toggle). Holds only the theme. */
export const SETTINGS_KEY = `${APP_PREFIX}settings`

export interface StoredKey {
  key: string
  description: string
}

/** Every key the app may store, for the privacy notice and POPIA records (NFR-05, FR-ONB-05). */
export const STORAGE_INVENTORY: readonly StoredKey[] = [
  {
    key: LEARNER_KEY,
    description:
      'Your progress: a random profile ID, your optional nickname, the module you are on, the modules you have finished, your answers with confidence and hints used, and how secure each skill is. It stays in this browser and is never sent anywhere.',
  },
  {
    key: SETTINGS_KEY,
    description: 'Your display choice: the light or dark theme. It stays in this browser and is never sent anywhere.',
  },
]

export type LoadStatus = 'new' | 'restored' | 'reset-corrupt'

export interface LoadResult {
  state: LearnerState
  status: LoadStatus
}

export interface StorageAdapter {
  load(): LoadResult
  save(state: LearnerState): void
  /** Remove every app key and return a fresh, saved state with a new profile ID (FR-ONB-04). */
  reset(): LearnerState
  /** False once storage has failed and progress is held in memory only. */
  isPersistent(): boolean
}

export interface LearnerStorageOptions {
  randomId?: () => string
}

/** A Map-backed backend, for tests and for the in-memory fallback. */
export function memoryBackend(): KeyValueBackend {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
    key: (index) => [...map.keys()][index] ?? null,
    get length() {
      return map.size
    },
  }
}

/**
 * The browser's localStorage, or null when it cannot be reached. Merely
 * reading `window.localStorage` can throw in some private modes.
 */
export function browserBackend(): KeyValueBackend | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null
  } catch {
    return null
  }
}

/** A random profile ID. Never throws, so load and reset never throw (NFR-06). */
function defaultRandomId(): string {
  try {
    const c = globalThis.crypto
    if (typeof c?.randomUUID === 'function') return c.randomUUID()
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  }
}

/** Serialise only the model's fields (strips extras; normalises the nickname). */
function serialise(state: LearnerState): string {
  const out: LearnerState = {
    schemaVersion: state.schemaVersion,
    profileId: state.profileId,
    path: state.path,
    currentModule: state.currentModule,
    completedModules: state.completedModules,
    attempts: state.attempts.map((a) => {
      const attempt: LearnerState['attempts'][number] = {
        questionId: a.questionId,
        at: a.at,
        answer: a.answer,
        correct: a.correct,
        hintsUsed: a.hintsUsed,
      }
      if (a.confidence !== undefined) attempt.confidence = a.confidence
      if (a.misconceptionId !== undefined) attempt.misconceptionId = a.misconceptionId
      return attempt
    }),
    subSkillStatus: state.subSkillStatus,
  }
  const nickname = normaliseNickname(state.nickname)
  if (nickname !== undefined) out.nickname = nickname
  return JSON.stringify(out)
}

/** Create the learner StorageAdapter over a backend (null means none available). */
export function createLearnerStorage(
  backend: KeyValueBackend | null,
  options: LearnerStorageOptions = {},
): StorageAdapter {
  const randomId = options.randomId ?? defaultRandomId
  let active: KeyValueBackend = backend ?? memoryBackend()
  let persistent = backend !== null
  /** The last value read or written, used to seed the memory fallback. */
  let lastValue: string | null = null

  /** Run a backend call; on the first failure switch to memory for the session. */
  function guard<T>(op: (b: KeyValueBackend) => T, onFallback: (b: KeyValueBackend) => T): T {
    try {
      return op(active)
    } catch {
      if (persistent) {
        persistent = false
        active = memoryBackend()
        if (lastValue !== null) active.setItem(LEARNER_KEY, lastValue)
      }
      return onFallback(active)
    }
  }

  function write(state: LearnerState): void {
    const value = serialise(state)
    lastValue = value
    guard(
      (b) => b.setItem(LEARNER_KEY, value),
      (b) => b.setItem(LEARNER_KEY, value),
    )
  }

  function read(): string | null {
    const raw = guard(
      (b) => b.getItem(LEARNER_KEY),
      (b) => b.getItem(LEARNER_KEY),
    )
    if (raw !== null) lastValue = raw
    return raw
  }

  function startFresh(): LearnerState {
    const state = freshLearnerState(randomId())
    write(state)
    return state
  }

  function removeAppKeys(b: KeyValueBackend): void {
    const keys: string[] = []
    for (let i = 0; i < b.length; i++) {
      const k = b.key(i)
      if (k !== null && k.startsWith(APP_PREFIX)) keys.push(k)
    }
    for (const k of keys) b.removeItem(k)
  }

  return {
    load() {
      const raw = read()
      if (raw === null) return { state: startFresh(), status: 'new' }
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        return { state: startFresh(), status: 'reset-corrupt' }
      }
      const state = parseLearnerState(parsed)
      if (state === null) return { state: startFresh(), status: 'reset-corrupt' }
      return { state, status: 'restored' }
    },

    save(state) {
      write(state)
    },

    reset() {
      lastValue = null
      guard(removeAppKeys, removeAppKeys)
      return startFresh()
    },

    isPersistent() {
      return persistent
    },
  }
}

// ---- Display settings (add-dark-mode-toggle, design decision 4) ----

export interface Settings {
  theme: Theme
}

export interface SettingsStorage {
  /** Never throws; a missing or damaged value gives the default theme. */
  load(): Settings
  /** Never throws; when storage fails the choice is kept in memory for the session. */
  save(settings: Settings): void
}

/** Settings over a backend (null means none available). The learner reset removes this key too. */
export function createSettingsStorage(backend: KeyValueBackend | null): SettingsStorage {
  let memory: Settings | null = null
  let persistent = backend !== null

  return {
    load() {
      if (memory !== null) return { ...memory }
      if (!persistent || backend === null) return { theme: parseTheme(undefined) }
      try {
        const raw = backend.getItem(SETTINGS_KEY)
        const parsed: unknown = raw === null ? null : JSON.parse(raw)
        const theme = parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as { theme?: unknown }).theme : undefined
        return { theme: parseTheme(theme) }
      } catch {
        return { theme: parseTheme(undefined) }
      }
    },
    save(settings) {
      const value: Settings = { theme: parseTheme(settings.theme) }
      if (persistent && backend !== null) {
        try {
          backend.setItem(SETTINGS_KEY, JSON.stringify(value))
          memory = null
          return
        } catch {
          persistent = false
        }
      }
      memory = value
    },
  }
}
