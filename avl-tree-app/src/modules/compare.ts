// Comparing structures for C8 (add-module-c8-choosing, design decisions 1 to 3). Types and pure
// functions; the record is content (src/content/modules/structures.ts), which imports only types
// from here, so the default record below makes no import cycle.
import { STRUCTURES } from '../content/modules/structures'
import type { Key } from '../engine/tree'

export const STRUCTURE_IDS = ['bst', 'avl', 'sorted-array', 'hash-table'] as const
export type StructureId = (typeof STRUCTURE_IDS)[number]

export const COST_CLASSES = ['O(1)', 'O(log2 n)', 'O(n)'] as const
export type CostClass = (typeof COST_CLASSES)[number]

/** What a scenario can need. A closed list, so every structure must answer every need. */
export const NEED_IDS = [
  'in-order',
  'search-worst-log',
  'insert-worst-log',
  'insert-typical-log',
  'lookup-typical-constant',
  'no-balancing',
  'keys-only',
] as const
export type NeedId = (typeof NEED_IDS)[number]

/** Where an entry comes from: the ID content, or new wording flagged for the user (gate G3). */
export type SourceMark = 'ID' | 'beyond ID'

export interface Costs {
  typical: CostClass
  worst: CostClass
}

export interface StructureEntry {
  name: string
  search: Costs
  insert: Costs
  /** The keys can be listed in order without sorting them first. */
  inOrder: boolean
  /** What the structure pays for what it gives (the AVL trade-off, ID C8). */
  costs: readonly string[]
  meets: Record<NeedId, boolean>
  /** `search` and `insert` mark the worst case; the typical cells have their own marks. */
  source: Record<'search' | 'searchTypical' | 'insert' | 'insertTypical' | 'inOrder' | 'costs' | 'meets', SourceMark>
}

export type StructureRecord = Record<StructureId, StructureEntry>

export interface Need {
  /** Short phrase: "keys listed in order". */
  label: string
  /** One sentence saying the named structure does not meet this need. */
  unmet: (name: string) => string
}

export interface Scenario {
  id: string
  /** The situation. Never names a structure. */
  text: string
  needs: readonly NeedId[]
}

/** Binary search on sorted keys: the key at each probe, in order, and whether it was found. */
export function binarySearchProbes(sorted: readonly Key[], key: Key): { probes: Key[]; found: boolean } {
  const probes: Key[] = []
  let lo = 0
  let hi = sorted.length - 1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    probes.push(sorted[mid])
    if (sorted[mid] === key) return { probes, found: true }
    if (key < sorted[mid]) hi = mid - 1
    else lo = mid + 1
  }
  return { probes, found: false }
}

/** Every structure that meets all of the scenario's needs. Valid scenarios have exactly one. */
export function answersOf(scenario: Scenario, record: StructureRecord = STRUCTURES): StructureId[] {
  return STRUCTURE_IDS.filter((s) => scenario.needs.every((n) => record[s].meets[n] === true))
}

/** The first need of the scenario the structure does not meet, or null when it meets them all. */
export function reasonOf(scenario: Scenario, structure: StructureId, record: StructureRecord = STRUCTURES): NeedId | null {
  return scenario.needs.find((n) => record[structure].meets[n] !== true) ?? null
}
