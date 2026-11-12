// Module C8 "Choosing a structure" (LO9, LO5). Source: ID content, C8.
// Every key, step count, probe count and rotation count comes from the facts the engine computes.
// Every cost class and every scenario answer comes from the structure record (structures.ts),
// which is itself flagged for gate G3.
// FLAGGED FOR THE USER TO READ: lines marked [beyond ID] are new wording or facts, not in the ID.
// Lines marked [ID] restate the ID's C8 bullets or LO5 and LO9.
import type { ModuleContent, Step } from '../../modules/schema'
import { screenCopy } from '../screens'
import { NEEDS, SCENARIOS, STRUCTURES, structureSummary } from './structures'

/** The same sorted keys go into every figure (proposal item 4: a small set, not a million). */
export const RACE_KEYS: readonly number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]
const LAST = RACE_KEYS[RACE_KEYS.length - 1]
const range = (keys: readonly number[]) => `${keys[0]} to ${keys[keys.length - 1]}`
const steps = (n: number) => (n === 1 ? '1 step' : `${n} steps`)

const BST = STRUCTURES.bst
const AVL = STRUCTURES.avl
const ARRAY = STRUCTURES['sorted-array']
const HASH = STRUCTURES['hash-table']

/** The comparison in words, one sentence per structure from the record (Show the rule, Review). */
const SUMMARY_RULE = () => structureSummary().join(' ')

const chainLabel = `Plain BST from ${range(RACE_KEYS)}, inserted in order`
const avlLabel = `AVL tree from ${range(RACE_KEYS)}, inserted in order`

const practiceStep = (id: string, heading: string, scenarios: string[]): Step => ({
  id,
  event: 'practice',
  heading,
  primary: 'text',
  practice: 'scenario',
  scenarios,
  rule: SUMMARY_RULE,
  text: () => [
    'Read the situation, then choose the structure that fits it best.', // [beyond ID]
  ],
})

const WORKED = 'timetable'

