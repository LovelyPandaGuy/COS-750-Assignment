// Learner states for the state matrix (ui-quality-sweep, design decision 1). Plain data, no JSX, so both
// Playwright (the matrix spec) and Vitest (the coverage test) can import it. The content is read straight
// from src/live_content/ because src/live/load.ts uses Vite's import.meta.glob. JSON is read with require:
// the package is an ES module, and Node needs an import attribute for a JSON import, which Playwright lacks.
import { createRequire } from 'node:module'
import type { Attempt, LearnerState, ModuleId } from '../../../src/state/learnerState'
import type { Settings } from '../../../src/state/storage'

const require = createRequire(import.meta.url)
const checks = require('../../../src/live_content/questions/checks.json') as { questions: { id: string }[] }
const diagnostic = require('../../../src/live_content/questions/diagnostic.json') as { questionIds: string[] }
const readiness = require('../../../src/live_content/questions/readiness.json') as { questionIds: string[] }

export const LEARNER_KEY = 'avl-primer:learner'
export const SETTINGS_KEY = 'avl-primer:settings'

/**
 * - firstVisit: nothing stored (Start shows no ResumeCard).
 * - started: a profile with no answers, at C1.
 * - returning: C1 to C3 done, at C4, two C3 answers (as tests/ui/learner-fixtures.tsx).
 * - diagnosticMixed / diagnosticSecure: C1's readiness questions answered, one not quite / all right.
 * - checksDone: every lesson check answered rightly.
 * - everything: every check, C1's questions and C9's questions answered rightly; C1 to C9 done.
 * - readyRevise: as everything, but the first C9 readiness question not quite (overall Revise).
 * - storageUnavailable: localStorage throws (the spec installs it; the learner is session-only).
 */
export const SEEDS = ['firstVisit', 'started', 'returning', 'diagnosticMixed', 'diagnosticSecure', 'checksDone', 'everything', 'readyRevise', 'storageUnavailable'] as const
export type SeedName = (typeof SEEDS)[number]

const AT = '2026-11-14T10:00:00.000Z'
const answer = (questionId: string, correct = true): Attempt => ({ questionId, at: AT, answer: null, correct, confidence: 'sure', hintsUsed: 0 })
const ALL: ModuleId[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']

function state(overrides: Partial<LearnerState>): LearnerState {
  return { schemaVersion: 2, profileId: 'profile-matrix', path: 'guided', currentModule: 'C1', completedModules: [], attempts: [], lectureQuestions: [], ...overrides }
}

const checkAnswers = () => checks.questions.map((q) => answer(q.id))
const diagnosticAnswers = (firstRight = true) => diagnostic.questionIds.map((id, i) => answer(id, i === 0 ? firstRight : true))
const readinessAnswers = (firstRight = true) => readiness.questionIds.map((id, i) => answer(id, i === 0 ? firstRight : true))

/** The stored learner for a seed, or null when nothing is stored. */
export function learnerFor(seed: SeedName): LearnerState | null {
  switch (seed) {
    case 'firstVisit':
    case 'storageUnavailable':
      return null
    case 'started':
      return state({})
    case 'returning':
      return state({
        currentModule: 'C4',
        completedModules: ['C1', 'C2', 'C3'],
        attempts: [
          { questionId: 'c3-q1', at: AT, answer: 'b', correct: false, confidence: 'sure', hintsUsed: 1 },
          { questionId: 'c3-q2', at: AT, answer: { keys: [3, 2, 1] }, correct: true, hintsUsed: 0 },
        ],
      })
    case 'diagnosticMixed':
      return state({ attempts: diagnosticAnswers(false) })
    case 'diagnosticSecure':
      return state({ attempts: diagnosticAnswers(true) })
    case 'checksDone':
      return state({ currentModule: 'C9', completedModules: ALL.slice(0, 8), attempts: [...diagnosticAnswers(), ...checkAnswers()] })
    case 'everything':
      return state({ currentModule: 'C9', completedModules: ALL, attempts: [...diagnosticAnswers(), ...checkAnswers(), ...readinessAnswers()] })
    case 'readyRevise':
      return state({ currentModule: 'C9', completedModules: ALL, attempts: [...diagnosticAnswers(), ...checkAnswers(), ...readinessAnswers(false)] })
  }
}

export type Theme = 'light' | 'dark'
export const THEMES: readonly Theme[] = ['light', 'dark']

/** The stored settings for an entry and theme. */
export function settingsFor(theme: Theme, extra: Partial<Settings> = {}): Partial<Settings> {
  return { theme, ...extra }
}
