// The structure record for C8 "Choosing a structure" (LO9, LO5; add-module-c8-choosing).
//
// FLAGGED FOR THE USER TO READ (gate G3) BEFORE ANY STUDENT SEES IT.
// The ID's C8 gives only: compare a plain BST, an AVL tree, a sorted array and a hash table; the
// AVL trade-off "an extra height in each node + rotation work, but guaranteed O(log2 n)"; mention
// Red-Black trees. Every cost of the sorted array and the hash table, every "typical" cost, every
// need and every scenario below is beyond the ID. Each entry's `source` says which is which, and
// a [beyond ID] comment sits next to each claim the ID does not make.
//
// Scenario answers are never typed here: the framework computes them from `meets`
// (src/modules/compare.ts), and the validator rejects a scenario with no answer or two.
// This file imports only types from the framework, so it adds no import cycle.
import type { Need, NeedId, Scenario, StructureId, StructureRecord } from '../../modules/compare'

export const STRUCTURES: StructureRecord = {
  bst: {
    name: 'plain BST',
    // [ID] C2: worst case n. [beyond ID] "typical" O(log2 n): the ID gives the best case
    // ("about log2 n"); typical reads it as keys arriving in random order.
    search: { typical: 'O(log2 n)', worst: 'O(n)' },
    insert: { typical: 'O(log2 n)', worst: 'O(n)' }, // [beyond ID] same reasoning as search
    inOrder: true, // [beyond ID] an in-order walk lists the keys in order
    costs: [],
    meets: {
      'in-order': true,
      'search-worst-log': false,
      'insert-worst-log': false,
      'insert-typical-log': true,
      'lookup-typical-constant': false,
      'no-balancing': true,
      'keys-only': false,
    },
    source: { search: 'ID', searchTypical: 'beyond ID', insert: 'beyond ID', insertTypical: 'beyond ID', inOrder: 'beyond ID', costs: 'ID', meets: 'beyond ID' },
  },
  avl: {
    name: 'AVL tree',
    search: { typical: 'O(log2 n)', worst: 'O(log2 n)' }, // [ID] C8 "guaranteed O(log2 n)"
    insert: { typical: 'O(log2 n)', worst: 'O(log2 n)' }, // [ID] C6 "insertion stays O(log2 n)"
    inOrder: true, // [beyond ID] an in-order walk lists the keys in order
    costs: ['stores an extra height in each node', 'does rotation work on insert'], // [ID] C8 trade-off
    meets: {
      'in-order': true,
      'search-worst-log': true,
      'insert-worst-log': true,
      'insert-typical-log': true,
      'lookup-typical-constant': false,
      'no-balancing': false, // [ID] C8: an extra height in each node + rotation work
      'keys-only': false,
    },
    source: { search: 'ID', searchTypical: 'ID', insert: 'ID', insertTypical: 'ID', inOrder: 'beyond ID', costs: 'ID', meets: 'beyond ID' },
  },
  'sorted-array': {
    name: 'sorted array',
    search: { typical: 'O(log2 n)', worst: 'O(log2 n)' }, // [beyond ID] binary search
    insert: { typical: 'O(n)', worst: 'O(n)' }, // [beyond ID] larger keys move along one place
    inOrder: true, // [beyond ID]
    costs: ['moves the larger keys along on every insert'], // [beyond ID]
    meets: {
      'in-order': true,
      'search-worst-log': true,
      'insert-worst-log': false,
      'insert-typical-log': false,
      'lookup-typical-constant': false,
      'no-balancing': true,
      'keys-only': true,
    },
    source: { search: 'beyond ID', searchTypical: 'beyond ID', insert: 'beyond ID', insertTypical: 'beyond ID', inOrder: 'beyond ID', costs: 'beyond ID', meets: 'beyond ID' },
  },
  'hash-table': {
    name: 'hash table',
    // [beyond ID] typical O(1) when keys spread evenly; worst O(n) when many keys collide.
    search: { typical: 'O(1)', worst: 'O(n)' },
    insert: { typical: 'O(1)', worst: 'O(n)' }, // [beyond ID]
    inOrder: false, // [beyond ID]
    costs: ['keeps no order among its keys'], // [beyond ID]
    meets: {
      'in-order': false,
      'search-worst-log': false,
      'insert-worst-log': false,
      'insert-typical-log': true,
      'lookup-typical-constant': true,
      'no-balancing': true,
      'keys-only': false,
    },
    source: { search: 'beyond ID', searchTypical: 'beyond ID', insert: 'beyond ID', insertTypical: 'beyond ID', inOrder: 'beyond ID', costs: 'beyond ID', meets: 'beyond ID' },
  },
}

