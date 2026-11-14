// Readiness summary wording (revamp-readiness, frame 1o; proposal question 15, D144).
// FLAGGED FOR THE USER TO READ: these are UI labels only, written for this change; no teaching text.
// - The Bloom level words for levels the chip does not already word (analyse, evaluate, create). Which
//   level each objective has is ID 5.1, already typed once in src/live/outcomes.ts (OUTCOMES.levels), so
//   it is not copied here.
// - Column headers, status symbols, the flags heading, Edit, Remove, Save, Cancel, the field label, the
//   export labels and messages, the fallback instruction and the file name.
// Headings that already exist in lessonCopy.c9 (objectives, lecture questions, listen for, none yet) are reused.
import { baseCopy } from './base'
import { lessonCopy } from './lesson'

const c9 = lessonCopy.c9

export const readinessCopy = {
  /** Bloom level words by level key (ID 5.1 names: Understand, Apply, Evaluate). */
  levelWords: { ...baseCopy.bloom, analyse: 'Analyse', evaluate: 'Evaluate', create: 'Create' } as Record<string, string>,
  /** Text symbols beside each status word; never the only signal (D25). */
  symbols: { ready: '✓', revise: '↻' },
  flagSymbol: '⚑',
  columns: {
    caption: c9.objectivesHeading,
    objective: 'Objective',
    level: 'Level',
    status: 'Status',
    change: 'Since last time',
    review: 'Review',
  },
  flagsHeading: 'Worth another look',
  questions: {
    heading: c9.lectureHeading,
    empty: c9.noneYet,
    edit: 'Edit',
    remove: 'Remove',
    save: 'Save',
    cancel: 'Cancel',
    field: 'Edit your question',
  },
  listenHeading: c9.listenHeading,
  exports: {
    group: 'Keep your summary',
    print: 'Print',
    copy: 'Copy as text',
    save: 'Save as a text file',
    copied: 'Copied. Paste it wherever you keep your notes.',
    saved: 'Saved as avl-readiness.txt in your downloads.',
    fallback: 'Your browser blocked that. Select the text below and copy it.',
    fallbackLabel: 'Your summary as text',
  },
  fileName: 'avl-readiness.txt',
} as const
