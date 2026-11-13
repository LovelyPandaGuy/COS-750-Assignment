/**
 * Session-level learner state (SE §6.2 learnerReducer). Pure: no React, no storage.
 * Only the actions this change needs; later screens add their own.
 */
import { MODULE_IDS, parseAttempt, type Attempt, type LearnerState, type ModuleId } from './learnerState'
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
  | { type: 'attempt-recorded'; attempt: Attempt }
  | { type: 'module-completed'; module: ModuleId }

export function learnerReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'reset':
      return { ...state, learner: action.learner, loadStatus: 'reset-by-user' }
    case 'persistence':
      return state.persistent === action.persistent ? state : { ...state, persistent: action.persistent }
    case 'attempt-recorded': {
      // An attempt the validator rejects is never stored (add-checks-and-feedback).
      const attempt = parseAttempt(action.attempt)
      return attempt === null ? state : { ...state, learner: { ...state.learner, attempts: [...state.learner.attempts, attempt] } }
    }
    case 'module-completed': {
      const { learner } = state
      if (learner.completedModules.includes(action.module)) return state
      // The current module moves on only when it was the one just completed.
      const after = MODULE_IDS[MODULE_IDS.indexOf(action.module) + 1]
      const currentModule = learner.currentModule === action.module && after !== undefined ? after : learner.currentModule
      return { ...state, learner: { ...learner, completedModules: [...learner.completedModules, action.module], currentModule } }
    }
  }
}

/** Saved progress: past C1, a module completed, or an attempt recorded (wireframe 1b note 2). */
export function hasProgress(learner: LearnerState): boolean {
  return learner.currentModule !== 'C1' || learner.completedModules.length > 0 || learner.attempts.length > 0
}
