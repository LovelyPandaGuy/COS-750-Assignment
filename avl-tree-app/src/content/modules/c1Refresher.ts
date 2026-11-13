// The BST refresher shown after a low diagnostic result or on request (add-diagnostic-c1-and-routing).
// FLAGGED FOR THE USER TO READ AT G3: the ID says only "BST refresher", so every sentence is [beyond ID].
// Numbers come from the engine's facts; the height rule from the conventions wording (D2, D19).
import type { ModuleContent } from '../../modules/schema'

const KEYS = [40, 20, 60, 10, 30, 50, 70]
const tree = { id: 'tree', source: { kind: 'bst' as const, keys: KEYS }, searchKey: 30, label: 'A binary search tree' }

export const C1_REFRESHER: ModuleContent = {
  id: 'C1',
  steps: [
    {
      id: 'c1r-hook',
      event: 'hook',
      heading: 'A tree with a rule',
      primary: 'diagram',
      figures: [tree],
      claims: [{ figure: 'tree', is: 'bst' }],
      text: ({ figures: { tree: t } }) => [
        `Here is a binary search tree with ${t.nodeCount} keys.`,
        'Its keys follow a rule about where each one sits. That rule is what makes looking a key up quick.',
      ],
    },
    {
      id: 'c1r-goals',
      event: 'goals',
      heading: 'What you will be able to do',
      primary: 'text',
      text: () => [
        'By the end of this refresher you can:',
        'name the parts of a tree, say the ordering rule, search for a key, insert a key and find the height of a tree.',
      ],
    },
    {
      id: 'c1r-terms',
      event: 'recall',
      heading: 'Terms: root, leaf, child and subtree',
      primary: 'diagram',
      figures: [tree],
      text: ({ figures: { tree: t } }) => [
        `The root is the node at the top, here ${t.rootKey}.`,
        'The children of a node are the nodes directly below it. A node with no children is a leaf.',
        'A subtree is a node together with everything below it.',
      ],
    },
    {
      id: 'c1r-order',
      event: 'content',
      heading: 'The ordering rule',
      primary: 'diagram',
      figures: [tree],
      claims: [{ figure: 'tree', is: 'bst' }],
      text: ({ figures: { tree: t } }) => [
        'Every key in a left subtree is smaller than the node above it, and every key in a right subtree is larger. This holds at every node, not only at the root.',
        `Read the keys from left to right and they come out in order: ${t.inOrder.join(', ')}.`,
      ],
    },
    {
      id: 'c1r-search-insert',
      event: 'content',
      heading: 'Search and insert',
      primary: 'diagram',
      figures: [tree],
      text: ({ figures: { tree: t } }) => [
        `To search for ${t.searchKey}, compare it with the root. Go left if it is smaller and right if it is larger, and repeat until you find it or run out of tree. Here that takes ${t.searchSteps} steps.`,
        'To insert a key, search for it. It goes where the search ends, as a new leaf.',
      ],
    },
    {
      id: 'c1r-height',
      event: 'content',
      heading: 'Height',
      primary: 'diagram',
      figures: [tree],
      text: ({ figures: { tree: t } }, w) => [
        w.heightRule,
        `The height of a tree is the number of edges on its longest path from the root down to a leaf. This tree has height ${t.height}.`,
      ],
    },
  ],
}
