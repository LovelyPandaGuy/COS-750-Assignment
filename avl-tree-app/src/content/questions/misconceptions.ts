// The misconception catalogue (FR-ASM-02, FR-ASM-03). FLAGGED FOR THE USER TO READ AT G3: the ID
// lists no misconceptions, so every entry is new (user choice, 12 Nov). No label states the
// balance-factor formula, which way a sign leans, or a case name (D19).
import { needMisconception, type MisconceptionId } from '../../assessment/ids'
import { NEED_IDS, type SourceMark } from '../../modules/compare'
import { NEEDS } from '../modules/structures'

export interface MisconceptionEntry {
  label: string
  source: SourceMark
}

const drafted: Record<MisconceptionId, string> = {
  'M-HEIGHT-NODES': 'counts height in nodes, not edges',
  'M-HEIGHT-IS-DEPTH': "measures a node's height from the root down",
  'M-ORDER-IRRELEVANT': 'expects the same keys to give the same shape in any order',
  'M-ASSUMES-BALANCED': 'expects every BST search to be short',
  'M-COUNTS-EDGES': 'counts the moves between nodes, not the nodes visited',
  'M-SEARCH-VISITS-ALL': 'expects a search to look at every node',
  'M-BF-SIGN': 'subtracts the subtree heights in the other order',
  'M-EMPTY-HEIGHT': 'gives an empty subtree the same height as a leaf',
  'M-ROOT-ONLY': 'checks the balance rule only at the root',
  'M-PERFECT-ONLY': 'expects an AVL tree to be perfectly balanced',
  'M-ROTATION-DIRECTION': 'rotates the other way',
  'M-ROOT-STAYS': 'keeps the rotated node on top',
  'M-SINGLE-FOR-BENT': 'uses one rotation where the shape bends',
  'M-ALWAYS-DOUBLE': 'uses two rotations where the shape is straight',
  'M-HIGHEST-UNBALANCED': 'fixes a higher unbalanced node, not the lowest',
  'M-IN-RANGE-PICKED': 'picks a node whose balance factor is still in range',
  'M-FORGETS-REBALANCE': 'stops after the BST insert or delete',
  'M-DELETE-ONE-ROTATION': 'expects a delete, like an insert, to need at most one rebalance',
}

export const MISCONCEPTIONS: Record<MisconceptionId, MisconceptionEntry> = {
  ...Object.fromEntries(Object.entries(drafted).map(([id, label]) => [id, { label, source: 'beyond ID' as const }])),
  // C8: one tag per need, labelled from the comparison record's existing need wording.
  ...Object.fromEntries(NEED_IDS.map((n) => [needMisconception(n), { label: `overlooks the need: ${NEEDS[n].label}`, source: 'beyond ID' as const }])),
}
