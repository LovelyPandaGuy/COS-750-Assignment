// Module C5 "Rotations" (LO6). Source: ID content, C5.
// Every key, root, case and rotation count comes from the facts the engine computes. Case names
// reach the text only through w.caseName (D19); none is typed here.
// FLAGGED FOR THE USER TO READ: lines marked [beyond ID] are new wording, not in the ID.
// Lines marked [ID] restate the ID's C5 bullets. Rotation wording ("rotate left at 10") follows the
// Do it yourself menu (proposal item 4).
import type { FigureFacts } from '../../modules/facts'
import type { ModuleContent } from '../../modules/schema'
import { checkCopy } from '../check'

const list = (keys: readonly number[]) => keys.join(', ')
const UP = [10, 20, 30]
const DOWN = [30, 20, 10]
const ZIG = [30, 10, 20]
const ZAG = [10, 30, 20]
const rotationsWord = (n: 1 | 2) => (n === 1 ? 'one rotation' : 'two rotations')

/** [beyond ID] The supporting rule, shown on demand. */
const ROTATION_RULE =
  "A rotation lifts one child of a node into that node's place, and the node becomes that child's child. Keys move up and down, but their order from left to right never changes."

/** One line per order in the four-cases example, built from that figure's facts. */
const caseLine = (f: FigureFacts, caseName: string) => {
  const r = f.rebalances[0]
  return `${list(f.keys)}: the ${caseName} case, fixed with ${rotationsWord(r.rotations)}. Root afterwards: ${f.avlRootKey}.`
}

