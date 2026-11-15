/**
 * Session-level learner state (SE §6.2 learnerReducer). Pure: no React, no storage.
 * Only the actions this change needs; later screens add their own.
 */
import { MODULE_IDS, OWN_LECTURE_QUESTION, OWN_QUESTION_MAX_LENGTH, parseAttempt, type Attempt, type LearnerState, type LectureQuestion, type ModuleId } from './learnerState'
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
  /** Edit or remove one of the student's own questions, found by its time (revamp-readiness, D143). Drafted questions never change. */
  | { type: 'lecture-question-edited'; at: string; text: string }
  | { type: 'lecture-question-removed'; at: string }

const isOwnAt = (q: LectureQuestion, at: string) => q.questionId === OWN_LECTURE_QUESTION && q.at === at

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
    case 'lecture-question-edited': {
      // Trimmed and capped as a new own question is; a blank edit changes nothing (D143).
      const text = action.text.trim().slice(0, OWN_QUESTION_MAX_LENGTH)
      const existing = state.learner.lectureQuestions
      if (text === '' || !existing.some((q) => isOwnAt(q, action.at))) return state
      return { ...state, learner: { ...state.learner, lectureQuestions: existing.map((q) => (isOwnAt(q, action.at) ? { ...q, text } : q)) } }
    }
    case 'lecture-question-removed': {
      const existing = state.learner.lectureQuestions
      if (!existing.some((q) => isOwnAt(q, action.at))) return state
      return { ...state, learner: { ...state.learner, lectureQuestions: existing.filter((q) => !isOwnAt(q, action.at)) } }
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
      // The current module is the first lesson, C1 to C9, not yet completed; unchanged when all nine are done
      // (fix-sidebar-current-lesson, D164; C7 counts like any lesson here and still never blocks C8 or Ready).
      const completedModules = [...learner.completedModules, action.module]
      const currentModule = MODULE_IDS.find((id) => !completedModules.includes(id)) ?? learner.currentModule
      return { ...state, learner: { ...learner, completedModules, currentModule } }
    }
  }
}

/** Saved progress: past C1, a module completed, or an attempt recorded (wireframe 1b note 2). */
export function hasProgress(learner: LearnerState): boolean {
  return learner.currentModule !== 'C1' || learner.completedModules.length > 0 || learner.attempts.length > 0
}
