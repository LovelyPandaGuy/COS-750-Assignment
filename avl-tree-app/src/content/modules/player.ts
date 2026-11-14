// Step player wording (D20, D23). FLAGGED FOR THE USER TO READ: not from the ID content.
// "I know this, skip" follows the presentation draft (section 3.4, adopted in D20).

export const playerCopy = {
  stepOf: (n: number, m: number) => `Step ${n} of ${m}`,
  back: 'Back',
  next: 'Next',
  skip: 'I know this, skip',
  showRule: 'Show the rule',
  ruleLabel: 'The rule',
  /** Says the number is the hints left (D21, revamp-tree-controls question 2). */
  hint: (left: number) => `Hint, ${left} left`,
  reviewRule: 'Review the rule',
  stripLabel: 'Step controls',
  navLabel: 'Move between steps',
  aidsLabel: 'Learning aids',
} as const
