// Wording for the C9 check and the readiness summary (add-readiness-c9).
// Outcome texts restate the ID's learning objectives [ID]; LO7's case list is left out because case
// names come only from the conventions module (D19). Everything else is [beyond ID], FLAGGED FOR THE
// USER TO READ AT G3. Calm wording: no score, points, rank, grade, pass or fail (FR-MOT-04).
import type { LoId } from '../assessment/ids'
import type { ModuleId } from '../state/learnerState'

export const OUTCOME_TEXT: Record<LoId, string> = {
  LO1: 'Explain why BST height is search cost, and how insertion order can make a BST lopsided.',
  LO2: 'Say what height, balance factor and the AVL property are.',
  LO3: 'Work out balance factors and say whether a tree is an AVL tree.',
  LO4: 'Trace a search, for a key that is found and one that is not.',
  LO5: 'Explain why AVL search stays logarithmic but a plain BST search can take n steps.',
  LO6: 'Do single and double rotations.',
  LO7: 'Insert into an AVL tree: find the unbalanced node, pick the case, rotate.',
  LO8: 'Delete and rebalance.',
  LO9: 'Pick a structure for a scenario and say why.',
}

/** The module whose Worked example each outcome links back to (ID: Learning objectives). */
export const OUTCOME_MODULE: Record<LoId, ModuleId> = {
  LO1: 'C2',
  LO2: 'C3',
  LO3: 'C3',
  LO4: 'C4',
  LO5: 'C4',
  LO6: 'C5',
  LO7: 'C6',
  LO8: 'C7',
  LO9: 'C8',
}

export const readinessCopy = {
  states: { ready: 'Ready', revise: 'Revise', notTried: 'Not tried' },
  optional: 'optional',
  flag: 'You were sure, but missed one here',
  tableLabel: 'Each learning outcome',
  columns: { outcome: 'Outcome', status: 'Status', back: 'Look again' },
  backLink: (module: string) => `Worked example in ${module}`,
  intro: 'This is where you stand on each learning outcome, from your answers so far. It is just for you.',
  lectureHeading: 'Questions to take to the lecture',
  lectureEmpty: 'Nothing is left open from your answers.',
  ownHeading: 'Your own question',
  ownNote: 'Write at least one question you want to ask in the lecture. Do not include your name or student number.',
  ownLabel: 'Your question',
  ownAdd: 'Add question',
  ownListLabel: 'Your questions',
  exportLabel: 'Keep a copy',
  exportNeedsOwn: 'Add one question of your own to print, save or copy this page.',
  print: 'Print',
  save: 'Save as text',
  copy: 'Copy',
  copied: 'Copied to the clipboard.',
  copyFailed: 'Copying is not available here. Try Save as text instead.',
  fileName: 'avl-primer-readiness.txt',
  text: {
    title: 'Ready for the lecture?',
    lecture: 'Questions to take to the lecture:',
    own: 'My own questions:',
    none: '(none)',
  },
  c9: {
    introHeading: 'Am I ready?',
    intro: 'One question for each learning outcome, and two that bring several together. Anything you miss comes back once, in a new form.',
    start: 'Start',
    question: (n: number, of: number) => `Question ${n} of ${of}`,
    recycleHeading: (n: number, of: number) => `One more look: ${n} of ${of}`,
    endHeading: 'All done',
    endText: 'Your summary shows each outcome, and the questions to take to the lecture.',
    toSummary: 'See your readiness summary',
    back: 'Back',
  },
} as const
