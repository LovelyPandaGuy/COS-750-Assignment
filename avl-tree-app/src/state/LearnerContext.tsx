/**
 * LearnerContext (SE §6.2): the one shared copy of learner state for the session.
 * It never loads: the caller loads once before render (design decision 1), so the
 * development double-render cannot turn "new" or "reset-corrupt" into "restored".
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import type { LearnerState } from './learnerState'
import { learnerReducer, type SessionStatus } from './learnerReducer'
import type { LoadResult, StorageAdapter } from './storage'

export interface LearnerSession {
  learner: LearnerState
  loadStatus: SessionStatus
  persistent: boolean
  /** Clear stored data and start again with a fresh profile (FR-ONB-04). */
  reset: () => void
}

const Ctx = createContext<LearnerSession | null>(null)

export interface LearnerProviderProps {
  storage: StorageAdapter
  initial: LoadResult
  children?: ReactNode
}

export function LearnerProvider({ storage, initial, children }: LearnerProviderProps) {
  const [state, dispatch] = useReducer(learnerReducer, undefined, () => ({
    learner: initial.state,
    loadStatus: initial.status,
    persistent: storage.isPersistent(),
  }))

  // The last state known to be in storage. Load already saved the initial one, so
  // nothing is written until the state changes, even when StrictMode re-runs effects.
  const saved = useRef(initial.state)
  useEffect(() => {
    if (state.learner !== saved.current) {
      storage.save(state.learner)
      saved.current = state.learner
    }
    dispatch({ type: 'persistence', persistent: storage.isPersistent() })
  }, [state.learner, storage])

  const reset = useCallback(() => {
    const learner = storage.reset()
    saved.current = learner
    dispatch({ type: 'reset', learner })
    dispatch({ type: 'persistence', persistent: storage.isPersistent() })
  }, [storage])

  const value = useMemo<LearnerSession>(
    () => ({ learner: state.learner, loadStatus: state.loadStatus, persistent: state.persistent, reset }),
    [state, reset],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useLearner(): LearnerSession {
  const session = useContext(Ctx)
  if (session === null) throw new Error('useLearner must be used inside LearnerProvider')
  return session
}
