// Module C6 "Insertion with rebalancing" (LO7). Source: ID content, C6.
// Every key, node, height, rotation count and the million-key figure comes from the facts the
// engine computes. Case names reach the text only through w.caseName (D19); none is typed here.
// FLAGGED FOR THE USER TO READ: lines marked [beyond ID] are new wording, not in the ID.
// Lines marked [ID] restate the ID's C6 bullets.
//
// Example keys were chosen with the engine (proposal item 3):
// - running example, steps 1, 2 and 5: 30, 20 then 10 (one rotation).
// - lowest unbalanced node: 20, 10, 30, 5 then 1 leaves two nodes out of balance.
// - the case step: a single (10, 20 then 30) and a double rotation (30, 10 then 20).
// - done for you: 20, 10, 40, 30, 50 then 60. Guided by node: 40, 20, 60, 10, 30 then 5 (the
//   unbalanced node is not the parent of the new leaf). Guided by case: the same tree as done for
//   you, then 35, so the learner sees one tree give a different case for a different key.
import type { ModuleContent } from '../../modules/schema'
import { checkCopy } from '../check'

const RUN = [30, 20]
const RUN_KEY = 10
const LOW = [20, 10, 30, 5]
const LOW_KEY = 1
const SINGLE = [10, 20]
const SINGLE_KEY = 30
const DOUBLE = [30, 10]
const DOUBLE_KEY = 20
const WATCH = [20, 10, 40, 30, 50]
const WATCH_KEY = 60
const NODE = [40, 20, 60, 10, 30]
const NODE_KEY = 5
const CASE = WATCH
const CASE_KEY = 35
const MILLION = 1_000_000

const list = (keys: readonly number[]) => keys.join(', ')
/** 1000000 as "1,000,000". */
const big = (n: number) => n.toLocaleString('en-US')
const rotationsWord = (n: 0 | 1 | 2) => (n === 1 ? 'one rotation' : 'two rotations')