// [beyond ID] every need's wording. Each unmet sentence only restates its need, so it stays true for
// any structure the record says fails it (no cost or mechanism typed here).
export const NEEDS: Record<NeedId, Need> = {
  'in-order': {
    label: 'keys listed in order',
    unmet: (name) => `The ${name} does not keep its keys in order.`,
  },
  'search-worst-log': {
    label: 'search in O(log2 n) even in the worst case',
    unmet: (name) => `The ${name} does not guarantee a search in O(log2 n) in the worst case.`,
  },
  'insert-worst-log': {
    label: 'insert in O(log2 n) even in the worst case',
    unmet: (name) => `The ${name} does not guarantee an insert in O(log2 n) in the worst case.`,
  },
  'insert-typical-log': {
    label: 'insert in O(log2 n) or less in the typical case',
    unmet: (name) => `The ${name} does not insert in O(log2 n) or less in the typical case.`,
  },
  'lookup-typical-constant': {
    label: 'find a key in O(1) steps in the typical case',
    unmet: (name) => `The ${name} does not find a key in O(1) steps in the typical case.`,
  },
  'no-balancing': {
    label: 'no extra work to stay balanced',
    unmet: (name) => `The ${name} does extra work to stay balanced.`,
  },
  'keys-only': {
    label: 'store only the keys, nothing extra',
    unmet: (name) => `The ${name} stores extra data besides the keys.`,
  },
}

// [beyond ID] every scenario. None names a structure (the validator checks).
const scenarios: Scenario[] = [
  // Answer computed: the plain BST.
  {
    id: 'class-list',
    text: "A tutor's app adds student numbers as students join, in no particular order, and prints the class list in order at the end of the day. The code must stay as simple as possible, with no extra bookkeeping.",
    needs: ['in-order', 'insert-typical-log', 'no-balancing'],
  },
  {
    id: 'word-game',
    text: 'A word game adds words as players type them, in random order, and shows every word alphabetically at the end of a round. Each entry should hold the word and nothing to keep things balanced.',
    needs: ['in-order', 'insert-typical-log', 'no-balancing'],
  },
  // Answer computed: the AVL tree.
  {
    id: 'live-scores',
    text: 'A live leaderboard takes in new scores all day, sometimes already in sorted order. Every insert and every lookup must stay fast, even on the worst day.',
    needs: ['search-worst-log', 'insert-worst-log'],
  },
  {
    id: 'bookings',
    text: 'A booking system adds new booking times all the time, often in increasing order. It must list the bookings in time order and find or add any booking quickly, every time.',
    needs: ['in-order', 'search-worst-log', 'insert-worst-log'],
  },
  {
    id: 'timetable',
    text: 'A timetable app adds classes as lecturers schedule them, often in time order. It must show every class in time order, and finding or adding a class must stay quick even in the worst case.',
    needs: ['in-order', 'search-worst-log', 'insert-worst-log'],
  },
  // Answer computed: the sorted array.
  {
    id: 'spell-check',
    text: 'A spell checker loads a fixed word list once when it starts and never changes it. It must find any word quickly every time, and store nothing but the words.',
    needs: ['search-worst-log', 'keys-only'],
  },
  {
    id: 'postal-codes',
    text: 'A list of postal codes is built once a year and then only searched, many times a second. Every lookup must be fast, and nothing may be stored besides the codes.',
    needs: ['search-worst-log', 'keys-only'],
  },
  // Answer computed: the hash table.
  {
    id: 'logins',
    text: 'A login service checks whether a username exists, millions of times a day. It never needs the usernames in order; it only needs each check to be as fast as possible on a typical day.',
    needs: ['lookup-typical-constant'],
  },
  {
    id: 'page-cache',
    text: 'A web cache asks one question: have we already saved this page address? Order never matters, and a typical check should take the same few steps however many addresses are saved.',
    needs: ['lookup-typical-constant'],
  },
]

export const SCENARIOS: Record<string, Scenario> = Object.fromEntries(scenarios.map((s) => [s.id, s]))

const yesNo = (b: boolean) => (b ? 'keys in order' : 'no order among its keys')

/** One sentence per structure, built from the record (the comparison rule text). [beyond ID] wording */
export function structureSummary(record: StructureRecord = STRUCTURES): string[] {
  return (Object.keys(record) as StructureId[]).map((id) => {
    const s = record[id]
    return `The ${s.name} searches in ${s.search.typical} typically and ${s.search.worst} at worst, inserts in ${s.insert.typical} typically and ${s.insert.worst} at worst, and has ${yesNo(s.inOrder)}.`
  })
}
