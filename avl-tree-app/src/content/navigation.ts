// Wording for the prerequisite note and the "Where next?" panel (add-module-framework, D20, D27).
// FLAGGED FOR THE USER TO READ: none of this comes from the ID content. Calm wording only: the
// note never says a module is locked or required, and nothing is scored.

export const navigationCopy = {
  /** Soft prerequisite note on a module screen. `label` is e.g. "C2 When BSTs go lopsided". */
  note: (label: string) => `This module builds on ${label}. You can start here, or look at that module first.`,
  noteLink: (label: string) => `Go to ${label}`,

  /** Panel on the last step of a module's Check activity. */
  whereNext: 'Where next?',
  intro: 'Pick where to go next. Next takes you back to your path.',
  /** The word that marks the suggested route, so it is not shown by colour alone. */
  suggestedWord: 'Suggested',
  suggested: (label: string) => `Suggested: ${label}`,
  goTo: (label: string) => `Go on to ${label}`,
  lookAgain: (label: string) => `Look over ${label} again`,
} as const
