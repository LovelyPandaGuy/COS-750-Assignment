// The module checks for C2 to C8 (FR-ASM-01, D15; add-question-model-and-bank, design decision 5).
// Wording only: each item names a kind, and the engine builds the problem, the answer and every
// wrong option. Every number shown comes from the instance's facts; formula, sign, lean and case
// wording comes from ConventionsWording (D19).
// FLAGGED FOR THE USER TO READ AT G3: every stem and explanation below is [beyond ID]. The checks'
// topics are the ID's (C2 to C8 "Check" bullets); the sentences are new.
import { needMisconception } from '../../assessment/ids'
import type { BankItem, KindFacts, OptionValue, Wording } from '../../assessment/types'
import type { RebalanceCase } from '../../engine/conventions'
import { NEED_IDS, type StructureId } from '../../modules/compare'
import type { ConventionsWording } from '../modules/conventionsWording'
import { NEEDS, STRUCTURES } from '../modules/structures'

const list = (keys: readonly number[]) => keys.join(', ')
/** A height as the app shows it: 2, 0, −1. */
const h = (n: number) => (n < 0 ? `−${-n}` : String(n))
const v = (f: KindFacts, name: string) => f.values[name]
const edges = (n: number) => `${n} ${n === 1 ? 'edge' : 'edges'}`
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const other = (dir: 'left' | 'right' | undefined) => (dir === 'left' ? 'right' : 'left')
const leans = (f: KindFacts, w: ConventionsWording) => `${w.leanPhrase(v(f, 'zBalance'))} ${w.leanPhrase(v(f, 'yBalance'))}`

// ---- C2 (LO1) ----

const chk2Height: BankItem = {
  id: 'chk2-height',
  module: 'C2',
  kind: 'bst-height',
  outcome: 'LO1',
  subSkill: 'bst-shape',
  level: 'understand',
  stem: (f) => `Insert ${list(f.keys)} into an empty plain BST, in that order. What is the height of the tree?`,
  why: {
    correct: (f, w) => `${w.heightRule} The longest path from the root down to a leaf has ${edges(v(f, 'height'))}, so the height is ${v(f, 'height')}.`,
    'M-HEIGHT-NODES': (f) =>
      `${v(f, 'heightInNodes')} counts the nodes on the longest path. Height counts the edges between them, so it is ${v(f, 'height')}.`,
    'M-ORDER-IRRELEVANT': (f) =>
      `${v(f, 'balancedHeight')} is the height an AVL tree would give these keys. A plain BST takes its shape from the insertion order, and this order gives height ${v(f, 'height')}.`,
  },
}

const chk2Worst: BankItem = {
  id: 'chk2-worst',
  module: 'C2',
  kind: 'sorted-search',
  outcome: 'LO1',
  subSkill: 'search-cost',
  level: 'understand',
  stem: (f) => `Insert ${list(f.keys)} into an empty plain BST, in increasing order. How many nodes does a search for ${f.target} visit?`,
  why: {
    correct: (f) => `Sorted keys build a straight line, so the search visits every node on the way down: ${v(f, 'steps')} nodes.`,
    'M-ASSUMES-BALANCED': (f) =>
      `${v(f, 'best')} nodes would be enough in a well-shaped tree of ${v(f, 'count')} keys. These keys form a straight line, so the search visits all ${v(f, 'steps')}.`,
    'M-COUNTS-EDGES': (f) => `${v(f, 'edges')} counts the moves from node to node. The search also looks at the node it starts from, so it visits ${v(f, 'steps')}.`,
  },
}

// ---- C3 (LO2, LO3) ----

const chk3Height: BankItem = {
  id: 'chk3-height',
  module: 'C3',
  kind: 'node-height',
  outcome: 'LO2',
  subSkill: 'node-height',
  level: 'remember',
  stem: (f) => `What is the height of node ${f.target}?`,
  why: {
    correct: (f, w) => `${w.heightRule} The longest path from node ${f.target} down to a leaf has ${edges(v(f, 'height'))}, so its height is ${v(f, 'height')}.`,
    other: (f, w) => `${w.heightRule} Count the edges on the longest path from node ${f.target} down to a leaf.`,
    'M-HEIGHT-NODES': (f) =>
      `${v(f, 'heightInNodes')} counts the nodes on that path. Height counts the edges between them, so node ${f.target} has height ${v(f, 'height')}.`,
    'M-HEIGHT-IS-DEPTH': (f) =>
      `${v(f, 'depth')} is how far node ${f.target} is from the root. Height looks down instead: the longest path from node ${f.target} to a leaf has ${edges(v(f, 'height'))}.`,
  },
}

