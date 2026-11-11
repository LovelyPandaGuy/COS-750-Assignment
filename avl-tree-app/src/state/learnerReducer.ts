/**
 * Session-level learner state (SE §6.2 learnerReducer). Pure: no React, no storage.
 * Only the actions this change needs; later screens add their own.
 */
import type { LearnerState } from './learnerState'
import type { LoadStatus } from './storage'

/** The load status, or 'reset-by-user' once the student has reset in this session. */
export type SessionStatus = LoadStatus | 'reset-by-user'

export interface SessionState {
  learner: LearnerState
  loadStatus: SessionStatus
  persistent: boolean
}

export type SessionAction =
  | { type: 'reset'; learner: LearnerState }
  | { type: 'persistence'; persistent: boolean }

export function learnerReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'reset':
      return { ...state, learner: action.learner, loadStatus: 'reset-by-user' }
    case 'persistence':
      return state.persistent === action.persistent ? state : { ...state, persistent: action.persistent }
  }
}

/** Saved progress: past C1, a module completed, or an attempt recorded (wireframe 1b note 2). */
export function hasProgress(learner: LearnerState): boolean {
  return learner.currentModule !== 'C1' || learner.completedModules.length > 0 || learner.attempts.length > 0
}
