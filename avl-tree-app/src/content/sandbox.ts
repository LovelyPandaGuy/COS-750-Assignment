// Sandbox wording (add-sandbox, wireframe 1n). FLAGGED FOR THE USER TO READ: none of this comes
// from the ID content. Calm wording only (D27): no judging words for keys that cannot be used.
// Case names come only from the conventions wording (D19); statistics are descriptive, never points
// (FR-MOT-04). Every number is filled in from engine results.
import type { Key } from '../engine/tree'
import type { LogEntry, Notice } from '../sandbox/sandbox'
import { SANDBOX_KEY_MAX, SANDBOX_KEY_MIN, SANDBOX_MAX_NODES, SORTED_DEMO } from '../sandbox/config'

const h = (n: number) => (n < 0 ? `−${-n}` : String(n))
const range = `${SANDBOX_KEY_MIN} to ${SANDBOX_KEY_MAX}`
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export const sandboxCopy = {
  intro: 'Insert and delete keys, and turn rebalancing on or off to compare the shapes.',
  /** Section headings in the control column (revamp-sandbox-layout, D141). Flagged for the user to read. */
  sections: {
    change: 'Change the tree',
    rebalancing: 'Rebalancing',
    numbers: 'Numbers',
    log: 'What happened',
  },
  controlsLabel: 'Change the tree',
  fieldLabel: `Key (${range})`,
  insert: 'Insert',
  delete: 'Delete',
  sorted: `Insert ${SORTED_DEMO[0]} to ${SORTED_DEMO[SORTED_DEMO.length - 1]} in order`,
  random: 'Random key',
  clear: 'Clear',
  noticeLabel: 'About that key',
  full: `The tree is full (${SANDBOX_MAX_NODES} keys). Delete a key or clear the tree to keep exploring.`,
  notice: (n: Notice): string => {
    switch (n.kind) {
      case 'range':
        return `Keys are whole numbers from ${range}.`
      case 'duplicate':
        return `${n.key} is already in the tree. Each key appears once.`
      case 'missing':
        return `${n.key} is not in the tree, so there is nothing to delete.`
      case 'notLeaf':
        // C7 teaches leaf deletion only (conventions.json "deletion": "leaf nodes only"; D162).
        return `${n.key} is not a leaf. As in C7, only a leaf can be deleted here.`
      case 'full':
        return `The tree is full (${SANDBOX_MAX_NODES} keys). Delete a key or clear the tree to keep exploring.`
    }
  },

  switchLabel: (on: boolean) => `Rebalancing: ${on ? 'ON' : 'OFF'}`,
  switchHint: (on: boolean) =>
    on
      ? 'AVL tree. Turn rebalancing off to rebuild the same keys as a plain BST.'
      : 'Plain BST. Turn rebalancing on to rebuild the same keys as an AVL tree.',

  treeLabel: (on: boolean) => (on ? 'Sandbox tree, AVL' : 'Sandbox tree, plain BST'),
  emptyTree: 'The tree is empty. Insert a key to start.',

  stats: {
    nodes: (n: number, max: number) => `Nodes: ${n} / ${max}`,
    height: (n: number) => `Height: ${h(n)}`,
    shortest: (n: number) => `Shortest possible height: ${h(n)}`,
    unbalanced: (n: number) => `Nodes out of balance: ${n}`,
    deepest: (key: Key, visits: number) => `A search for ${key}, the deepest key, visits ${plural(visits, 'node', 'nodes')}`,
    noSearch: 'No keys to search for yet.',
  },

  logLabel: 'What happened',
  logEmpty: 'Nothing yet.',
  /**
   * The heading of a "What happened" entry (align-sandbox-explanations, D161). An insert or delete is
   * explained by its steps, which are the engine's lesson captions (conventions.json), not this file.
   */
  heading: (e: LogEntry): string => {
    switch (e.kind) {
      case 'insert':
        return `Inserted ${e.key}`
      case 'delete':
        return `Deleted ${e.key}`
      case 'rebuild':
        return e.count === 0
          ? `Rebalancing ${e.rebalancing ? 'on' : 'off'}: the tree is empty.`
          : `Rebalancing ${e.rebalancing ? 'on' : 'off'}: rebuilt the same ${plural(e.count, 'key', 'keys')}, in the order they were inserted, as ${e.rebalancing ? 'an AVL tree' : 'a plain BST'}.`
      case 'clear':
        return 'Cleared the tree.'
    }
  },
  /** After the steps of an entry made with rebalancing off (D161). Flagged for the user to read. */
  noRotation: 'Rebalancing is off, so no rotation is made.',


  replay: 'Replay last insert',
  /** The replay of the last single change (D163). Flagged for the user to read. */
  replayDelete: 'Replay last delete',
  replayUnavailable: 'Replay is available after you insert or delete one key.',
  replayLabel: (key: Key) => `Tree while inserting ${key}`,
  replayLabelDelete: (key: Key) => `Tree while deleting ${key}`,
} as const
