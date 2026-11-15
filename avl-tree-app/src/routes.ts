import { MODULE_IDS, type ModuleId } from './state/learnerState'

// The one place that knows the app's paths, module IDs and each module's activities
// (add-routing-and-screen-skeleton). No other file writes a route path by hand.

export const ACTIVITIES = ['explore', 'example', 'check', 'refresher'] as const
export type Activity = (typeof ACTIVITIES)[number]

/** C2 to C8 are lessons played from their lesson files (add-live-lesson-content); they have no activity routes. */
const LESSON: readonly Activity[] = []

/**
 * Activity paths per module: only C1's BST refresher. Every module path plays its lesson, and any
 * other activity path redirects there (app-routing).
 */
export const ACTIVITIES_BY_MODULE: Record<ModuleId, readonly Activity[]> = {
  C1: ['refresher'],
  C2: LESSON,
  C3: LESSON,
  C4: LESSON,
  C5: LESSON,
  C6: LESSON,
  C7: LESSON,
  C8: LESSON,
  C9: LESSON,
}

/** Route patterns for `<Route path>`. */
export const patterns = {
  start: '/',
  /** The former path page: redirects to the current lesson (remove-path-page, D159). */
  legacyPath: '/path',
  module: '/module/:moduleId',
  activity: '/module/:moduleId/:activity',
  warmUpResult: '/module/C1/check/result',
  sandbox: '/sandbox',
  readiness: '/readiness',
} as const

/** Concrete paths to link or navigate to. */
export const paths = {
  start: () => '/',
  legacyPath: () => '/path',
  module: (id: ModuleId) => `/module/${id}`,
  activity: (id: ModuleId, activity: Activity) => `/module/${id}/${activity}`,
  warmUpResult: () => '/module/C1/check/result',
  sandbox: () => '/sandbox',
  readiness: () => '/readiness',
}

/** Where Next on a lesson's last screen goes: the next lesson, and after C9 the readiness report (D159). */
export function afterLesson(id: ModuleId): string {
  const i = MODULE_IDS.indexOf(id)
  return i < MODULE_IDS.length - 1 ? paths.module(MODULE_IDS[i + 1]) : paths.readiness()
}

export function parseModuleId(value: string | undefined): ModuleId | null {
  return (MODULE_IDS as readonly string[]).includes(value ?? '') ? (value as ModuleId) : null
}

export function parseActivity(value: string | undefined): Activity | null {
  return (ACTIVITIES as readonly string[]).includes(value ?? '') ? (value as Activity) : null
}
/** Every module's screen is its lesson (module-hub "Module screen"); C1's refresher keeps its own path. */
export function isLesson(id: ModuleId): boolean {
  return MODULE_IDS.includes(id)
}
