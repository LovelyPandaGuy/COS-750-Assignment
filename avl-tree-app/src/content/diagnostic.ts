// Wording for the C1 warm-up check, its result and the refresher's ending (add-diagnostic-c1-and-routing).
// FLAGGED FOR THE USER TO READ AT G3: none of this comes from the ID content. The warm-up is private
// practice: no mark, grade, pass, fail, test, score or points wording anywhere (FR-DIA-05).
import type { ConventionsWording } from './modules/conventionsWording'

export const diagnosticCopy = {
  intro: {
    heading: 'How this works',
    paragraphs: [
      'The warm-up is five short questions about binary search trees. It is private practice, just for you: nothing here counts against you, and nobody else sees your answers.',
      'Each module has an explore step, a worked example and a check. After each question you can say how sure you are; that is optional.',
      'Anything you watch can be played again. You can skip the warm-up at any time.',
    ],
  },
  conventions: {
    heading: 'Two conventions we use',
    intro: 'These are the two ideas the rest of the app builds on.',
    height: (w: ConventionsWording) => w.heightRule,
    balance: (w: ConventionsWording) => `Later you will meet the balance factor: ${w.formula}.`,
  },
  question: (n: number, of: number) => `Question ${n} of ${of}`,
  next: 'Next',
  back: 'Back',
  skip: 'Skip the warm-up',
  answered: 'You answered this one.',

  status: { secure: 'Secure', needsReview: 'Needs review' },
  skills: {
    'bst-terminology': 'Tree terms and the ordering rule',
    'bst-insert': 'Inserting a key',
    'bst-search': 'Searching for a key',
    'tree-height': 'Tree height',
  },
  result: {
    skillsLabel: 'Where you are starting from',
    intro: 'Here is each skill on its own. This is only to help you choose where to go next.',
    notTaken: 'You have not answered the warm-up questions yet.',
    takeIt: 'Start the warm-up',
    recheck: 'Take the short re-check',
    secureNote: 'You are ready to go on.',
    reviewNote: 'A short refresher can help with the skills that say Needs review.',
    routeLabel: 'Where next?',
  },
  refresher: {
    toC2: 'Go on to C2',
    toRecheck: 'Take the short re-check',
    endHeading: 'Ready for the next step?',
  },
} as const
