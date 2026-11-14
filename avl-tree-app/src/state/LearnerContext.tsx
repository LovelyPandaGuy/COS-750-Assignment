/**
 * LearnerContext (SE §6.2): the one shared copy of learner state for the session.
 * It never loads: the caller loads once before render (design decision 1), so the
 * development double-render cannot turn "new" or "reset-corrupt" into "restored".
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { OWN_LECTURE_QUESTION, OWN_QUESTION_MAX_LENGTH, type Attempt, type LearnerState, type LectureQuestion, type ModuleId } from './learnerState'
import { learnerReducer, type SessionStatus } from './learnerReducer'
import type { LoadResult, StorageAdapter } from './storage'

export interface LearnerSession {
  learner: LearnerState
  loadStatus: SessionStatus
  persistent: boolean
  /** Clear stored data and start again with a fresh profile (FR-ONB-04). */
  reset: () => void
  /** Save one marked answer (add-checks-and-feedback). It never completes a module. */
  recordAttempt: (attempt: Attempt) => void
  /** Add a module to the completed ones; a repeat changes nothing. */
  completeModule: (module: ModuleId) => void
  /** Save a lecture question; a drafted one is kept once per item (add-scaffold-ladder-and-retry-cap). */
  recordLectureQuestion: (question: LectureQuestion) => void
  /** Set the learning path, and optionally the current module (skipping the diagnostic, FR-DIA-04). */
  /** Add one of the student's own lecture questions, stored as a lecture question with ID `own` (FR-RDY-02, D91); blank text changes nothing. */
  addOwnQuestion: (text: string) => void
  /** Change the text of one own question, found by its time; trimmed and capped, blank changes nothing (D143). */
  editOwnQuestion: (at: string, text: string) => void
  /** Remove one own question, found by its time (D143). Drafted questions are never removed. */
  removeOwnQuestion: (at: string) => void
}

const Ctx = createContext<LearnerSession | null>(null)

export interface LearnerProviderProps {
  storage: StorageAdapter
  initial: LoadResult
  /** Called after stored data is cleared, so other session state can return to its default. */
  onReset?: () => void
  children?: ReactNode
}

export function LearnerProvider({ storage, initial, onReset, children }: LearnerProviderProps) {
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
    onReset?.()
  }, [storage, onReset])

  const recordAttempt = useCallback((attempt: Attempt) => dispatch({ type: 'attempt-recorded', attempt }), [])
  const completeModule = useCallback((module: ModuleId) => dispatch({ type: 'module-completed', module }), [])

  const recordLectureQuestion = useCallback((question: LectureQuestion) => dispatch({ type: 'lecture-question', question }), [])


  const addOwnQuestion = useCallback((text: string) => {
    const trimmed = text.trim().slice(0, OWN_QUESTION_MAX_LENGTH)
    if (trimmed === '') return
    dispatch({ type: 'lecture-question', question: { questionId: OWN_LECTURE_QUESTION, module: 'C9', at: new Date().toISOString(), text: trimmed } })
  }, [])

  const editOwnQuestion = useCallback((at: string, text: string) => dispatch({ type: 'lecture-question-edited', at, text }), [])
  const removeOwnQuestion = useCallback((at: string) => dispatch({ type: 'lecture-question-removed', at }), [])

  const value = useMemo<LearnerSession>(
    () => ({ learner: state.learner, loadStatus: state.loadStatus, persistent: state.persistent, reset, recordAttempt, completeModule, recordLectureQuestion, addOwnQuestion, editOwnQuestion, removeOwnQuestion }),
    [state, reset, recordAttempt, completeModule, recordLectureQuestion, addOwnQuestion, editOwnQuestion, removeOwnQuestion],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useLearner(): LearnerSession {
  const session = useContext(Ctx)
  if (session === null) throw new Error('useLearner must be used inside LearnerProvider')
  return session
}

/** The session when there is one. Components that only read it for an extra (a route suggestion) use this, so they still render alone. */
// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useOptionalLearner(): LearnerSession | null {
  return useContext(Ctx)
}
