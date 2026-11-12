// Learning outcomes with the Bloom levels the ID content gives them ("Learning objectives").
// Source: ID. LO7 is "Apply/Analyse" in the ID, so both are allowed.
import type { BloomLevel, LoId } from '../../assessment/ids'

export interface OutcomeEntry {
  levels: readonly BloomLevel[]
  source: 'ID'
}

export const OUTCOMES: Record<LoId, OutcomeEntry> = {
  LO1: { levels: ['understand'], source: 'ID' },
  LO2: { levels: ['remember'], source: 'ID' },
  LO3: { levels: ['apply'], source: 'ID' },
  LO4: { levels: ['apply'], source: 'ID' },
  LO5: { levels: ['understand'], source: 'ID' },
  LO6: { levels: ['apply'], source: 'ID' },
  LO7: { levels: ['apply', 'analyse'], source: 'ID' },
  LO8: { levels: ['apply'], source: 'ID' },
  LO9: { levels: ['analyse'], source: 'ID' },
}
