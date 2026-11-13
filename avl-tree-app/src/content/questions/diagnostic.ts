// The C1 prerequisite diagnostic: five items, one per ID bullet, under four sub-skills (FR-DIA-01,
// add-diagnostic-c1-and-routing). Wording only; the engine builds every tree and answer.
// FLAGGED FOR THE USER TO READ AT G3: every stem and explanation is [beyond ID]; the topics are the ID's
// ("tree terms, 'is this a BST?', where does a key go, a BST search path, recursive height").
import type { BankItem, KindFacts } from '../../assessment/types'

const v = (f: KindFacts, name: string) => f.values[name]
const edges = (n: number) => `${n} ${n === 1 ? 'edge' : 'edges'}`

const terms: BankItem = {
  id: 'dx-terms',
  module: 'C1',
  kind: 'tree-terms',
  outcome: 'PRE',
  subSkill: 'bst-terminology',
  level: 'remember',
  stem: () => 'A leaf is a node with no children. How many leaves does this tree have?',
  why: {
    correct: (f) => `Counting only the nodes with no children gives ${v(f, 'leaves')} leaves.`,
    other: () => 'A leaf is a node with no children. Count those nodes and no others.',
    'M-LEAVES-COUNT-ALL': (f) => `${v(f, 'count')} is every node in the tree. Only the nodes with no children are leaves, and there are ${v(f, 'leaves')}.`,
    'M-LEAVES-COUNT-PARENTS': (f) => `${v(f, 'parents')} is how many nodes have children. The leaves are the others: ${v(f, 'leaves')}.`,
  },
}

const isBst: BankItem = {
  id: 'dx-is-bst',
  module: 'C1',
  kind: 'is-bst',
  outcome: 'PRE',
  subSkill: 'bst-terminology',
  level: 'understand',
  stem: () => 'In a binary search tree every key in a left subtree is smaller than the node above it, and every key in a right subtree is larger. Is this tree a binary search tree?',
  optionText: (_f, _w, value) => (value === 'yes' ? 'Yes, it is' : 'No, it is not'),
  why: {
    correct: (f, _w, value) =>
      value === 'no'
        ? `Node ${v(f, 'offender')} is in the ${f.dir} subtree of ${v(f, 'ancestor')}, so it should be ${f.dir === 'right' ? 'larger' : 'smaller'} than ${v(f, 'ancestor')}. It is not.`
        : 'Every key is larger than everything in its left subtree and smaller than everything in its right subtree, so the ordering holds at every node.',
    'M-BST-PARENT-ONLY': (f) =>
      `Each node looks fine next to its parent, but ${v(f, 'offender')} also has to fit against ${v(f, 'ancestor')}, which is above its parent. The ordering must hold against every ancestor.`,
    'M-BST-NEEDS-BALANCE': () => 'A binary search tree only needs the ordering. It does not have to be balanced, and this tree keeps the ordering at every node.',
  },
}

const insert: BankItem = {
  id: 'dx-insert',
  module: 'C1',
  kind: 'insert-parent',
  outcome: 'PRE',
  subSkill: 'bst-insert',
  level: 'understand',
  stem: (f) => `Insert ${f.target} into this binary search tree. The new key becomes the child of which node? Type that node's key.`,
  why: {
    correct: (f) => `Comparing ${f.target} with each key from the root down ends at an empty place under ${v(f, 'parent')}, so ${f.target} becomes its child.`,
    other: (f) => `Compare ${f.target} with the root, go left or right, and repeat until there is no child to go to. The last node you compared is the parent.`,
    'M-INSERT-AT-ROOT': (f) => `${v(f, 'root')} is the root, where the search starts. It keeps going down, and ends under ${v(f, 'parent')}.`,
    'M-INSERT-NEAR-VALUE': (f) => `${v(f, 'closest')} has the nearest value, but a new key follows the search path instead. That path ends under ${v(f, 'parent')}.`,
  },
}

const search: BankItem = {
  id: 'dx-search',
  module: 'C1',
  kind: 'search-visits',
  params: { found: true },
  outcome: 'PRE',
  subSkill: 'bst-search',
  level: 'understand',
  stem: (f) => `How many nodes does a search for ${f.target} visit in this binary search tree, counting the root and the node it finds?`,
  why: {
    correct: (f) => `The search compares ${f.target} with one node on each level on its way down and visits ${v(f, 'steps')} nodes.`,
    'M-COUNTS-EDGES': (f) => `${v(f, 'edges')} counts the moves between nodes. The search also compares at the root, so it visits ${v(f, 'steps')} nodes.`,
    'M-SEARCH-VISITS-ALL': (f) => `A search never needs all ${v(f, 'count')} nodes. At each node it goes one way, so it visits only ${v(f, 'steps')}.`,
  },
}

const height: BankItem = {
  id: 'dx-height',
  module: 'C1',
  kind: 'node-height',
  outcome: 'PRE',
  subSkill: 'tree-height',
  level: 'understand',
  stem: (f) => `Height counts edges: a leaf has height 0. What is the height of node ${f.target}?`,
  why: {
    correct: (f, w) => `${w.heightRule} The longest path from node ${f.target} down to a leaf has ${edges(v(f, 'height'))}, so its height is ${v(f, 'height')}.`,
    other: (f, w) => `${w.heightRule} Count the edges on the longest path from node ${f.target} down to a leaf.`,
    'M-HEIGHT-NODES': (f) => `${v(f, 'heightInNodes')} counts the nodes on that path. Height counts the edges between them, so it is ${v(f, 'height')}.`,
    'M-HEIGHT-IS-DEPTH': (f) => `${v(f, 'depth')} is how far node ${f.target} is from the root. Height looks down instead: ${edges(v(f, 'height'))}.`,
  },
}

export const DIAGNOSTIC: readonly BankItem[] = [terms, isBst, insert, search, height]