export const c8: ModuleContent = {
  id: 'C8',
  steps: [
    {
      id: 'c8-hook',
      event: 'hook',
      heading: 'Same keys, two trees',
      primary: 'diagram',
      figures: [
        { id: 'chain', source: { kind: 'bst', keys: RACE_KEYS }, searchKey: LAST, label: chainLabel },
        { id: 'avl', source: { kind: 'avl', keys: RACE_KEYS }, searchKey: LAST, label: avlLabel },
      ],
      claims: [
        { figure: 'chain', is: 'not-avl' },
        { figure: 'avl', is: 'avl' },
      ],
      text: ({ figures: { chain, avl } }) => [
        // [beyond ID] wording; the comparison is the ID's C2 and C4 point, recalled for C8
        `The same ${chain.nodeCount} keys, ${range(chain.keys)}, went into a plain BST and into an AVL tree, in increasing order.`,
        `Finding ${chain.searchKey} takes ${steps(chain.searchSteps!)} in the plain BST and ${steps(avl.searchSteps!)} in the AVL tree.`,
        'So is an AVL tree always the best choice? This module compares it with three other ways to store keys.',
      ],
    },
    {
      id: 'c8-goals',
      event: 'goals',
      heading: 'What you will be able to do',
      primary: 'text',
      text: () => [
        'By the end of this module you can:', // [beyond ID]
        'pick a structure for a scenario (AVL tree, BST, sorted array, hash table) and say why.', // [ID] LO9
        'explain why AVL search is O(log2 n) but a plain BST can be O(n).', // [ID] LO5
      ],
    },
    {
      id: 'c8-recall',
      event: 'recall',
      heading: 'Remember: search cost follows height',
      primary: 'text',
      text: (_f, w) => [
        // [beyond ID] recalls C2 and C3
        'A search in a tree moves down one level at each step, so its cost follows the height of the tree.',
        `An AVL tree keeps every balance factor at ${w.rangeText}, and that keeps its height small however the keys arrive.`,
      ],
    },
    {
      id: 'c8-array',
      event: 'content',
      heading: 'A sorted array',
      primary: 'diagram',
      arrays: [{ id: 'arr', keys: RACE_KEYS, searchKey: LAST, label: `Sorted array of ${range(RACE_KEYS)}` }],
      text: ({ arrays: { arr } }) => [
        // [beyond ID] the whole step: the ID names the sorted array but gives no costs
        `A sorted array holds the same ${arr.sorted.length} keys side by side, smallest first, and nothing else.`,
        `Binary search checks the middle key, then keeps only the half that can hold the key it wants. Finding ${arr.searchKey} takes ${arr.probeCount} probes.`,
        `Inserting is the slow part: every larger key has to move along one place first, so an insert takes ${ARRAY.insert.worst} steps.`,
      ],
    },
    {
      id: 'c8-hash',
      event: 'content',
      heading: 'A hash table',
      primary: 'text',
      text: () => [
        // [beyond ID] the whole step: the ID names the hash table but gives no costs
        `A hash table works out where a key belongs from the key itself, so a typical search or insert takes ${HASH.search.typical} steps, however many keys it holds.`,
        `When many keys land in the same place, a search can take ${HASH.search.worst} steps instead.`,
        'A hash table keeps no order among its keys. To list them in order, you would have to sort them first.',
      ],
    },
    {
      id: 'c8-tradeoff',
      event: 'content',
      heading: 'What an AVL tree pays',
      primary: 'diagram',
      figures: [{ id: 'avl', source: { kind: 'avl', keys: RACE_KEYS }, label: avlLabel }],
      text: ({ figures: { avl } }) => [
        // [ID] the AVL trade-off
        `An AVL tree is not free. It stores an extra height in each node, and it does rotation work to stay balanced: while ${avl.nodeCount} sorted keys went into this tree, it rebalanced ${avl.rebalances.length} times.`,
        `In return, its search is guaranteed ${AVL.search.worst}, while a plain BST can need ${BST.search.worst}.`,
      ],
    },
    {
      id: 'c8-compare',
      event: 'content',
      heading: 'Four structures side by side',
      primary: 'text',
      table: 'structures',
      rule: SUMMARY_RULE,
      text: () => [
        // [beyond ID]
        'No structure is best at everything. Each one makes some operations fast and pays for it somewhere else.',
        'Read across a row to see what a structure is good at, and down a column to compare one operation.',
      ],
    },
    {
      id: 'c8-red-black',
      event: 'content',
      heading: 'Other balanced trees',
      primary: 'text',
      text: () => [
        'Red-Black trees are another kind of self-balancing BST.', // [ID] "Mention Red-Black trees"
        `Like AVL trees, they keep search ${AVL.search.worst}. Many programming libraries use them.`, // [beyond ID]
        'This module only mentions them; it does not compare them in full.', // [ID] "but not a full comparison"
      ],
    },
    {
      id: 'c8-worked',
      event: 'example',
      heading: 'Worked example: a timetable',
      primary: 'text',
      scenario: WORKED,
      rule: SUMMARY_RULE,
      text: ({ scenarios }) => {
        // [beyond ID] the scenario and its wording; the answer and reasons are computed facts
        const f = scenarios[WORKED]
        const answer = f.answer === null ? '' : STRUCTURES[f.answer].name
        return [
          SCENARIOS[WORKED].text,
          `What it needs: ${f.needs.map((n) => NEEDS[n].label).join('; ')}.`,
          ...f.ruledOut.map(
            (r) => `Not the ${STRUCTURES[r.structure].name}, because of "${NEEDS[r.need].label}": ${NEEDS[r.need].unmet(STRUCTURES[r.structure].name)}`,
          ),
          `Only the ${answer} meets every need, so it is the one to choose.`,
        ]
      },
    },
    practiceStep('c8-practice-1', 'Your turn: choose a structure', ['class-list', 'live-scores', 'spell-check', 'logins']),
    practiceStep('c8-practice-2', 'One more: choose a structure', ['word-game', 'bookings', 'postal-codes', 'page-cache']),
    {
      id: 'c8-check',
      event: 'check',
      heading: 'Check your understanding',
      primary: 'text',
      text: () => [screenCopy.coming], // checks arrive with the assessment changes (19 to 21)
    },
    {
      id: 'c8-summary',
      event: 'summary',
      heading: 'Summary',
      primary: 'text',
      text: () => [
        // [ID] restates the C8 bullets; the last two sentences are [beyond ID]
        'A plain BST, an AVL tree, a sorted array and a hash table each make different operations fast.',
        `An AVL tree stores an extra height in each node and does rotation work, and in return its search is guaranteed ${AVL.search.worst}.`,
        `A sorted array searches in ${ARRAY.search.worst} but inserts in ${ARRAY.insert.worst}; a hash table finds a key in ${HASH.search.typical} typically but keeps no order.`,
        'Other self-balancing trees exist too, and you may meet them later.',
      ],
    },
  ],
}