const bfWhy = (f: KindFacts, w: ConventionsWording) =>
  `Its left subtree has height ${h(v(f, 'leftHeight'))} and its right subtree has height ${h(v(f, 'rightHeight'))}. Using ${w.formula}, node ${f.target} has ${w.num(v(f, 'balanceFactor'))}.`

const chk3Bf: BankItem = {
  id: 'chk3-bf',
  module: 'C3',
  kind: 'balance-factor',
  outcome: 'LO3',
  subSkill: 'compute-balance-factor',
  level: 'apply',
  stem: (f) => `What is the balance factor of node ${f.target}?`,
  why: {
    correct: bfWhy,
    other: (f, w) => `Find the height of each subtree of node ${f.target} first. ${w.heightRule}`,
    'M-BF-SIGN': (f, w) => `That subtracts the heights the other way round. ${bfWhy(f, w)}`,
    'M-EMPTY-HEIGHT': (f, w) => `${w.heightRule} ${bfWhy(f, w)}`,
  },
}

const chk3Avl: BankItem = {
  id: 'chk3-avl',
  module: 'C3',
  kind: 'is-avl',
  outcome: 'LO3',
  subSkill: 'avl-property',
  level: 'apply',
  stem: () => 'Is this tree an AVL tree?',
  optionText: (_f, _w, value) => (value === 'yes' ? 'Yes, it is an AVL tree' : 'No, it is not an AVL tree'),
  why: {
    correct: (f, w, value) =>
      value === 'no'
        ? `Node ${v(f, 'broken')} has balance factor ${w.num(v(f, 'brokenBalance'))}, outside ${w.rangeText}, so the tree is not an AVL tree.`
        : `Every node has a balance factor of ${w.rangeText}, so it is an AVL tree, even though it is not perfectly balanced.`,
    'M-ROOT-ONLY': (f, w) =>
      `The root is in range, with balance factor ${w.num(v(f, 'rootBalance'))}, but the rule must hold at every node. Node ${v(f, 'broken')} has ${w.num(v(f, 'brokenBalance'))}.`,
    'M-PERFECT-ONLY': (_f, w) => `An AVL tree does not have to be perfectly balanced. Every balance factor here is ${w.rangeText}, so it is an AVL tree.`,
  },
}

// ---- C4 (LO4) ----

const searchWhy = (missing: boolean): BankItem['why'] => ({
  correct: (f) =>
    `The search compares ${f.target} with one node per level on its way down and visits ${v(f, 'steps')} nodes${missing ? ' before it runs out of tree' : ''}.`,
  'M-COUNTS-EDGES': (f) => `${v(f, 'edges')} counts the moves between nodes. The search also compares ${f.target} with the root, so it visits ${v(f, 'steps')} nodes.`,
  'M-SEARCH-VISITS-ALL': (f) =>
    `A search never needs all ${v(f, 'count')} nodes. At each node it goes left or right, so it visits only ${v(f, 'steps')}.`,
})

const chk4Found: BankItem = {
  id: 'chk4-found',
  module: 'C4',
  kind: 'search-visits',
  params: { found: true },
  outcome: 'LO4',
  subSkill: 'trace-search',
  level: 'apply',
  stem: (f) => `How many nodes does a search for ${f.target} visit in this AVL tree?`,
  why: searchWhy(false),
}

const chk4Missing: BankItem = {
  id: 'chk4-missing',
  module: 'C4',
  kind: 'search-visits',
  params: { found: false },
  outcome: 'LO4',
  subSkill: 'trace-search',
  level: 'apply',
  stem: (f) => `${f.target} is not in this AVL tree. How many nodes does a search for it visit before it stops?`,
  why: searchWhy(true),
}

// ---- C5 (LO6) ----

const chk5Rotate: BankItem = {
  id: 'chk5-rotate',
  module: 'C5',
  kind: 'rotation-result',
  outcome: 'LO6',
  subSkill: 'rotate',
  level: 'apply',
  stem: (f) => `Rotate ${f.dir} at node ${f.target}. Which key is at the top of that subtree afterwards?`,
  why: {
    correct: (f) => `In a ${f.dir} rotation, the child on the ${other(f.dir)} side moves up. So ${v(f, 'top')} takes the place of ${f.target}.`,
    'M-ROTATION-DIRECTION': (f) =>
      `${v(f, 'otherTop')} would move up in a rotation the other way. A ${f.dir} rotation lifts the child on the ${other(f.dir)} side, ${v(f, 'top')}.`,
    'M-ROOT-STAYS': (f) => `A rotation always moves node ${f.target} down one level. Its child ${v(f, 'top')} moves up to take its place.`,
  },
}

