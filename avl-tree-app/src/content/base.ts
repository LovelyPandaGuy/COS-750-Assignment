// Base-component wording (add-ui-foundation; design system section 04, OutcomeChip and MasteryBadge).
// FLAGGED FOR THE USER TO READ AT G3: [beyond ID]. The words are the design system's labels, not the ID's.
// The ID gives each outcome its Bloom level; it does not word the levels or the mastery states.
// Mastery change is against the student's own earlier attempt, never a class average (design principle 4).

export const BASE_SOURCE = 'beyond ID' as const

type Mastery = 'secure' | 'developing' | 'not-yet'

const mastery: Record<Mastery, string> = {
  secure: 'Secure',
  developing: 'Developing',
  'not-yet': 'Not yet',
}

export const baseCopy = {
  /** The Bloom levels the design system styles. [OPEN] analyse (LO7, LO9) has no design yet. */
  bloom: { remember: 'Remember', understand: 'Understand', apply: 'Apply' },
  mastery,
  sinceLastTry: 'since your last try',
  /** The change in words, for screen readers (the arrow is hidden from them). */
  change: (before: Mastery, now: Mastery) => `Was ${mastery[before]}, now ${mastery[now]} since your last try.`,
} as const
