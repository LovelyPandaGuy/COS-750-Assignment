// Module titles from decision D1 (docs/decisions.md). Not new wording.
import type { ModuleId } from '../state/learnerState'

export const MODULE_TITLES: Record<ModuleId, string> = {
  C1: 'Getting started and readiness check',
  C2: 'When BSTs go lopsided',
  C3: 'The AVL property',
  C4: 'Search',
  C5: 'Rotations',
  C6: 'Insertion with rebalancing',
  C7: 'Deletion',
  C8: 'Choosing a structure',
  C9: 'Am I ready',
}

/** "C4 Search": the module ID followed by its D1 title. */
export function moduleLabel(id: ModuleId): string {
  return `${id} ${MODULE_TITLES[id]}`
}
