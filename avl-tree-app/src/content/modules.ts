// Module titles come from the lesson files (ID 7.1; D92 supersedes D1's titles). One source: the
// loader. A title falls back to the module ID only when the content has problems.
import { lessonById } from '../live/load'
import { MODULE_IDS, type ModuleId } from '../state/learnerState'

export const MODULE_TITLES: Record<ModuleId, string> = Object.fromEntries(
  MODULE_IDS.map((id) => [id, lessonById(id.toLowerCase())?.title ?? id]),
) as Record<ModuleId, string>

/** "C4 Search (the algorithm)": the module ID followed by its lesson title. */
export function moduleLabel(id: ModuleId): string {
  return `${id} ${MODULE_TITLES[id]}`
}
