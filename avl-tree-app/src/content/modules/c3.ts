// Module C3 "The AVL property" (LO2, LO3). Source: ID content, C3.
// Every number comes from the facts the engine computes or from the conventions wording.
// The formula, the allowed range and which side a sign means come only from conventionsWording (D19).
// FLAGGED FOR THE USER TO READ: lines marked [beyond ID] are new wording, not in the ID.
// Lines marked [ID] restate the ID's C3 bullets.
import type { ModuleContent } from '../../modules/schema'
import { checkCopy } from '../check'

const PREVIEW = [10, 20, 30, 40, 50]
const SMALL_AVL = [20, 10, 30, 5]
const WORKED = [30, 20, 40, 10]
const list = (keys: readonly number[]) => keys.join(', ')
/** A height as displayed: 0, 1, −1 (no plus sign). */
const h = (n: number) => (n < 0 ? `−${-n}` : String(n))
const BOUND = { value: 1.44, reason: 'ID C3, stated without proof (D13)' }

export const c3: ModuleContent = {
  id: 'C3',
  steps: [
    {
      id: 'c3-hook',
      event: 'hook',
      heading: 'What keeps an AVL tree short?',
      primary: 'diagram',
      figures: [{ id: 'avl', source: { kind: 'avl', keys: PREVIEW }, label: `AVL tree from ${list(PREVIEW)}` }],
      text: ({ figures: { avl } }) => [
        // [beyond ID]
        `In C2, the keys ${list(avl.keys)} went into an AVL tree and came out with height ${avl.height}.`,
        'What rule keeps an AVL tree that short? This module names it.',
      ],
    },
    {
      id: 'c3-goals',
      event: 'goals',
      heading: 'What you will be able to do',
      primary: 'text',
      text: () => [
        'By the end of this module you can:', // [beyond ID]
        'say what height, balance factor and the AVL property are.', // [ID] LO2
        'work out balance factors and say whether a tree is AVL.', // [ID] LO3
      ],
    },
    {
      id: 'c3-recall',
      event: 'recall',
      heading: 'Remember: tall trees are slow',
      primary: 'text',
      text: () => [
        // [beyond ID] recalls C2
        'In C2 you saw that a search takes one step per level, so a tall tree is a slow tree.',
        'To keep search fast, a tree has to stay short. That needs a way to measure how tall each part of the tree is.',
      ],
    },
    {
      id: 'c3-height',
      event: 'content',
      heading: 'Height of a node',
      primary: 'diagram',
      figures: [{ id: 'tree', source: { kind: 'avl', keys: SMALL_AVL }, label: `AVL tree from ${list(SMALL_AVL)}` }],
      text: (_f, w) => [
        'The height of a node is the number of edges on the longest path from that node down to a leaf.', // [ID] convention
        w.heightRule, // [ID] convention, from the conventions module
        'Each node stores its height. The drawings show it under every node as h.', // [ID] "Each node stores its height"
      ],
    },
    {
      id: 'c3-bf',
      event: 'content',
      heading: 'Balance factor',
      primary: 'diagram',
      figures: [{ id: 'tree', source: { kind: 'bst', keys: WORKED }, label: `Plain BST from ${list(WORKED)}` }],
      text: () => [
        "Each node also has a balance factor. It compares the heights of the node's two subtrees.", // [ID]
        'The drawings show it under every node as bf.', // [beyond ID]
        'Press Show the rule to see how it is worked out.', // [beyond ID]
      ],
      rule: (w) => w.formula,
    },
    {
      id: 'c3-rule',
      event: 'content',
      heading: 'The AVL rule',
      primary: 'diagram',
      figures: [{ id: 'avl', source: { kind: 'avl', keys: PREVIEW }, label: `AVL tree from ${list(PREVIEW)}` }],
      claims: [{ figure: 'avl', is: 'avl' }],
      text: (_f, w) => [
        `A tree is an AVL tree when the balance factor of every node is ${w.rangeText}.`, // [ID]
        'Every node, not just the root: a tree can look fine at the top and still break the rule lower down.', // [ID]
        `${w.leanPhrase(1)} ${w.leanPhrase(-1)}`, // from the conventions module
      ],
      rule: (w) => w.formula,
    },
    {
      id: 'c3-not-perfect',
      event: 'content',
      heading: 'AVL does not mean perfect',
      primary: 'diagram',
      figures: [{ id: 'tree', source: { kind: 'avl', keys: SMALL_AVL }, label: `AVL tree from ${list(SMALL_AVL)}` }],
      claims: [
        { figure: 'tree', is: 'avl' },
        { figure: 'tree', is: 'not-perfect' },
      ],
      text: () => [
        'This tree is an AVL tree: every balance factor is in range.', // [ID]
        'It is not perfectly balanced, because one side goes deeper than the other. An AVL tree does not need to be perfect.', // [ID]
      ],
    },
    {
      id: 'c3-bound',
      event: 'content',
      heading: 'How tall can an AVL tree get?',
      primary: 'text',
      allow: [BOUND],
      text: () => [
        'Because every node keeps its balance factor in range, an AVL tree with n keys has height at most about 1.44 log2 n.', // [ID]
        'This module states that without proof.', // [ID] "No proof, just state it"
      ],
    },
    {
      id: 'c3-worked',
      event: 'example',
      heading: 'Working out one balance factor',
      primary: 'diagram',
      figures: [{ id: 'tree', source: { kind: 'bst', keys: WORKED }, label: `Plain BST from ${list(WORKED)}` }],
      text: ({ figures: { tree } }, w) => {
        const n = tree.nodes[20]
        return [
          // [beyond ID] worked example; values from the engine
          `Take node 20. Its left subtree is the leaf 10, with height ${h(n.leftHeight)}.`,
          `Its right subtree is empty, with height ${h(n.rightHeight)}.`,
          `So node 20 has balance factor ${w.num(n.balanceFactor)}.`,
        ]
      },
      rule: (w) => w.formula,
    },
    {
      id: 'c3-fill-in',
      event: 'practice',
      heading: 'Fill in the balance factors',
      primary: 'diagram',
      practice: 'fill-in-bf',
      figures: [{ id: 'tree', source: { kind: 'practice', generator: 'fill-in' }, label: 'Practice tree, balance factors hidden' }],
      text: () => [
        'Select a node, type its balance factor or use the − and + buttons, then press Check.', // [beyond ID]
        'Heights are shown. Balance factors stay hidden until you work them out.', // [beyond ID]
      ],
      rule: (w) => w.formula,
    },
    {
      id: 'c3-spot',
      event: 'practice',
      heading: 'Spot the problem',
      primary: 'diagram',
      practice: 'spot-the-problem',
      figures: [{ id: 'tree', source: { kind: 'practice', generator: 'root-looks-fine' }, label: 'Practice tree, find the node that breaks the rule' }],
      text: () => [
        "The root's balance factor is in range, so the tree looks fine at the top.", // [ID] "the root looks fine"
        'One other node breaks the AVL rule. Select it and press Check.', // [beyond ID]
      ],
      rule: (w) => `${w.formula}. Every node's balance factor must be ${w.rangeText}.`,
    },
    {
      id: 'c3-check',
      event: 'check',
      heading: 'Check your understanding',
      primary: 'text',
      text: () => [checkCopy.intro],
    },
    {
      id: 'c3-summary',
      event: 'summary',
      heading: 'Summary',
      primary: 'text',
      allow: [BOUND],
      text: (_f, w) => [
        // [beyond ID] restates the ID's C3 bullets
        w.heightRule,
        "Each node stores its height. Its balance factor compares the heights of its two subtrees.",
        `In an AVL tree every node's balance factor is ${w.rangeText}, not just the root's.`,
        'An AVL tree need not be perfect, and its height stays at most about 1.44 log2 n.',
      ],
    },
  ],
}
