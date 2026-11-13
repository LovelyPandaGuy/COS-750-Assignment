// The C9 readiness check: one item per outcome and two combined ones (ID C9, FR-ASM-06, D14;
// add-readiness-c9). Most reuse a module check's wording under a new ID, so the problem is new.
// FLAGGED FOR THE USER TO READ AT G3: the three new items' wording is [beyond ID].
import type { LoId } from '../../assessment/ids'
import type { BankItem, KindFacts } from '../../assessment/types'
import { CHECKS } from './checks'

const v = (f: KindFacts, name: string) => f.values[name]
const list = (keys: readonly number[]) => keys.join(', ')

const from = (sourceId: string, id: string, extra: Partial<BankItem> = {}): BankItem => {
  const source = CHECKS.find((i) => i.id === sourceId)
  if (source === undefined) throw new Error(`no check item ${sourceId}`)
  return { ...source, id, module: 'C9', optional: undefined, ...extra }
}

const bound: BankItem = {
  id: 'r-lo5',
  module: 'C9',
  kind: 'search-bound',
  outcome: 'LO5',
  subSkill: 'search-complexity',
  level: 'understand',
  stem: (f) => `An AVL tree holds ${v(f, 'n')} keys. In the worst case, how many nodes does a search visit?`,
  why: {
    correct: (f) => `An AVL tree of ${v(f, 'n')} keys has height at most ${v(f, 'height')}, so a search visits at most ${v(f, 'worst')} nodes.`,
    'M-AVL-WORST-LINEAR': (f) =>
      `${v(f, 'n')} is the worst case for a plain BST that has become a line. An AVL tree stays short, so a search visits at most ${v(f, 'worst')}.`,
    'M-PERFECT-ONLY': (f) =>
      `${v(f, 'best')} is the worst case in a perfectly balanced tree. An AVL tree can be a little taller, so its bound is ${v(f, 'worst')}.`,
  },
}

const buildRoot: BankItem = {
  id: 'r-build-root',
  module: 'C9',
  kind: 'avl-build-root',
  outcome: 'LO7',
  subSkill: 'rebalance-insert',
  level: 'apply',
  stem: (f) => `Insert ${list(f.keys)} into an empty AVL tree, in that order, rebalancing as you go. Which key ends up at the root?`,
  why: {
    correct: (f) => `Rebalancing after each insert leaves ${v(f, 'avlRoot')} at the root.`,
    'M-FORGETS-REBALANCE': (f) => `${v(f, 'plainRoot')} would stay at the root of a plain BST. The AVL tree rebalances as the keys go in, and ${v(f, 'avlRoot')} ends up on top.`,
    'M-PERFECT-ONLY': (f) =>
      `${v(f, 'middle')} is the middle key, the root of a perfectly balanced tree. An AVL tree only keeps every balance factor in range, which leaves ${v(f, 'avlRoot')} at the root.`,
  },
}

const buildSearch: BankItem = {
  id: 'r-build-search',
  module: 'C9',
  kind: 'build-and-search',
  outcome: 'LO4',
  subSkill: 'trace-search',
  level: 'apply',
  stem: (f) => `Insert ${list(f.keys)} into an empty AVL tree, in that order. How many nodes does a search for ${f.target} visit?`,
  why: {
    correct: (f) => `In the AVL tree the search for ${f.target} visits ${v(f, 'steps')} nodes.`,
    other: (f) => `Build the AVL tree first, rebalancing after each insert, then follow the search for ${f.target} from the root.`,
    'M-FORGETS-REBALANCE': (f) => `${v(f, 'plainSteps')} is the count in a plain BST of these keys. The AVL tree rebalances, so the search visits ${v(f, 'steps')}.`,
    'M-COUNTS-EDGES': (f) => `${v(f, 'edges')} counts the moves between nodes. The search also compares at the root, so it visits ${v(f, 'steps')}.`,
  },
}

export const READINESS: readonly BankItem[] = [
  from('chk2-height', 'r-lo1'),
  from('chk3-height', 'r-lo2'),
  from('chk3-bf', 'r-lo3'),
  from('chk4-missing', 'r-lo4'),
  bound,
  from('chk5-rotate', 'r-lo6'),
  from('chk6-case', 'r-lo7'),
  from('chk7-count', 'r-lo8', { optional: true }),
  from('chk8-pick-a', 'r-lo9'),
  buildRoot,
  buildSearch,
]

/** The item that comes back for an outcome that is not Ready (D14). */
export const PRIMARY_ITEM: Record<LoId, string> = {
  LO1: 'r-lo1',
  LO2: 'r-lo2',
  LO3: 'r-lo3',
  LO4: 'r-lo4',
  LO5: 'r-lo5',
  LO6: 'r-lo6',
  LO7: 'r-lo7',
  LO8: 'r-lo8',
  LO9: 'r-lo9',
}
