// C3 practice wording: hints and feedback (D21, D27). Values are filled in from engine results.
// FLAGGED FOR THE USER TO READ: none of this comes from the ID content.
// Low-anxiety rules: verdicts are "That's right" or "Not quite yet"; no red, no cross, no judging words.
// Sign and side wording comes from the conventions wording (D19).
import type { Key } from '../../engine/tree'
import type { BalanceFactorResult, RotationHintFacts, SpotResult } from '../../modules/practice'
import { answersOf, reasonOf, STRUCTURE_IDS, type Scenario, type StructureId } from '../../modules/compare'
import type { ConventionsWording } from './conventionsWording'
import { NEEDS, STRUCTURES } from './structures'

/** The needs of a scenario, as one phrase. */
const needList = (sc: Scenario) => sc.needs.map((n) => NEEDS[n].label).join('; ')

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

  // C5 rotation practice (add-modules-c5-c6). Node keys, directions and the case come from the engine.
  rotate: {
    hints: [
      (_f: RotationHintFacts, w: ConventionsWording) =>
        `Find the lowest node whose balance factor is not ${w.rangeText}. The fix starts at that node or at its taller child.`,
      (f: RotationHintFacts, w: ConventionsWording) =>
        `Node ${f.z} is out of balance and its taller child is node ${f.y}. This is the ${w.caseName(f.case)} case: ${f.rotations
          .map((r, i) => `${i === 0 ? 'rotate' : 'then'} ${w.sideWord(r.dir)} at ${r.at}`)
          .join(', ')}.`,
    ],
  },

  // C8 scenario practice (add-module-c8-choosing). [beyond ID] all wording. The answer and each
  // reason are computed from the structure record; nothing here names an answer.
  scenario: {
    legend: 'Which structure fits best?',
    feedbackLabel: 'Feedback',
    choose: 'Choose a structure first, then press Check.',
    newScenario: 'New scenario',
    done: 'Press Next when you are ready.',
    why: {
      right: (answer: StructureId, sc: Scenario): string =>
        `The ${STRUCTURES[answer].name} meets every need here: ${needList(sc)}.`,
      notYet: (choice: StructureId, sc: Scenario): string => {
        const need = reasonOf(sc, choice)
        return need === null ? '' : `${NEEDS[need].unmet(STRUCTURES[choice].name)} This situation needs ${NEEDS[need].label}.`
      },
    },
    hints: [
      (sc: Scenario): string => `List what the situation needs: ${needList(sc)}. Then check each structure against that list.`,
      (sc: Scenario): string => {
        const answer = answersOf(sc)[0]
        const out = STRUCTURE_IDS.filter((s) => s !== answer).map((s) => `the ${STRUCTURES[s].name} misses ${NEEDS[reasonOf(sc, s)!].label}`)
        return `Rule them out one by one: ${out.join('; ')}.`
      },
    ],
  },
} as const