const chk5Count: BankItem = {
  id: 'chk5-count',
  module: 'C5',
  kind: 'rotations-needed',
  outcome: 'LO6',
  subSkill: 'rotation-count',
  level: 'apply',
  stem: (f) => `Inserting ${f.target} into this AVL tree unbalances it. How many single rotations does the fix take?`,
  why: {
    correct: (f) =>
      v(f, 'rotations') === 1
        ? `The path from ${v(f, 'z')} through ${v(f, 'y')} goes the same way twice, a straight shape, so one rotation at ${v(f, 'z')} fixes it.`
        : `The path from ${v(f, 'z')} through ${v(f, 'y')} bends, so it takes two: one at ${v(f, 'y')}, then one at ${v(f, 'z')}.`,
    'M-SINGLE-FOR-BENT': (f) =>
      `The shape bends at ${v(f, 'y')}. One rotation at ${v(f, 'z')} would leave it bent the other way; straighten it at ${v(f, 'y')} first, then rotate at ${v(f, 'z')}.`,
    'M-ALWAYS-DOUBLE': (f) => `The shape from ${v(f, 'z')} through ${v(f, 'y')} is straight, so a single rotation at ${v(f, 'z')} is enough.`,
  },
}

// ---- C6 (LO7) ----

const chk6Node: BankItem = {
  id: 'chk6-node',
  module: 'C6',
  kind: 'lowest-unbalanced',
  outcome: 'LO7',
  subSkill: 'find-unbalanced-node',
  level: 'analyse',
  stem: (f) => `Insert ${f.target} into this AVL tree as in a plain BST. Which node is the lowest one that becomes unbalanced?`,
  why: {
    correct: (f, w) =>
      `Going back up from ${f.target}, node ${v(f, 'z')} is the first with a balance factor outside ${w.rangeText} (${w.num(v(f, 'zBalance'))}). That is the node to fix.`,
    'M-HIGHEST-UNBALANCED': (f, w, value) =>
      `Node ${value} is unbalanced too (${w.num(v(f, `bf:${value}`))}), but it is higher up. Fix the lowest one, ${v(f, 'z')}; that brings the nodes above it back in range as well.`,
    'M-IN-RANGE-PICKED': (f, w, value) =>
      `Node ${value} has balance factor ${w.num(v(f, `bf:${value}`))}, which is still in range. Look for the lowest node outside ${w.rangeText}: ${v(f, 'z')}.`,
  },
}

const chk6Case: BankItem = {
  id: 'chk6-case',
  module: 'C6',
  kind: 'rebalance-case',
  outcome: 'LO7',
  subSkill: 'identify-rebalance-case',
  level: 'analyse',
  stem: (f) => `Inserting ${f.target} unbalances node ${v(f, 'z')}. Which rebalancing case is this?`,
  optionText: (_f, w, value) => w.caseName(value as RebalanceCase),
  why: {
    correct: (f, w, value) =>
      `Node ${v(f, 'z')} has balance factor ${w.num(v(f, 'zBalance'))} and its taller child ${v(f, 'y')} has ${w.num(v(f, 'yBalance'))}. ${leans(f, w)} That is case ${w.caseName(value as RebalanceCase)}.`,
    'M-BF-SIGN': (f, w) => `That case reads both signs the other way round. Using ${w.formula}: ${leans(f, w)}`,
    'M-SINGLE-FOR-BENT': (f, w) => `That case is for a straight shape, fixed by one rotation. ${leans(f, w)} The shape bends at ${v(f, 'y')}, so it needs two.`,
    'M-ALWAYS-DOUBLE': (f, w) => `That case is for a bent shape. ${leans(f, w)} The shape is straight, so one rotation at ${v(f, 'z')} is enough.`,
  },
}

