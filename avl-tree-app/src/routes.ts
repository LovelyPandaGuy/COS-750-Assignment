import { MODULE_IDS, type ModuleId } from './state/learnerState'

// The one place that knows the app's paths, module IDs and each module's activities
// (add-routing-and-screen-skeleton). No other file writes a route path by hand.

export const ACTIVITIES = ['explore', 'example', 'check', 'refresher'] as const
export type Activity = (typeof ACTIVITIES)[number]

const STANDARD: readonly Activity[] = ['explore', 'example', 'check']

/**
 * Activities per module, in default order. An assumption until the module content
 * exists (proposal, question 3): C1 has the warm-up check and the BST refresher,
 * C2 to C8 have explore, worked example and check, C9 has its check.
 */
export const ACTIVITIES_BY_MODULE: Record<ModuleId, readonly Activity[]> = {
  C1: ['check', 'refresher'],
  C2: STANDARD,
  C3: STANDARD,
  C4: STANDARD,
  C5: STANDARD,
  C6: STANDARD,
  C7: STANDARD,
  C8: STANDARD,
  C9: ['check'],
}

/** Route patterns for `<Route path>`. */
export const patterns = {
  start: '/',
  hub: '/path',
  module: '/module/:moduleId',
  activity: '/module/:moduleId/:activity',
  warmUpResult: '/module/C1/check/result',
  sandbox: '/sandbox',
  readiness: '/readiness',
} as const

/** Concrete paths to link or navigate to. */
export const paths = {
  start: () => '/',
  hub: () => '/path',
  module: (id: ModuleId) => `/module/${id}`,
  activity: (id: ModuleId, activity: Activity) => `/module/${id}/${activity}`,
  warmUpResult: () => '/module/C1/check/result',
  sandbox: () => '/sandbox',
  readiness: () => '/readiness',
}

export function parseModuleId(value: string | undefined): ModuleId | null {
  return (MODULE_IDS as readonly string[]).includes(value ?? '') ? (value as ModuleId) : null
}

export function parseActivity(value: string | undefined): Activity | null {
  return (ACTIVITIES as readonly string[]).includes(value ?? '') ? (value as Activity) : null
}