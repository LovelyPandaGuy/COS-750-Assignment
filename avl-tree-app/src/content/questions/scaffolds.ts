// Scaffold hints and the lecture-question template (add-scaffold-ladder-and-retry-cap; FR-SCA-02,
// FR-SCA-03, D9, D21).
// FLAGGED FOR THE USER TO READ AT G3: the ID lists no hints, so every hint below is [beyond ID],
// like the misconception catalogue (12 Nov). Each one says where to look, never what the answer is.
// Formula, sign, lean and case wording comes from ConventionsWording (D19); no hint types a number.
// A hint for a misconception is shared by every kind that produces it, so it uses no fact that
// only some of those kinds have.
import { needMisconception, type MisconceptionId } from '../../assessment/ids'
import type { Wording } from '../../assessment/types'
import { NEED_IDS, type SourceMark } from '../../modules/compare'
import { NEEDS } from '../modules/structures'

export interface HintEntry {
  text: Wording
  source: SourceMark
}

const drafted: Record<MisconceptionId, Wording> = {
  'M-HEIGHT-NODES': (_f, w) => `Height counts the edges on the path, not the nodes. ${w.heightRule}`,
  'M-HEIGHT-IS-DEPTH': () => "A node's height looks down from that node to the leaves below it, not up to the root.",
  'M-ORDER-IRRELEVANT': () => 'A plain BST takes its shape from the order of the keys. Draw it one key at a time, in the order given.',
  'M-ASSUMES-BALANCED': () => 'Draw the tree these keys build. Keys that arrive in increasing order each go below the one before, on the same side.',
  'M-COUNTS-EDGES': () => 'Count the nodes the search looks at, not the moves between them. The root counts too.',
  'M-SEARCH-VISITS-ALL': () => 'A search follows one path down. At each node it goes left or right and never comes back up.',
  'M-BF-SIGN': (_f, w) => `Check the order of the subtraction: ${w.formula}.`,
  'M-EMPTY-HEIGHT': (_f, w) => `An empty subtree sits one level below a leaf. ${w.heightRule}`,
  'M-ROOT-ONLY': (_f, w) => `The rule must hold at every node, not only at the root. Check each balance factor against ${w.rangeText}.`,
  'M-PERFECT-ONLY': (_f, w) => `An AVL tree does not have to be perfectly balanced. Each balance factor only has to be ${w.rangeText}.`,
  'M-ROTATION-DIRECTION': () => 'Check the direction: a left rotation lifts the right child, and a right rotation lifts the left child.',
  'M-ROOT-STAYS': () => 'In a rotation, the node you rotate at moves down and one of its children takes its place.',
  'M-SINGLE-FOR-BENT': () =>
    'Follow the path from the unbalanced node towards the new key. If the path changes direction, the bend has to be straightened before the last rotation.',
  'M-ALWAYS-DOUBLE': () => 'Follow the path from the unbalanced node towards the new key. If it goes the same way twice, the shape is straight.',
  'M-HIGHEST-UNBALANCED': () => 'Walk up from the new key and stop at the first node that is out of balance. That lowest node is the one to fix.',
  'M-IN-RANGE-PICKED': (_f, w) => `A node is out of balance only when its balance factor is outside ${w.rangeText}. Work out the balance factor of each node on the path.`,
  'M-FORGETS-REBALANCE': () => 'After the plain BST step, walk back up towards the root and check the balance factor of every node on the way.',
  'M-DELETE-ONE-ROTATION': () => 'A delete can put more than one node out of balance. Keep checking all the way up to the root.',
}

/** One hint per catalogue misconception: the drafted ones, then one per need from the comparison record's need wording. */
export const HINTS: Record<MisconceptionId, HintEntry> = {
  ...Object.fromEntries(Object.entries(drafted).map(([id, text]) => [id, { text, source: 'beyond ID' as const }])),
  ...Object.fromEntries(
    NEED_IDS.map((n) => [needMisconception(n), { text: () => `Check whether your choice meets this need: ${NEEDS[n].label}.`, source: 'beyond ID' as const }]),
  ),
}

const general: Record<string, Wording> = {
  'bst-shape': (_f, w) =>
    `Draw the tree one key at a time: a smaller key goes left and a larger key goes right. Then count the edges on the longest path from the root down to a leaf. ${w.heightRule}`,
  'search-cost': () => 'Picture the tree these keys build in this order. A search moves down one level at a time; count every node it looks at, the root included.',
  'node-height': (_f, w) => `Follow the longest path from the node down to a leaf and count its edges. ${w.heightRule}`,
  'compute-balance-factor': (_f, w) => `Find the height of each subtree of the node first. ${w.heightRule} Then use ${w.formula}.`,
  'avl-property': (_f, w) => `Check every node, not only the root: work out each balance factor and see whether it is ${w.rangeText}.`,
  'trace-search': () =>
    'Start at the root. At each node, go left if the key you want is smaller and right if it is larger. Count each node you compare with, the root included.',
  'search-complexity': () => 'Think about how many levels a search walks down, not how many keys the tree holds.',
  rotate: () => 'Find the child that moves up: a left rotation lifts the right child, and a right rotation lifts the left child.',
  'rotation-count': () =>
    'Look at the path from the unbalanced node towards the new key. If it goes the same way twice the shape is straight; if it changes direction the shape bends.',
  'find-unbalanced-node': (_f, w) =>
    `After the insert, walk back up from the new key and work out each balance factor. Stop at the first node whose balance factor is not ${w.rangeText}.`,
  'identify-rebalance-case': (_f, w) =>
    `Find the lowest unbalanced node and its taller child, and work out both balance factors with ${w.formula}. Their signs tell you the shape.`,
  'rebalance-insert': () => 'Do the plain BST insert first. Then walk back up to the lowest node out of balance and fix it with the rotation its shape needs.',
  'delete-rebalance': () => 'Do the plain BST delete first. Then walk back up to the root and check every node on the way.',
  'choose-structure': () => 'List what the task needs: keys in order, worst-case speed, typical speed, and balancing work. Then check each structure against every need.',
}

/** One general hint per sub-skill, for help before any wrong answer or after one with no misconception. */
export const GENERAL_HINTS: Record<string, HintEntry> = Object.fromEntries(
  Object.entries(general).map(([id, text]) => [id, { text, source: 'beyond ID' as const }]),
)

/** The drafted lecture question: the misconception's catalogue label (third person singular), then the problem's stem. */
export function lectureQuestionText(label: string | undefined, stem: string): string {
  const lead = label !== undefined ? `My answer ${label}. ` : ''
  return `${lead}Could we go through a question like this one in the lecture? "${stem}"`
}
