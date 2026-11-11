/** One app start: the browser-backed adapter and its single load (FR-ONB-03, NFR-06). */
import { browserBackend, createLearnerStorage, type LoadResult, type StorageAdapter } from './storage'

export interface Booted {
  storage: StorageAdapter
  initial: LoadResult
}

export function bootLearner(): Booted {
  const storage = createLearnerStorage(browserBackend())
  return { storage, initial: storage.load() }
}
