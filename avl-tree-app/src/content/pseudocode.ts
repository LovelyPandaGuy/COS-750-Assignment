// Pseudocode listings for the pseudocode panel (FR-VIS-04): the ID's two search listings (ID 7.4),
// read from conventions.json. Line k of each listing is the line the engine means by
// `pseudocodeLine` k (lineForStep). The ID has no insert pseudocode, so there is no insert listing (D100).
import { CONVENTIONS } from '../engine/conventions'

export const pseudocode = {
  searchLoop: CONVENTIONS.pseudocode['search-loop'],
  searchRecursive: CONVENTIONS.pseudocode['search-recursive'],
} as const satisfies Record<string, readonly string[]>
