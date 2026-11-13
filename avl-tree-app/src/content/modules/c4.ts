// Module C4 "Search" (LO4, LO5). Source: ID content, C4.
// Every number comes from the facts the engine computes: step counts, heights, keys and the
// million-key figures (D13: the AVL worst case is computed from minimum AVL node counts).
// FLAGGED FOR THE USER TO READ: lines marked [beyond ID] are new wording, not in the ID.
// Lines marked [ID] restate the ID's C4 bullets.
import type { ModuleContent } from '../../modules/schema'
import { checkCopy } from '../check'

const TREE = [50, 30, 70, 20, 40, 60, 80]
const EXAMPLE = [40, 20, 60, 10, 30, 50, 70]
const MILLION = 1_000_000
const list = (keys: readonly number[]) => keys.join(', ')
/** 1000000 as "1,000,000". */
const big = (n: number) => n.toLocaleString('en-US')

export const c4: ModuleContent = {
  id: 'C4',
  steps: [
    {
      id: 'c4-hook',
      event: 'hook',
      heading: 'A million keys, how many steps?',
      primary: 'text',
      bounds: [MILLION],
      text: ({ bounds: [b] }) => [
        // [beyond ID] picks up C2's million-key question
        `In C2, ${big(b.n)} sorted keys in a plain BST made a chain, and one search could take ${big(b.worst)} steps.`,
        'How many steps does the same search take in an AVL tree? This module finds out.',
      ],
    },
    {
      id: 'c4-goals',
      event: 'goals',
      heading: 'What you will be able to do',
      primary: 'text',
      text: () => [
        'By the end of this module you can:', // [beyond ID]
        "trace a search, for a key that's found and one that isn't.", // [ID] LO4
        'explain why AVL search is O(log2 n) but a plain BST can be O(n).', // [ID] LO5
      ],
    },
    {
      id: 'c4-recall',
      event: 'recall',
      heading: 'Remember: the BST ordering rule',
      primary: 'text',
      text: () => [
        // [beyond ID] recalls BST knowledge the ID assumes
        "In a BST, every key in a node's left subtree is smaller than the node's key, and every key in its right subtree is larger.",
        'So at each node a search only needs one comparison to know which way to go.',
      ],
    },
    {
      id: 'c4-algorithm',
      event: 'content',
      heading: 'Search is BST search',
      primary: 'animation',
      figures: [{ id: 'tree', source: { kind: 'avl', keys: TREE }, searchKey: 60, label: `AVL tree from ${list(TREE)}` }],
      replay: { figure: 'tree' },
      text: ({ figures: { tree } }) => [
        'Searching an AVL tree is the same as searching a plain BST.', // [ID]
        'It does not use balance factors. They only matter when the tree changes.', // [ID] first sentence; second [beyond ID]
        `Press Step to watch the search for ${tree.searchKey} one step at a time, with the matching line of pseudocode.`, // [beyond ID]
      ],
    },
    {
      id: 'c4-versions',
      event: 'content',
      heading: 'Two ways to write it',
      primary: 'pseudocode',
      listings: ['searchLoop', 'searchRecursive'],
      text: () => [
        'Here is the same search written two ways: with a loop, and as a function that calls itself.', // [ID] side by side; wording [beyond ID]
        'Both visit the same nodes in the same order.', // [beyond ID]
      ],
    },
    {
      id: 'c4-bound',
      event: 'content',
      heading: 'At most height + 1 steps',
      primary: 'diagram',
      figures: [{ id: 'tree', source: { kind: 'avl', keys: TREE }, searchKey: 20, label: `AVL tree from ${list(TREE)}` }],
      bounds: [MILLION],
      text: ({ figures: { tree }, bounds: [b] }) => [
        'A search visits at most one node on each level, so it takes at most height + 1 steps.', // [ID]
        `This tree has height ${tree.height}. Finding ${tree.searchKey} takes ${tree.searchSteps} steps.`, // [beyond ID]
        `With ${big(b.n)} keys, a search in an AVL tree takes at most ${b.avlWorst} steps. In a lopsided BST it can take up to ${big(b.worst)}.`, // [ID]
      ],
    },
    {
      id: 'c4-example-found',
      event: 'example',
      heading: 'Worked example: a key that is there',
      primary: 'animation',
      figures: [{ id: 'tree', source: { kind: 'avl', keys: EXAMPLE }, searchKey: 30, label: `AVL tree from ${list(EXAMPLE)}` }],
      replay: { figure: 'tree' },
      text: ({ figures: { tree } }) => [
        // [beyond ID]
        `Watch the search for ${tree.searchKey}. It visits ${tree.searchSteps} nodes and finds the key.`,
        'At each node it compares, then goes left for a smaller key or right for a larger one.',
      ],
    },
    {
      id: 'c4-example-missing',
      event: 'example',
      heading: 'Worked example: a key that is not there',
      primary: 'animation',
      figures: [{ id: 'tree', source: { kind: 'avl', keys: EXAMPLE }, searchKey: 55, label: `AVL tree from ${list(EXAMPLE)}` }],
      replay: { figure: 'tree' },
      text: ({ figures: { tree } }) => [
        // [beyond ID]
        `Watch the search for ${tree.searchKey}. It visits ${tree.searchSteps} nodes, then reaches an empty spot.`,
        `An empty spot means ${tree.searchKey} is not in the tree, and the search returns null.`,
      ],
    },
    {
      id: 'c4-practice-found',
      event: 'practice',
      heading: 'Be the algorithm',
      primary: 'diagram',
      practice: 'trace-search',
      searchPractice: 'found',
      text: () => [
        'Select the nodes the search visits, in order, starting at the root. The pseudocode lights the line the search is on.', // [ID] activity; wording [beyond ID]
      ],
    },
    {
      id: 'c4-practice-missing',
      event: 'practice',
      heading: 'Be the algorithm: a missing key',
      primary: 'diagram',
      practice: 'trace-search',
      searchPractice: 'missing',
      text: () => [
        // [beyond ID]
        'This key is not in the tree. Select the nodes the search visits, then press Not in the tree when it runs out of nodes.',
      ],
    },
    {
      id: 'c4-check',
      event: 'check',
      heading: 'Check your understanding',
      primary: 'text',
      text: () => [checkCopy.intro],
    },
    {
      id: 'c4-summary',
      event: 'summary',
      heading: 'Summary',
      primary: 'text',
      bounds: [MILLION],
      text: ({ bounds: [b] }) => [
        // [beyond ID] restates the ID's C4 bullets
        'Search in an AVL tree is BST search. It never looks at balance factors.',
        'It takes at most height + 1 steps, and an AVL tree stays short.',
        `So ${big(b.n)} keys take at most ${b.avlWorst} steps: AVL search is O(log2 n), while a lopsided BST can be O(n).`,
      ],
    },
  ],
}
