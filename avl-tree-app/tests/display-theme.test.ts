import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { DEFAULT_THEME, THEMES, parseTheme } from '../src/ui/theme'
import {
  APP_PREFIX,
  LEARNER_KEY,
  SETTINGS_KEY,
  STORAGE_INVENTORY,
  createLearnerStorage,
  createSettingsStorage,
  memoryBackend,
  type KeyValueBackend,
} from '../src/state/storage'

// Spec: add-dark-mode-toggle / display-theme. Requirement IDs: NFR-02, NFR-05, FR-ONB-04, D16, D18.

const throwing = (): KeyValueBackend => {
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

/** Records every key written, over a memory backend. */
function recording() {
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
  return { backend, written, inner }
}

describe('NFR-02 light by default', () => {
  it('the themes are light and dark, light is the default', () => {
    expect([...THEMES]).toEqual(['light', 'dark'])
    expect(DEFAULT_THEME).toBe('light')
  })

  it('parseTheme keeps known themes and turns anything else into the default', () => {
    expect(parseTheme('dark')).toBe('dark')
    expect(parseTheme('light')).toBe('light')
    for (const bad of ['purple', '', null, undefined, 3, {}]) expect(parseTheme(bad)).toBe('light')
  })

  it('index.html keeps data-theme="light"', () => {
    expect(readFileSync('index.html', 'utf8')).toMatch(/<html[^>]*\bdata-theme="light"/)
  })
})

describe('D16 the choice is kept as a setting', () => {
  it('no stored settings loads light', () => {
    expect(createSettingsStorage(memoryBackend()).load().theme).toBe('light')
  })

  it('a saved dark theme loads as dark on the next start', () => {
    const b = memoryBackend()
    createSettingsStorage(b).save({ theme: 'dark' })
    expect(createSettingsStorage(b).load().theme).toBe('dark')
  })

  it('an unknown theme or text that is not JSON loads as light', () => {
    for (const raw of ['{"theme":"purple"}', 'not json', '[]', 'null']) {
      const b = memoryBackend()
      b.setItem(SETTINGS_KEY, raw)
      expect(createSettingsStorage(b).load(), raw).toMatchObject({ theme: 'light' })
    }
  })

  it('a backend that throws never throws out; the choice holds for the session', () => {
    const s = createSettingsStorage(throwing())
    expect(s.load().theme).toBe('light')
    expect(() => s.save({ theme: 'dark' })).not.toThrow()
    expect(s.load().theme).toBe('dark')
  })

  it('no backend at all works for the session', () => {
    const s = createSettingsStorage(null)
    s.save({ theme: 'dark' })
    expect(s.load().theme).toBe('dark')
  })
})

describe('NFR-05 the settings key is inventoried', () => {
  it('every key written is in the inventory, and the value holds only the theme', () => {
    const { backend, written, inner } = recording()
    createSettingsStorage(backend).save({ theme: 'dark' })
    const listed = STORAGE_INVENTORY.map((e) => e.key)
    expect(written.size).toBeGreaterThan(0)
    for (const k of written) {
      expect(listed, k).toContain(k)
      expect(k.startsWith(APP_PREFIX)).toBe(true)
    }
    const entry = STORAGE_INVENTORY.find((e) => e.key === SETTINGS_KEY)
    expect(entry?.description.length).toBeGreaterThan(0)
    expect(JSON.parse(inner.getItem(SETTINGS_KEY)!)).toMatchObject({ theme: 'dark' })
  })
})

describe('FR-ONB-04 reset removes the settings key', () => {
  it('learner reset clears the setting, so the next load is light', () => {
    const b = memoryBackend()
    const learner = createLearnerStorage(b)
    learner.load()
    createSettingsStorage(b).save({ theme: 'dark' })
    learner.reset()
    expect(b.getItem(SETTINGS_KEY)).toBeNull()
    expect(b.getItem(LEARNER_KEY)).not.toBeNull()
    expect(createSettingsStorage(b).load().theme).toBe('light')
  })
})
