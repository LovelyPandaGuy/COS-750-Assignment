// The term list for quality bar 10 (ui-quality-sweep: ui-foundation "Quality bar 10", scenario "One term per
// concept"; design decision 6). One constant: each concept, the one word the app uses for it, and words that
// must not stand in for it in UI wording.
//
// FLAGGED FOR THE USER TO READ: this list is assumed test data, not ID wording. The allowed words are the ones
// the app's screens already show (the lesson frame says "Lesson 3 of 9", the strip says "Hint", the top bar
// says "Sandbox", the checks are "Lesson check"). A clash it finds goes to the content-author, never to the
// polisher (proposal question 8). Add or change a row here; nothing else holds the list.
export interface Term {
  concept: string
  allowed: string
  synonyms: string[]
}

export const TERMS: Term[] = [
  { concept: 'one of the nine parts of the course (C1 to C9)', allowed: 'lesson', synonyms: ['module', 'unit'] },
  { concept: 'the marked questions at the end of a lesson', allowed: 'check', synonyms: ['quiz', 'test', 'exam'] },
  { concept: 'the free tree page', allowed: 'sandbox', synonyms: ['playground'] },
  { concept: 'the help shown for a question', allowed: 'hint', synonyms: ['tip', 'clue'] },
]
