/**
 * Session-level learner state (SE §6.2 learnerReducer). Pure: no React, no storage.
 * Only the actions this change needs; later screens add their own.
 */
import { MODULE_IDS, OWN_LECTURE_QUESTION, parseAttempt, type Attempt, type LearnerState, type LectureQuestion, type ModuleId } from './learnerState'
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
  /** A lecture question: drafted at the retry cap (FR-SCA-03) or the student's own, ID `own` (FR-RDY-02, D91). */
  | { type: 'lecture-question'; question: LectureQuestion }

export function learnerReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'reset':
      return { ...state, learner: action.learner, loadStatus: 'reset-by-user' }
    case 'persistence':
      return state.persistent === action.persistent ? state : { ...state, persistent: action.persistent }
    case 'lecture-question': {
      const existing = state.learner.lectureQuestions
      // A drafted question is kept once per item, so a reload at the cap adds nothing; own questions may be many.
      if (action.question.questionId !== OWN_LECTURE_QUESTION && existing.some((q) => q.questionId === action.question.questionId)) return state
      return { ...state, learner: { ...state.learner, lectureQuestions: [...existing, action.question] } }
    }
    case 'attempt-recorded': {
      // An attempt the validator rejects is never stored (add-checks-and-feedback).
      const attempt = parseAttempt(action.attempt)
      if (attempt === null) return state
      // The attempt only: no sub-skill status is kept (learner-session; the ID's mastery is per lesson).
      return { ...state, learner: { ...state.learner, attempts: [...state.learner.attempts, attempt] } }
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