export const c6: ModuleContent = {
  id: 'C6',
  steps: [
    {
      id: 'c6-hook',
      event: 'hook',
      heading: 'Where does an imbalance come from?',
      primary: 'text',
      text: () => [
        // [beyond ID]
        'In C5 you rotated a tree that was out of balance. But where does the imbalance come from?',
        'It starts with an insert. This module follows one insert from start to finish.',
      ],
    },
    {
      id: 'c6-goals',
      event: 'goals',
      heading: 'What you will be able to do',
      primary: 'text',
      text: () => [
        'By the end of this module you can:', // [beyond ID]
        'insert into an AVL tree: find the unbalanced node, pick the case, and rotate.', // [ID] LO7
      ],
    },
    {
      id: 'c6-recall',
      event: 'recall',
      heading: 'Remember: balance factors and rotations',
      primary: 'text',
      text: (_f, w) => [
        // [beyond ID] recalls C3 and C5
        `In C3 you learned that every node stores a height and has a balance factor, and that in an AVL tree every balance factor is ${w.rangeText}.`,
        'In C5 you learned that a rotation fixes a node that is out of balance without changing the left-to-right order of the keys.',
      ],
    },
    {
      id: 'c6-outline',
      event: 'content',
      heading: 'The five steps of an insert',
      primary: 'pseudocode',
      listings: ['insert'],
      text: () => [
        'Every insert into an AVL tree follows the same five steps.', // [ID] steps; wording [beyond ID]
        'The next five screens take them one at a time.', // [beyond ID]
      ],
    },
    {
      id: 'c6-insert',
      event: 'content',
      heading: 'BST insert',
      primary: 'diagram',
      figures: [
        { id: 'before', source: { kind: 'avl', keys: RUN }, label: `AVL tree from ${list(RUN)}` },
        { id: 'after', source: { kind: 'inserted', keys: RUN, key: RUN_KEY, rebalance: false }, label: `The same tree after a plain BST insert of ${RUN_KEY}` },
      ],
      claims: [
        { figure: 'before', is: 'avl' },
        { figure: 'after', is: 'not-avl' },
      ],
      text: ({ figures: { after } }) => [
        `First, insert ${after.insert!.key} exactly as a plain BST would: compare it with each node on the way down and add it as a new leaf.`, // [ID] "BST insert"; wording [beyond ID]
        'Nothing is rebalanced yet, so the result may break the AVL rule.', // [beyond ID]
      ],
    },
    {
      id: 'c6-heights',
      event: 'content',
      heading: 'Update the heights going up',
      primary: 'diagram',
      figures: [
        { id: 'before', source: { kind: 'avl', keys: RUN }, label: `AVL tree from ${list(RUN)}` },
        { id: 'after', source: { kind: 'inserted', keys: RUN, key: RUN_KEY, rebalance: false }, label: `After a plain BST insert of ${RUN_KEY}` },
      ],
      text: ({ figures: { before, after } }) => [
        'Only the nodes on the path from the new leaf up to the root can change height.', // [beyond ID]
        `The tree's height goes from ${before.height} to ${after.height}. Compare the heights drawn under the nodes in the two trees.`, // [beyond ID]
        'Each node stores its height, so the insert updates them as it walks back up.', // [ID] "update heights going up"
      ],
    },
    {
      id: 'c6-lowest',
      event: 'content',
      heading: 'Find the lowest unbalanced node',
      primary: 'diagram',
      figures: [
        { id: 'plain', source: { kind: 'inserted', keys: LOW, key: LOW_KEY, rebalance: false }, label: `After a plain BST insert of ${LOW_KEY}` },
        { id: 'fixed', source: { kind: 'inserted', keys: LOW, key: LOW_KEY, rebalance: true }, label: `After the AVL insert of ${LOW_KEY}` },
      ],
      claims: [
        { figure: 'plain', is: 'not-avl' },
        { figure: 'fixed', is: 'avl' },
      ],
      text: ({ figures: { plain } }) => [
        `After a plain insert of ${plain.insert!.key}, more than one node can be out of balance: here ${list(plain.violations)}.`, // [beyond ID]
        `Start at the lowest one, node ${plain.violations[0]}. That is the node to fix.`, // [ID] "find the lowest unbalanced node"
        'Fixing it also fixes the nodes above it, so the AVL insert rebalances only there and the tree is an AVL tree again.', // [beyond ID]
      ],
    },
    {
      id: 'c6-case',
      event: 'content',
      heading: 'Work out the case',
      primary: 'diagram',
      figures: [
        { id: 'single', source: { kind: 'inserted', keys: SINGLE, key: SINGLE_KEY, rebalance: false }, label: `After a plain BST insert of ${SINGLE_KEY}` },
        { id: 'double', source: { kind: 'inserted', keys: DOUBLE, key: DOUBLE_KEY, rebalance: false }, label: `After a plain BST insert of ${DOUBLE_KEY}` },
      ],
      text: ({ figures: { single, double } }, w) => [
        'The case depends on the unbalanced node and its taller child.', // [ID] "work out the case"; wording [beyond ID]
        `Inserting ${single.insert!.key} unbalances node ${single.insert!.node}. This is the ${w.caseName(single.insert!.case!)} case, fixed with ${rotationsWord(single.insert!.rotations)}.`,
        `Inserting ${double.insert!.key} unbalances node ${double.insert!.node}. This is the ${w.caseName(double.insert!.case!)} case, fixed with ${rotationsWord(double.insert!.rotations)}.`,
        'When the node and its taller child are heavy in the same direction, one rotation is enough. When they are heavy in opposite directions, it takes two.', // [beyond ID]
      ],
    },
    {
      id: 'c6-rotate',
      event: 'content',
      heading: 'Rotate',
      primary: 'diagram',
      figures: [
        { id: 'plain', source: { kind: 'inserted', keys: RUN, key: RUN_KEY, rebalance: false }, label: `After a plain BST insert of ${RUN_KEY}` },
        { id: 'fixed', source: { kind: 'inserted', keys: RUN, key: RUN_KEY, rebalance: true }, label: `After the AVL insert of ${RUN_KEY}` },
      ],
      claims: [
        { figure: 'plain', is: 'not-avl' },
        { figure: 'fixed', is: 'avl' },
        { figure: 'fixed', is: 'same-order', as: 'plain' },
      ],
      text: ({ figures: { plain, fixed } }) => [
        `${rotationsWord(plain.insert!.rotations)} at node ${plain.insert!.node} fixes the tree.`, // [ID] "rotate"; wording [beyond ID]
        `The keys keep their left-to-right order, ${list(fixed.inOrder)}. Afterwards the root is ${fixed.rootKey} and the height is ${fixed.height}.`, // [beyond ID]
      ],
    },
    {
      id: 'c6-enough',
      event: 'content',
      heading: 'One rotation is always enough',
      primary: 'text',
      bounds: [MILLION],
      text: ({ bounds: [b] }) => [
        'An insert needs at most one rebalance: one single rotation or one double rotation.', // [ID]
        `With ${big(b.n)} keys, the walk down visits at most ${b.avlWorst} nodes in an AVL tree, and then at most one rebalance is needed.`, // [beyond ID] ties to C4
        'That is why insertion stays O(log2 n).', // [ID]
      ],
    },
    {
      id: 'c6-example-watch',
      event: 'example',
      heading: 'Worked example: done for you',
      primary: 'animation',
      figures: [{ id: 't', source: { kind: 'avl', keys: WATCH }, label: `AVL tree from ${list(WATCH)}` }],
      replay: { figure: 't', insert: WATCH_KEY },
      text: ({ figures: { t } }, w) => [
        // [beyond ID]
        `Watch ${t.insert!.key} go into the AVL tree of ${list(t.keys)}. Press Step to go one step at a time.`,
        `Node ${t.insert!.node} goes out of balance. This is the ${w.caseName(t.insert!.case!)} case, and ${rotationsWord(t.insert!.rotations)} fixes it.`,
      ],
    },
    {
      id: 'c6-example-node',
      event: 'example',
      heading: 'Worked example: you predict the node',
      primary: 'animation',
      figures: [{ id: 't', source: { kind: 'avl', keys: NODE }, label: `AVL tree from ${list(NODE)}` }],
      replay: { figure: 't', insert: NODE_KEY, predict: 'node' },
      text: ({ figures: { t } }) => [
        // [beyond ID] guided
        `This time you make the call first. Predict which node goes out of balance when ${t.insert!.key} goes in, then watch the replay.`,
        'Predictions are practice. They are never marked.',
      ],
    },
    {
      id: 'c6-example-case',
      event: 'example',
      heading: 'Worked example: you predict the case',
      primary: 'animation',
      figures: [{ id: 't', source: { kind: 'avl', keys: CASE }, label: `AVL tree from ${list(CASE)}` }],
      replay: { figure: 't', insert: CASE_KEY, predict: 'case', doItYourself: true },
      text: ({ figures: { t } }) => [
        // [beyond ID] guided, with Do it yourself on offer
        `This is the same tree as before, but ${t.insert!.key} goes in. Predict the case, then watch.`,
        'Afterwards you can switch to Do it yourself and rotate the tree yourself.',
      ],
    },
    {
      id: 'c6-practice',
      event: 'practice',
      heading: 'On your own: name the case, then rotate',
      primary: 'diagram',
      practice: 'name-case',
      figures: [{ id: 'tree', source: { kind: 'practice', generator: 'insert-rebalance' }, label: 'Practice tree after the insert' }],
      text: () => [
        // [beyond ID] "on your own"; the ID asks for random keys so retries are new problems
        'A key has just been inserted with a plain BST insert. Work out which case applies, then rotate the tree yourself.',
        'New tree gives you a new problem.',
      ],
      rule: (w) => `${w.formula}. Every node's balance factor must be ${w.rangeText}.`,
    },
    {
      id: 'c6-check',
      event: 'check',
      heading: 'Check your understanding',
      primary: 'text',
      text: () => [checkCopy.intro],
    },
    {
      id: 'c6-summary',
      event: 'summary',
      heading: 'Summary',
      primary: 'text',
      text: () => [
        // [beyond ID] restates the ID's C6 bullets
        'An insert is a BST insert, then the heights are updated on the way back up.',
        'Find the lowest unbalanced node, work out the case, and rotate there.',
        'One rebalance, a single or a double rotation, is always enough, so insertion stays O(log2 n).',
      ],
    },
  ],
}
