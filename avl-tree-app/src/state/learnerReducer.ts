/**
 * Session-level learner state (SE §6.2 learnerReducer). Pure: no React, no storage.
 * Only the actions this change needs; later screens add their own.
 */
import { subSkillStatus } from '../assessment/mastery'
import { ALL_ITEMS } from '../content/questions/bank'
import { OWN_LECTURE_QUESTION } from '../modules/config'
import { MODULE_IDS, type LearnerPath, parseAttempt, type Attempt, type LearnerState, type LectureQuestion, type ModuleId } from './learnerState'
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
  | { type: 'path-set'; path: LearnerPath; currentModule?: ModuleId }

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
      const attempts = [...state.learner.attempts, attempt]
      // The sub-skill's status follows the attempt in the same change (FR-SCA-01).
      const item = ALL_ITEMS.find((i) => i.id === attempt.questionId)
      const status = item === undefined ? null : subSkillStatus(attempts, item.subSkill)
      const subSkillStatuses = item === undefined || status === null ? state.learner.subSkillStatus : { ...state.learner.subSkillStatus, [item.subSkill]: status }
      return { ...state, learner: { ...state.learner, attempts, subSkillStatus: subSkillStatuses } }
    }
    case 'path-set': {
      const { learner } = state
      const currentModule = action.currentModule ?? learner.currentModule
      if (learner.path === action.path && learner.currentModule === currentModule) return state
      return { ...state, learner: { ...learner, path: action.path, currentModule } }
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
