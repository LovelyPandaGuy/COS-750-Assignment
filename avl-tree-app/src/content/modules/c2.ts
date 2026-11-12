// Module C2 "When BSTs go lopsided" (LO1). Source: ID content, C2.
// Every number comes from the facts the engine computes; nothing is typed.
// FLAGGED FOR THE USER TO READ: lines marked [beyond ID] are new wording, not in the ID.
// Lines marked [ID] restate the ID's C2 bullets.
import type { ModuleContent } from '../../modules/schema'
import { screenCopy } from '../screens'

const KEYS = [10, 20, 30, 40, 50]
const fmt = (n: number) => n.toLocaleString('en-US')
const list = (keys: readonly number[]) => keys.join(', ')

export const c2: ModuleContent = {
  id: 'C2',
  steps: [
    {
      id: 'c2-hook',
      event: 'hook',
      heading: 'A tree that is just a line',
      primary: 'diagram',
      figures: [{ id: 'chain', source: { kind: 'bst', keys: KEYS }, searchKey: 50, label: `Plain BST from ${list(KEYS)}` }],
      text: ({ figures: { chain } }) => [
        `Insert ${list(chain.keys)} into a plain BST, in that order.`, // [ID]
        'Each new key is larger than every key before it, so it always goes right. The tree becomes a straight line.', // [beyond ID] first sentence
        `Finding ${chain.searchKey} takes ${chain.searchSteps} steps.`, // [ID]
        'What about a million sorted keys?', // [ID]
      ],
    },
    {
      id: 'c2-goals',
      event: 'goals',
      heading: 'What you will be able to do',
      primary: 'text',
      text: () => [
        'By the end of this module you can:', // [beyond ID]
        'explain why BST height = search cost, and how insertion order can make a BST lopsided.', // [ID] LO1
      ],
    },
    {
      id: 'c2-recall',
      event: 'recall',
      heading: 'Remember: searching a BST',
      primary: 'text',
      text: () => [
        // [beyond ID] prerequisite recap (C1 skills: BST ordering, BST search path)
        "In a BST, every key in a node's left subtree is smaller than the node's key, and every key in its right subtree is larger.",
        'A search starts at the root and compares: a smaller key goes left, a larger key goes right, until it finds the key or runs out of tree.',
      ],
    },
    {
      id: 'c2-height-cost',
      event: 'content',
      heading: 'Search cost follows height',
      primary: 'diagram',
      figures: [{ id: 'chain', source: { kind: 'bst', keys: KEYS }, searchKey: 50, label: `Plain BST from ${list(KEYS)}` }],
      text: ({ figures: { chain } }) => [
        'A search moves down one level at each step, so the number of steps depends on how tall the tree is.', // [ID] "Search time depends on height"
        'Height counts the edges on the longest path from the root down to a leaf.', // [ID] convention (edges)
        `This chain has height ${chain.height}. Finding ${chain.searchKey} visits every node on the way down: ${chain.searchSteps} steps.`, // [beyond ID] wording
      ],
    },
    {
      id: 'c2-bounds',
      event: 'content',
      heading: 'Best case and worst case',
      primary: 'text',
      bounds: [KEYS.length, 1_000_000],
      text: ({ bounds }) => [
        'The best case is about log2 n steps, when the tree is as short as it can be. The worst case is n steps, when the tree is a straight line.', // [ID]
        ...bounds.map((b) => `With ${fmt(b.n)} keys: best case ${fmt(b.best)} steps, worst case ${fmt(b.worst)} steps.`), // [beyond ID] wording
        'So with a million sorted keys in a plain BST, one search can take a million steps.', // [beyond ID] answers the hook
      ],
    },
    {
      id: 'c2-order',
      event: 'example',
      heading: 'Insertion order decides the shape',
      primary: 'diagram',
      figures: [
        { id: 'shuffled', source: { kind: 'bst', keys: [30, 20, 40, 10, 50] }, label: 'Plain BST from 30, 20, 40, 10, 50' },
        { id: 'chain', source: { kind: 'bst', keys: KEYS }, label: `Plain BST from ${list(KEYS)}` },
      ],
      text: ({ figures: { shuffled, chain } }) => [
        `The same five keys, inserted as ${list(shuffled.keys)}, give a tree of height ${shuffled.height}.`, // [beyond ID] example choice
        `Inserted as ${list(chain.keys)}, they give a chain of height ${chain.height}.`,
        'Insertion order decides the shape of the tree, and the shape decides how long a search takes.', // [ID]
      ],
    },
    {
      id: 'c2-preview',
      event: 'example',
      heading: 'Preview: the same keys in an AVL tree',
      primary: 'diagram',
      figures: [
        { id: 'avl', source: { kind: 'avl', keys: KEYS }, label: `AVL tree from ${list(KEYS)}` },
        { id: 'chain', source: { kind: 'bst', keys: KEYS }, label: `Plain BST from ${list(KEYS)}` },
      ],
      claims: [{ figure: 'avl', is: 'avl' }],
      text: ({ figures: { avl, chain } }) => [
        `In an AVL tree, the same keys give height ${avl.height} instead of ${chain.height}.`, // [ID] "Preview"
        'An AVL tree keeps its own shape short as keys go in. Modules C5 and C6 show how.', // [beyond ID]
      ],
    },
    {
      id: 'c2-check',
      event: 'check',
      heading: 'Check your understanding',
      primary: 'text',
      text: () => [screenCopy.coming], // checks arrive with the assessment changes (19 to 21)
    },
    {
      id: 'c2-summary',
      event: 'summary',
      heading: 'Summary',
      primary: 'text',
      text: () => [
        // [beyond ID] restates the ID's three C2 bullets
        'A search takes one step per level, so the height of a BST decides its search cost.',
        'The order keys go in decides the shape: sorted keys make a straight line.',
        'Best case about log2 n steps, worst case n steps.',
      ],
    },
  ],
}