const chk6Tree: BankItem = {
  id: 'chk6-tree',
  module: 'C6',
  kind: 'insert-final-tree',
  outcome: 'LO7',
  subSkill: 'rebalance-insert',
  level: 'apply',
  stem: (f) => `Insert ${f.target} into this AVL tree and rebalance it. Build the final tree.`,
  why: {
    correct: (f) =>
      `After the BST insert, node ${v(f, 'z')} is the lowest unbalanced node. ${
        v(f, 'rotations') === 1 ? `One rotation at ${v(f, 'z')}` : `A rotation at ${v(f, 'y')}, then one at ${v(f, 'z')},`
      } restores the balance.`,
    other: (f) => `Work in order: insert ${f.target} as in a BST, update the heights going up, find the lowest unbalanced node, then rotate.`,
    'M-FORGETS-REBALANCE': (f, w) => `That is the tree right after the BST insert. Node ${v(f, 'z')} is now outside ${w.rangeText}, so it still needs rebalancing.`,
    'M-SINGLE-FOR-BENT': (f) => `One rotation at ${v(f, 'z')} is not enough here, because the shape bends at ${v(f, 'y')}. Rotate at ${v(f, 'y')} first, then at ${v(f, 'z')}.`,
    'M-ROTATION-DIRECTION': (f) => `That rotation at ${v(f, 'z')} goes the other way, so the tree stays unbalanced. Rotate the other way at ${v(f, 'z')}.`,
    'M-HIGHEST-UNBALANCED': (f) =>
      `That fixes a node higher up. Fix the lowest unbalanced node, ${v(f, 'z')}, instead; the nodes above it are then back in range too.`,
  },
}

// ---- C7 (LO8), optional (D4) ----

const chk7Count: BankItem = {
  id: 'chk7-count',
  module: 'C7',
  kind: 'delete-rebalances',
  outcome: 'LO8',
  subSkill: 'delete-rebalance',
  level: 'apply',
  optional: true,
  stem: (f) => `Delete ${f.target} from this AVL tree. How many nodes need a rebalance on the way back up?`,
  why: {
    correct: (f) => `Walking back up after the BST delete, the number of nodes on the path that need a rebalance is ${v(f, 'rebalances')}.`,
    'M-FORGETS-REBALANCE': (f) => `A delete can unbalance nodes on the way back up, just like an insert. Here ${v(f, 'rebalances')} need a rebalance.`,
    'M-DELETE-ONE-ROTATION': (f) =>
      `Unlike an insert, a delete can need more than one rebalance: a rotation can make its subtree shorter, which unbalances a node higher up. Here ${v(f, 'rebalances')} are needed.`,
  },
}

const chk7Root: BankItem = {
  id: 'chk7-root',
  module: 'C7',
  kind: 'delete-root',
  outcome: 'LO8',
  subSkill: 'delete-rebalance',
  level: 'apply',
  optional: true,
  stem: (f) => `Delete ${f.target} from this AVL tree and rebalance it. Which key is at the root afterwards?`,
  why: {
    correct: (f) => `After the BST delete, the root ${v(f, 'plainRoot')} is out of balance, so a rotation moves ${v(f, 'avlRoot')} up to the root.`,
    'M-FORGETS-REBALANCE': (f) =>
      `${v(f, 'plainRoot')} is the root right after the BST delete, but it is then out of balance. Rebalancing it lifts ${v(f, 'avlRoot')} to the root.`,
  },
}

// ---- C8 (LO9) ----

const structureName = (value?: OptionValue) => STRUCTURES[value as StructureId].name

const scenarioItem = (id: string, scenarios: string[]): BankItem => ({
  id,
  module: 'C8',
  kind: 'scenario-choice',
  params: { scenarios },
  outcome: 'LO9',
  subSkill: 'choose-structure',
  level: 'analyse',
  stem: (f) => `${f.scenario!.text} Which structure fits best?`,
  optionText: (_f, _w, value) => capital(structureName(value)),
  why: {
    correct: (f, _w, value) => `The ${structureName(value)} meets every need here: ${f.scenario!.needs.map((n) => NEEDS[n].label).join('; ')}.`,
    ...Object.fromEntries(NEED_IDS.map((n): [string, Wording] => [needMisconception(n), (_f, _w, value) => NEEDS[n].unmet(structureName(value))])),
  },
})

export const CHECKS: readonly BankItem[] = [
  chk2Height,
  chk2Worst,
  chk3Height,
  chk3Bf,
  chk3Avl,
  chk4Found,
  chk4Missing,
  chk5Rotate,
  chk5Count,
  chk6Node,
  chk6Case,
  chk6Tree,
  chk7Count,
  chk7Root,
  scenarioItem('chk8-pick-a', ['class-list', 'word-game', 'live-scores', 'bookings', 'timetable']),
  scenarioItem('chk8-pick-b', ['spell-check', 'postal-codes', 'logins', 'page-cache']),
]
