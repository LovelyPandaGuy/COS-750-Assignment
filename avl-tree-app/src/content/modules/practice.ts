// C3 practice wording: hints and feedback (D21, D27). Values are filled in from engine results.
// FLAGGED FOR THE USER TO READ: none of this comes from the ID content.
// Low-anxiety rules: verdicts are "That's right" or "Not quite yet"; no red, no cross, no judging words.
// Sign and side wording comes from the conventions wording (D19).
import type { Key } from '../../engine/tree'
import type { BalanceFactorResult, SpotResult } from '../../modules/practice'
import type { ConventionsWording } from './conventionsWording'

/** A height as displayed: 0, 1, −1. */
const h = (n: number) => (n < 0 ? `−${-n}` : String(n))

export interface FillInHintFacts {
  key: Key
  leftHeight: number
  rightHeight: number
}

export interface SpotHintFacts {
  side: 'left' | 'right'
}

export const practiceModuleCopy = {
  verdict: { right: "That's right.", notYet: 'Not quite yet.' },
  tryAgain: 'Try again',
  review: 'Review the rule',
  newTree: 'New tree',
  hintsLabel: 'Hints',
  check: 'Check',

  fillIn: {
    treeLabel: 'Practice tree, balance factors hidden',
    fieldLabel: (key: Key | null) => (key === null ? 'Balance factor (select a node first)' : `Balance factor of node ${key}`),
    decrease: 'Decrease',
    increase: 'Increase',
    selectFirst: 'Select a node in the tree first.',
    notWhole: 'Type a whole number, with a + or − sign if it needs one.',
    why: (r: BalanceFactorResult, w: ConventionsWording): string => {
      const heights = `Node ${r.key}'s ${w.sideWord('left')} subtree has height ${h(r.leftHeight)} and its ${w.sideWord('right')} subtree has height ${h(r.rightHeight)}.`
      switch (r.kind) {
        case 'right':
          return `${heights} So its balance factor is ${w.num(r.correct)}.`
        case 'sign-slip':
          return `The size is right, but the sign is the other way round. ${heights} Use the rule: ${w.formula}.`
        case 'not-yet':
          return `${heights} Work out each height again, then use the rule.`
      }
    },
    pickAnother: 'Pick another node.',
    complete: 'Every balance factor is filled in. Press Next when you are ready.',
    hints: [
      (_f: FillInHintFacts, w: ConventionsWording) => `Find the heights of the node's two subtrees first. ${w.heightRule}`,
      (f: FillInHintFacts, w: ConventionsWording) =>
        `Node ${f.key}: ${w.sideWord('left')} subtree height ${h(f.leftHeight)}, ${w.sideWord('right')} subtree height ${h(f.rightHeight)}. Now use the rule: ${w.formula}.`,
    ],
  },

  spot: {
    treeLabel: 'Practice tree, find the node that breaks the rule',
    pickLabel: (key: Key | null) => (key === null ? 'Select a node in the tree.' : `Selected: node ${key}.`),
    why: (r: SpotResult, w: ConventionsWording): string =>
      r.kind === 'right'
        ? `Node ${r.picked}'s balance factor is outside ${w.rangeText}, so it breaks the AVL rule.`
        : `Node ${r.picked} has balance factor ${w.num(r.pickedBalance)}, which the rule allows. Look at the other nodes.`,
    done: 'Found it. Press Next when you are ready.',
    hints: [
      (_f: SpotHintFacts, w: ConventionsWording) => `Work up from the leaves. Every node's balance factor must be ${w.rangeText}.`,
      (f: SpotHintFacts, w: ConventionsWording) => `The node you are looking for is in the ${w.sideWord(f.side)} subtree of the root.`,
    ],
  },
} as const
