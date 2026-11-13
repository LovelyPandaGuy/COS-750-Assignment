// Learning outcomes with the Bloom levels the ID content gives them ("Learning objectives").
// Source: ID. LO7 is "Apply/Analyse" in the ID, so both are allowed.
import type { BloomLevel, OutcomeTag } from '../../assessment/ids'

export interface OutcomeEntry {
  levels: readonly BloomLevel[]
  source: 'ID' | 'beyond ID'
}

export const OUTCOMES: Record<OutcomeTag, OutcomeEntry> = {
  LO1: { levels: ['understand'], source: 'ID' },
  LO2: { levels: ['remember'], source: 'ID' },
  LO3: { levels: ['apply'], source: 'ID' },
  LO4: { levels: ['apply'], source: 'ID' },
  LO5: { levels: ['understand'], source: 'ID' },
  LO6: { levels: ['apply'], source: 'ID' },
  LO7: { levels: ['apply', 'analyse'], source: 'ID' },
  LO8: { levels: ['apply'], source: 'ID' },
  LO9: { levels: ['analyse'], source: 'ID' },
  // [beyond ID] the C1 prerequisites: terms, ordering, search, insert and height are recalled and understood, not applied.
  PRE: { levels: ['remember', 'understand'], source: 'beyond ID' },
}
