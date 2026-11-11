import { MODULE_IDS, type ModuleId } from './state/learnerState'

export type PathStatus = 'done' | 'current' | 'next' | 'later'

/**
 * Status of each module on the progress map, from the learner state alone
 * (wireframe 1e). The current module wins over done; "next" is the module right
 * after the current one; every other module is "later", even one before the
 * current module that was never completed, because the map shows only what the
 * state says.
 */
export function mapStatuses(current: ModuleId, completed: readonly ModuleId[]): Record<ModuleId, PathStatus> {
  const at = MODULE_IDS.indexOf(current)
  return Object.fromEntries(
    MODULE_IDS.map((id, i): [ModuleId, PathStatus] => [
      id,
      id === current ? 'current' : completed.includes(id) ? 'done' : i === at + 1 ? 'next' : 'later',
    ]),
  ) as Record<ModuleId, PathStatus>
}
