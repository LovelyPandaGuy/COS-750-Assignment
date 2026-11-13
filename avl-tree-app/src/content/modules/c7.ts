// Module C7 "Deletion" (LO8, optional). Source: ID content, C7.
// Every key, successor, unbalanced node and rebalance count comes from the facts the engine
// computes. No deletion case names are shown (lecturer question 4, D19).
// FLAGGED FOR THE USER TO READ: lines marked [beyond ID] are new wording, not in the ID.
// Lines marked [ID] restate the ID's C7 bullets.
import type { ModuleContent } from '../../modules/schema'
import { screenCopy } from '../screens'

const RECAP = [50, 30, 70, 20, 40, 60, 80]
const ONE_CHILD = [50, 30, 70, 20, 60, 80]
const SMALL = [20, 10, 30, 40]
/** Found with the engine: deleting 12 (or 11) needs two rebalances (proposal item 3). */
const MULTI = [8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1]
const list = (keys: readonly number[]) => keys.join(', ')
/** "11 and then at 8" from the facts. */
const nodes = (rs: readonly { node: number }[]) => rs.map((r) => r.node).join(', then at ')

export const c7: ModuleContent = {
  id: 'C7',
  steps: [
    {
      id: 'c7-hook',
      event: 'hook',
      heading: 'Taking a key out',
      primary: 'text',
      text: () => [
        // [beyond ID]
        'Inserting always adds a new leaf. Deleting can take out any node, even the root.',
        'What does that do to the balance of the tree, and how is it fixed?',
      ],
    },
    {
      id: 'c7-goals',
      event: 'goals',
      heading: 'What you will be able to do',
      primary: 'text',
      text: () => [
        'By the end of this module you can:', // [beyond ID]
        'delete a key from an AVL tree and rebalance it.', // [ID] LO8
        'This module is extra and optional.', // [ID] "Extra, optional"
      ],
    },
    {
      id: 'c7-recall',
      event: 'recall',
      heading: 'Remember: rotations fix a node',
      primary: 'text',
      text: () => [
        // [beyond ID] recalls C5
        'In C5 you fixed a node that was out of balance with a rotation, and the in-order keys stayed the same.',
        'Deleting uses the same rotations. First, a quick recap of how a plain BST deletes a key.', // [ID] "a quick recap of BST delete"
      ],
    },
    {
      id: 'c7-delete-leaf',
      event: 'content',
      heading: 'Deleting a leaf',
      primary: 'diagram',
      figures: [
        { id: 'before', source: { kind: 'bst', keys: RECAP }, label: `Plain BST from ${list(RECAP)}` },
        { id: 'after', source: { kind: 'deleted', build: 'bst', keys: RECAP, remove: [20], rebalance: false }, label: 'The same BST after deleting 20' },
      ],
      text: ({ figures: { after } }) => [
        `${after.deletes![0].key} is a leaf, so it is simply removed.`, // [ID] recap; wording [beyond ID]
      ],
    },
    {
      id: 'c7-delete-one-child',
      event: 'content',
      heading: 'Deleting a node with one child',
      primary: 'diagram',
      figures: [
        { id: 'before', source: { kind: 'bst', keys: ONE_CHILD }, label: `Plain BST from ${list(ONE_CHILD)}` },
        { id: 'after', source: { kind: 'deleted', build: 'bst', keys: ONE_CHILD, remove: [30], rebalance: false }, label: 'The same BST after deleting 30' },
      ],
      text: ({ figures: { after } }) => [
        `${after.deletes![0].key} has one child, so that child moves up into its place.`, // [ID] recap; wording [beyond ID]
      ],
    },
    {
      id: 'c7-delete-two-children',
      event: 'content',
      heading: 'Deleting a node with two children',
      primary: 'diagram',
      figures: [
        { id: 'before', source: { kind: 'bst', keys: RECAP }, label: `Plain BST from ${list(RECAP)}` },
        { id: 'after', source: { kind: 'deleted', build: 'bst', keys: RECAP, remove: [50], rebalance: false }, label: 'The same BST after deleting 50' },
      ],
      text: ({ figures: { after } }) => {
        const d = after.deletes![0]
        return [
          // [ID] recap; the in-order successor follows SE 6.4 and the engine; wording [beyond ID]
          `${d.key} has two children. It takes the key of its in-order successor, ${d.successor}: the smallest key in its right subtree.`,
          `Then ${d.successor} is removed from where it was, which is always a leaf or a node with one child.`,
        ]
      },
    },
    {
      id: 'c7-rebalance-up',
      event: 'content',
      heading: 'Rebalancing on the way back up',
      primary: 'diagram',
      figures: [
        { id: 'plain', source: { kind: 'deleted', build: 'avl', keys: SMALL, remove: [10], rebalance: false }, label: 'After a plain delete of 10' },
        { id: 'fixed', source: { kind: 'deleted', build: 'avl', keys: SMALL, remove: [10], rebalance: true }, label: 'After the AVL delete of 10' },
      ],
      text: ({ figures: { plain, fixed } }) => [
        `In the AVL tree from ${list(SMALL)}, deleting ${plain.deletes![0].key} as in a plain BST leaves node ${plain.violations[0]} out of balance.`, // [beyond ID]
        'An AVL delete then walks back up the path to the root and rotates at any node that is out of balance.', // [ID] "rebalance going back up"
        `Here one rebalance, at ${nodes(fixed.deletes![0].rebalances)}, fixes the tree.`, // [beyond ID]
      ],
    },
    {
      id: 'c7-more-than-one',
      event: 'content',
      heading: 'Sometimes more than one rotation',
      primary: 'diagram',
      figures: [
        { id: 'plain', source: { kind: 'deleted', build: 'avl', keys: MULTI, remove: [12], rebalance: false }, label: 'After a plain delete of 12' },
        { id: 'fixed', source: { kind: 'deleted', build: 'avl', keys: MULTI, remove: [12], rebalance: true }, label: 'After the AVL delete of 12' },
      ],
      claims: [{ figure: 'fixed', is: 'multi-rebalance' }],
      text: ({ figures: { fixed } }) => {
        const d = fixed.deletes![0]
        return [
          'Unlike insert, delete can need more than one rotation.', // [ID]
          `Deleting ${d.key} from this tree needs ${d.rebalances.length} rebalances on the way up: at ${nodes(d.rebalances)}.`, // [beyond ID]
          'A rotation can make a subtree one level shorter, which can leave a node higher up out of balance.', // [beyond ID]
        ]
      },
    },
    {
      id: 'c7-example',
      event: 'example',
      heading: 'Worked example: delete, then walk up',
      primary: 'diagram',
      figures: [
        { id: 'plain', source: { kind: 'deleted', build: 'avl', keys: MULTI, remove: [11], rebalance: false }, label: 'After a plain delete of 11' },
        { id: 'fixed', source: { kind: 'deleted', build: 'avl', keys: MULTI, remove: [11], rebalance: true }, label: 'After the AVL delete of 11' },
      ],
      text: ({ figures: { plain, fixed } }) => {
        const d = plain.deletes![0]
        return [
          // [beyond ID]
          `Delete ${d.key} as in a plain BST: it has two children, so its in-order successor ${d.successor} takes its place.`,
          `Now walk back up from there. The lowest node out of balance is ${plain.violations[0]}, so the first rebalance happens there.`,
          `Keep walking up to the root. The AVL delete rebalances at ${nodes(fixed.deletes![0].rebalances)}, and the tree is an AVL tree again.`,
        ]
      },
    },
    {
      id: 'c7-find-after-delete',
      event: 'practice',
      heading: 'Find the unbalanced node',
      primary: 'diagram',
      practice: 'after-delete',
      text: () => [
        // [beyond ID]
        'A key has been deleted with a plain BST delete. Select the lowest node that is now out of balance, then press Check.',
        'Heights are shown. Balance factors stay hidden until you find it.',
      ],
      rule: (w) => `${w.formula}. Every node's balance factor must be ${w.rangeText}.`,
    },
    {
      id: 'c7-check',
      event: 'check',
      heading: 'Check your understanding',
      primary: 'text',
      text: () => [screenCopy.coming], // optional check (ID C7, D4); arrives with changes 19 to 21 (D42)
    },
    {
      id: 'c7-summary',
      event: 'summary',
      heading: 'Summary',
      primary: 'text',
      text: () => [
        // [beyond ID] restates the ID's C7 bullets
        'A leaf is removed. A node with one child is replaced by that child. A node with two children takes the key of its in-order successor.',
        'Then an AVL delete walks back up to the root and rotates at any node out of balance.',
        'Unlike insert, delete can need more than one rotation.',
        'This module is optional: its check never blocks the readiness summary.',
      ],
    },
  ],
}
