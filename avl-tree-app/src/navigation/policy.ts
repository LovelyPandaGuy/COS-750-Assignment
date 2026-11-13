import { needsReview } from '../assessment/session'
import { MODULE_IDS, type Attempt, type LearnerState, type ModuleId } from '../state/learnerState'

// Entry policy and route recommendation (add-module-framework, D20). Pure functions of their
// inputs; nothing here reads or writes the learner state.

/**
 * Each module's prerequisite: the required module before it in the guided order. Assumed (D20,
 * proposal item 4): the ID names no per-module prerequisites. C7 is optional (D4), so C8 names C6.
 */
export const PREREQUISITE: Readonly<Record<ModuleId, ModuleId | null>> = {
  C1: null,
  C2: 'C1',
  C3: 'C2',
  C4: 'C3',
  C5: 'C4',
  C6: 'C5',
  C7: 'C6',
  C8: 'C6',
  C9: 'C8',
}

/** `enter` is always true: nothing is locked (D20). Locking later widens this type. */
export interface EntryDecision {
  enter: true
  prerequisite: ModuleId | null
}

/** The one place that decides entry to a module (D20). */
export function entryPolicy(module: ModuleId, learner: LearnerState): EntryDecision {
  const before = PREREQUISITE[module]
  return { enter: true, prerequisite: before !== null && !learner.completedModules.includes(before) ? before : null }
}

/**
 * The route suggested after a module's check: the next module in the guided order, including the
 * optional C7 (proposal item 7), unless the stored attempts show a first-attempt miss on a required
 * item, when it is the module itself (add-checks-and-feedback, D20).
 */
export function recommendRoute(module: ModuleId, attempts: readonly Attempt[] = []): ModuleId | null {
  if (needsReview(module, attempts)) return module
  return MODULE_IDS[MODULE_IDS.indexOf(module) + 1] ?? null
}
