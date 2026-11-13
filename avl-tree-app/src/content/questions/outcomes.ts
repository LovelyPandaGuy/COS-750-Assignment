// Learning outcomes with the Bloom levels the ID content gives them ("Learning objectives").
// Source: ID. LO7 is "Apply/Analyse" in the ID, so both are allowed.
import type { BloomLevel, LoId } from '../../assessment/ids'
import type { ModuleId } from '../../state/learnerState'

export interface OutcomeEntry {
  levels: readonly BloomLevel[]
  /** The modules the ID teaches it in; C9's report links back to their worked examples (add-readiness-c9). */
  modules: readonly ModuleId[]
  source: 'ID'
}

export const OUTCOMES: Record<LoId, OutcomeEntry> = {
  LO1: { levels: ['understand'], modules: ['C2'], source: 'ID' },
  LO2: { levels: ['remember'], modules: ['C3'], source: 'ID' },
  LO3: { levels: ['apply'], modules: ['C3'], source: 'ID' },
  LO4: { levels: ['apply'], modules: ['C4'], source: 'ID' },
  LO5: { levels: ['understand'], modules: ['C4', 'C8'], source: 'ID' },
  LO6: { levels: ['apply'], modules: ['C5'], source: 'ID' },
  LO7: { levels: ['apply', 'analyse'], modules: ['C6'], source: 'ID' },
  LO8: { levels: ['apply'], modules: ['C7'], source: 'ID' },
  LO9: { levels: ['analyse'], modules: ['C8'], source: 'ID' },
}
