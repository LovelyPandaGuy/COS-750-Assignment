// Sub-skills, each tied to one outcome (SE glossary "Sub-skill"; assumed, proposal item 3). The IDs
// follow the SE document's own example, identify-rebalance-case.
import type { OutcomeTag } from '../../assessment/ids'

export interface SubSkillEntry {
  outcome: OutcomeTag
  /** Not used by the module checks; kept for a later bank. */
  reserved?: 'readiness'
}

export const SUB_SKILLS: Record<string, SubSkillEntry> = {
  'bst-shape': { outcome: 'LO1' },
  'search-cost': { outcome: 'LO1' },
  'node-height': { outcome: 'LO2' },
  'compute-balance-factor': { outcome: 'LO3' },
  'avl-property': { outcome: 'LO3' },
  'trace-search': { outcome: 'LO4' },
  'search-complexity': { outcome: 'LO5', reserved: 'readiness' },
  rotate: { outcome: 'LO6' },
  'rotation-count': { outcome: 'LO6' },
  'find-unbalanced-node': { outcome: 'LO7' },
  'identify-rebalance-case': { outcome: 'LO7' },
  'rebalance-insert': { outcome: 'LO7' },
  'delete-rebalance': { outcome: 'LO8' },
  'choose-structure': { outcome: 'LO9' },
  // The C1 prerequisite sub-skills (FR-DIA-01).
  'bst-terminology': { outcome: 'PRE' },
  'bst-insert': { outcome: 'PRE' },
  'bst-search': { outcome: 'PRE' },
  'tree-height': { outcome: 'PRE' },
}
