// The C9 readiness check (FR-ASM-06, D14; add-readiness-c9, design decision 1): one item per
// learning outcome, then the ID's two combined items (build an AVL tree, then search it).
// Eight items reuse a module check's wording under a C9 ID: the engine draws a new problem from
// the C9 seed, so the wording is the same but the problem is new. Every answer comes from the engine.
// FLAGGED FOR THE USER TO READ AT G3: the LO5, build and search items' stems and explanations, and
// the lecture-list template, are [beyond ID]. The topics are the ID's (C9 bullets, LO5); the
// sentences are new.
import type { BankItem, KindFacts, OptionValue } from '../../assessment/types'
import { SCENARIOS } from '../modules/structures'
import { chk2Height, chk3Bf, chk3Height, chk4Missing, chk5Rotate, chk6Case, chk7Root, list, scenarioItem, searchWhy } from './checks'

const v = (f: KindFacts, name: string) => f.values[name]

/** A module check's wording, asked again in C9 under its own ID. */
const again = (id: string, item: BankItem): BankItem => ({ ...item, id, module: 'C9' })

// ---- LO5: worst-case search, plain BST against AVL tree (D13) ----

const worstText: Record<string, (f: KindFacts) => string> = {
  'plain-n-avl-log': (f) => `Plain BST: ${v(f, 'plainWorst')} nodes; AVL tree: ${v(f, 'avlWorst')} nodes`,
  'both-log': (f) => `Both: ${v(f, 'avlWorst')} nodes`,
  'both-n': (f) => `Both: ${v(f, 'plainWorst')} nodes`,
}

const rdyLo5: BankItem = {
  id: 'rdy-lo5',
  module: 'C9',
  kind: 'worst-search',
  outcome: 'LO5',
  subSkill: 'search-complexity',
  level: 'understand',
  stem: (f) => `A plain BST and an AVL tree each hold ${v(f, 'n')} keys. In the worst case, how many nodes does a search visit in each?`,
  optionText: (f, _w, value?: OptionValue) => worstText[String(value)](f),
  why: {
    correct: (f) =>
      `A plain BST can be one long path, so a search may visit all ${v(f, 'plainWorst')} nodes. The AVL rule keeps every path short, so a search in the AVL tree visits at most ${v(f, 'avlWorst')} nodes.`,
    'M-ASSUMES-BALANCED': (f) =>
      `${v(f, 'avlWorst')} nodes is the AVL tree's worst case. A plain BST has no balance rule: keys added in increasing order make one long path, so a search can visit all ${v(f, 'plainWorst')}.`,
    'M-SEARCH-VISITS-ALL': (f) =>
      `${v(f, 'plainWorst')} nodes is the plain BST's worst case, when it is one long path. The AVL rule keeps the tree short, so a search there visits at most ${v(f, 'avlWorst')} nodes.`,
  },
}

// ---- Combined: build an AVL tree, then search it (ID C9) ----

const rdyBuild: BankItem = {
  id: 'rdy-build',
  module: 'C9',
  kind: 'build-avl',
  combined: true,
  outcome: 'LO7',
  subSkill: 'rebalance-insert',
  level: 'apply',
  stem: (f) => `Insert ${list(f.keys)} into an empty AVL tree, in that order, rebalancing after each insert. Build the final tree.`,
  why: {
    correct: () => 'Each key goes in as in a BST, and any node the insert puts out of balance is fixed before the next key goes in. That gives this tree.',
    other: () => 'Insert the keys one at a time. After each insert, walk back up and fix the lowest node out of balance before adding the next key.',
    'M-FORGETS-REBALANCE': () =>
      'That is the plain BST these keys build. In an AVL tree, an insert that puts a node out of balance is fixed with a rotation before the next key goes in.',
  },
}

const rdySearch: BankItem = {
  id: 'rdy-search',
  module: 'C9',
  kind: 'search-built',
  combined: true,
  outcome: 'LO4',
  subSkill: 'trace-search',
  level: 'apply',
  stem: (f) => `This is the AVL tree that ${list(f.keys)} build. How many nodes does a search for ${f.target} visit?`,
  why: {
    ...searchWhy(false),
    other: (f) => `Start at the root and count each node the search compares ${f.target} with, the root included.`,
  },
}

export const READINESS: readonly BankItem[] = [
  again('rdy-lo1', chk2Height),
  again('rdy-lo2', chk3Height),
  again('rdy-lo3', chk3Bf),
  again('rdy-lo4', chk4Missing),
  rdyLo5,
  again('rdy-lo6', chk5Rotate),
  again('rdy-lo7', chk6Case),
  again('rdy-lo8', chk7Root),
  { ...scenarioItem('rdy-lo9', Object.keys(SCENARIOS)), module: 'C9' },
  rdyBuild,
  rdySearch,
]

/** The bring-to-the-lecture question for an unresolved misconception, from its catalogue label (FR-RDY-02). */
export function lectureListText(label: string): string {
  return `Could we go over why it does not work when an answer ${label}?`
}
