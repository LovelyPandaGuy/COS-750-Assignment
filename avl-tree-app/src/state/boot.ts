/** One app start: the browser-backed adapters and their single load (FR-ONB-03, NFR-06). */
import type { Theme } from '../ui/theme'
import { browserBackend, createLearnerStorage, createSettingsStorage, type LoadResult, type SettingsStorage, type StorageAdapter } from './storage'

export interface Booted {
  storage: StorageAdapter
  initial: LoadResult
  /** Display settings (add-dark-mode-toggle); the theme is applied before the first render. */
  settings: SettingsStorage
  initialTheme: Theme
}

export function bootLearner(): Booted {
  const backend = browserBackend()
  const storage = createLearnerStorage(backend)
  const settings = createSettingsStorage(backend)
  return { storage, initial: storage.load(), settings, initialTheme: settings.load().theme }
}
