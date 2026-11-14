// Sandbox wording (add-sandbox, wireframe 1n). FLAGGED FOR THE USER TO READ: none of this comes
// from the ID content. Calm wording only (D27): no judging words for keys that cannot be used.
// Case names come only from the conventions wording (D19); statistics are descriptive, never points
// (FR-MOT-04). Every number is filled in from engine results.
import type { Key } from '../engine/tree'
import type { LogEntry, Notice } from '../sandbox/sandbox'
import { SANDBOX_KEY_MAX, SANDBOX_KEY_MIN, SANDBOX_MAX_NODES, SORTED_DEMO } from '../sandbox/config'
import { caseLabel, type RebalanceCase } from '../engine/conventions'

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
  log: (e: LogEntry): string => {
    // Case names come from conventions.json ("Case 1 (LL)"; ID 7.3).
    const fixes = (rs: readonly { node: Key; case: RebalanceCase }[]) =>
      rs.map((r) => `${r.node} was out of balance (${caseLabel(r.case)}), so the tree was rotated there.`).join(' ')
    switch (e.kind) {
      case 'insert': {
        const where = e.parent === null ? `Inserted ${e.key} as the root.` : `Inserted ${e.key} to the ${e.side} of ${e.parent}.`
        if (!e.rebalancing) return `${where} No rebalancing (switched off).`
        return e.rebalances.length === 0 ? `${where} Every node stayed in balance.` : `${where} ${fixes(e.rebalances)}`
      }
      case 'delete': {
        const what = `Deleted ${e.key}.`
        if (!e.rebalancing) return `${what} No rebalancing (switched off).`
        return e.rebalances.length === 0 ? `${what} Every node stayed in balance.` : `${what} ${fixes(e.rebalances)}`
      }
      case 'rebuild':
        return `Rebalancing ${e.rebalancing ? 'on' : 'off'}: rebuilt the same ${plural(e.count, 'key', 'keys')}, in the order they were inserted, as ${e.rebalancing ? 'an AVL tree' : 'a plain BST'}.`
      case 'clear':
        return 'Cleared the tree.'
    }
  },

  replay: 'Replay last insert',
  replayUnavailable: 'Replay is available for inserts with rebalancing on.',
  replayLabel: (key: Key) => `Tree while inserting ${key}`,
} as const
