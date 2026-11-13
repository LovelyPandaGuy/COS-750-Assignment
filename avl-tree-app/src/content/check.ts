// Wording for the Check activity (add-checks-and-feedback, D27).
// FLAGGED FOR THE USER TO READ: none of this comes from the ID content. Calm wording only: the
// verdicts are "That's right." and "Not quite yet."; no cross glyph, no red, no judging words.
import type { Key } from '../engine/tree'
import type { TraceKind } from '../engine/trace'
import { practiceModuleCopy } from './modules/practice'

const STEP_NAME: Partial<Record<TraceKind, string>> = { insert: 'insert step', rotation: 'rotation step' }

export const checkCopy = {
  /** The one line on the intro step of each Check activity. */
  intro: 'A few questions on what you just covered. Take your time; you can look back at any step first.',
  question: (n: number, of: number) => `Question ${n} of ${of}`,

  /** One source for the verdict words, shared with practice. */
  verdict: practiceModuleCopy.verdict,
  feedbackLabel: 'Feedback',
  checkAnswer: 'Check answer',
  tryAgain: 'Try again',
  nextQuestion: 'Next question',
  /** The last item has no next question. */
  continue: 'Continue',
  review: 'Review',

  numberLabel: 'Your answer',
  unreadable: 'Type a whole number, for example 2.',
  choiceLegend: 'Choose one answer',
  treeLabel: 'Tree for this question',

  confidenceLabel: 'How sure are you? (optional)',
  sure: 'Sure',
  unsure: 'Not sure',

  editor: {
    heading: 'Build the final tree',
    task: (key: Key) => `Insert ${key} as in a plain search tree, then rotate until the tree is balanced.`,
    insert: (key: Key) => `Insert ${key}`,
    inserted: (key: Key) => `Inserted ${key}`,
    rotated: (dir: 'left' | 'right', key: Key) => `Rotated ${dir} at ${key}`,
    logHeading: 'Your edits',
    logEmpty: 'No edits yet.',
    cannotRotate: (key: Key, dir: 'left' | 'right') => `Node ${key} cannot rotate ${dir}: there is no child on that side to lift.`,
    treeLabel: 'Your tree',
    /** Names the first trace step the student's tree does not reach (FR-ASM-04). */
    diverged: (kind: TraceKind) => `Your tree stops before the ${STEP_NAME[kind] ?? 'next step'}.`,
  },
} as const