export const c5: ModuleContent = {
  id: 'C5',
  steps: [
    {
      id: 'c5-hook',
      event: 'hook',
      heading: 'An insert breaks the rule',
      primary: 'diagram',
      figures: [{ id: 'tree', source: { kind: 'bst', keys: UP }, label: `Plain BST from ${list(UP)}` }],
      claims: [{ figure: 'tree', is: 'not-avl' }],
      text: ({ figures: { tree } }, w) => [
        // [beyond ID]
        `Insert ${list(tree.keys)} into a plain BST. Node 10 ends up with balance factor ${w.num(tree.nodes[10].balanceFactor)}, which the AVL rule does not allow.`,
        'How can the tree be fixed without breaking the BST order? This module shows the move that does it: the rotation.',
      ],
    },
    {
      id: 'c5-goals',
      event: 'goals',
      heading: 'What you will be able to do',
      primary: 'text',
      text: () => [
        'By the end of this module you can:', // [beyond ID]
        'do single and double rotations.', // [ID] LO6
      ],
    },
    {
      id: 'c5-recall',
      event: 'recall',
      heading: 'Remember: the AVL rule and BST order',
      primary: 'text',
      text: (_f, w) => [
        // [beyond ID] recalls C3 and C1
        `In C3 you saw that every node's balance factor must be ${w.rangeText}.`,
        "In a BST, every key in a node's left subtree is smaller than the node's key, and every key in its right subtree is larger. A fix must keep that true.",
      ],
    },
    {
      id: 'c5-single',
      event: 'content',
      heading: 'Single rotations',
      primary: 'diagram',
      figures: [
        { id: 'upBefore', source: { kind: 'bst', keys: UP }, label: `Plain BST from ${list(UP)}` },
        { id: 'upAfter', source: { kind: 'rotated', keys: UP, rotations: [{ dir: 'left', at: 10 }] }, label: 'After rotating left at 10' },
        { id: 'downBefore', source: { kind: 'bst', keys: DOWN }, label: `Plain BST from ${list(DOWN)}` },
        { id: 'downAfter', source: { kind: 'rotated', keys: DOWN, rotations: [{ dir: 'right', at: 30 }] }, label: 'After rotating right at 30' },
      ],
      claims: [
        { figure: 'upAfter', is: 'avl' },
        { figure: 'downAfter', is: 'avl' },
      ],
      text: ({ figures: { upAfter, downAfter } }) => [
        'There are two single rotations: left and right.', // [ID]
        // [beyond ID] captions; roots from the facts
        `Rotate left at 10: its right child comes up, and 10 becomes that child's left child. The new root is ${upAfter.rootKey}.`,
        `Rotate right at 30 is the mirror image: its left child comes up. The new root is ${downAfter.rootKey}.`,
      ],
      rule: () => ROTATION_RULE,
    },
    {
      id: 'c5-double',
      event: 'content',
      heading: 'Double rotations',
      primary: 'diagram',
      figures: [
        { id: 'start', source: { kind: 'bst', keys: ZIG }, label: `Plain BST from ${list(ZIG)}` },
        { id: 'middle', source: { kind: 'rotated', keys: ZIG, rotations: [{ dir: 'left', at: 10 }] }, label: 'After rotating left at 10' },
        {
          id: 'end',
          source: { kind: 'rotated', keys: ZIG, rotations: [{ dir: 'left', at: 10 }, { dir: 'right', at: 30 }] },
          label: 'After rotating left at 10, then right at 30',
        },
      ],
      claims: [{ figure: 'end', is: 'avl' }],
      text: ({ figures: { middle, end } }) => [
        'A double rotation is just two single rotations, one after the other.', // [ID]
        // [beyond ID] captions; roots from the facts
        `First rotate left at 10. The tree becomes a straight line with root ${middle.rootKey}.`,
        `Then rotate right at 30. Now ${end.rootKey} is the root.`,
      ],
      rule: () => ROTATION_RULE,
    },
    {
      id: 'c5-order',
      event: 'content',
      heading: 'Rotations keep the order',
      primary: 'diagram',
      figures: [
        { id: 'before', source: { kind: 'bst', keys: UP }, label: `Plain BST from ${list(UP)}` },
        { id: 'after', source: { kind: 'rotated', keys: UP, rotations: [{ dir: 'left', at: 10 }] }, label: 'After rotating left at 10' },
      ],
      claims: [
        { figure: 'after', is: 'bst' },
        { figure: 'after', is: 'same-order', as: 'before' },
      ],
      text: ({ figures: { before, after } }) => [
        'Rotations never break the BST order.', // [ID]
        // [beyond ID] in-order keys from the facts
        `Read the keys from left to right. Before the rotation: ${list(before.inOrder)}. After it: ${list(after.inOrder)}.`,
        'The shape changes, but every key stays between the same neighbours, so the tree is still a BST.',
      ],
    },
    {
      id: 'c5-cases',
      event: 'example',
      heading: 'Four orders, one result',
      primary: 'diagram',
      figures: [DOWN, UP, ZIG, ZAG].map((keys, i) => ({
        id: `order${i + 1}`,
        source: { kind: 'bst' as const, keys },
        label: `Plain BST from ${list(keys)}`,
      })),
      claims: [1, 2, 3, 4].map((i) => ({ figure: `order${i}`, is: 'not-avl' as const })),
      text: ({ figures }, w) => {
        const fs = [figures.order1, figures.order2, figures.order3, figures.order4]
        return [
          'Insert 10, 20 and 30 in any order that unbalances the tree. There are four such orders, one for each case.', // [ID]
          ...fs.map((f) => caseLine(f, w.caseName(f.rebalances[0].case))), // [beyond ID] wording; values from the engine
          `Every case ends with ${fs[0].avlRootKey} at the root.`, // [ID]
        ]
      },
      rule: () => ROTATION_RULE,
    },
    {
      id: 'c5-practice-single',
      event: 'practice',
      heading: 'Your turn: one rotation',
      primary: 'diagram',
      practice: 'rotate',
      figures: [{ id: 'tree', source: { kind: 'practice', generator: 'single-rotation' }, label: 'Practice tree after the insert' }],
      text: () => [
        // [beyond ID]
        'The key marked new has just gone in, and the tree is out of balance. Rebalance it.',
      ],
      rule: () => ROTATION_RULE,
    },
    {
      id: 'c5-practice-double',
      event: 'practice',
      heading: 'Your turn: two rotations',
      primary: 'diagram',
      practice: 'rotate',
      figures: [{ id: 'tree', source: { kind: 'practice', generator: 'double-rotation' }, label: 'Practice tree after the insert' }],
      text: () => [
        // [beyond ID]
        'This time one rotation is not enough. Rebalance the tree with a double rotation.',
      ],
      rule: () => ROTATION_RULE,
    },
    {
      id: 'c5-check',
      event: 'check',
      heading: 'Check your understanding',
      primary: 'text',
      text: () => [checkCopy.intro],
    },
    {
      id: 'c5-summary',
      event: 'summary',
      heading: 'Summary',
      primary: 'text',
      text: () => [
        // [beyond ID] restates the ID's C5 bullets
        'A single rotation, left or right, lifts one child into its parent\'s place.',
        'A double rotation is two single rotations, one after the other.',
        'Rotations never break the BST order.',
        'However three keys go in, a rotation fixes the tree, and every order ends with the same root.',
      ],
    },
  ],
}
