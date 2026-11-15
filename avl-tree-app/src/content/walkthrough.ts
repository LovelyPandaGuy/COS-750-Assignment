// "How the app works" as an animated mini-screen (add-lesson-walkthroughs, D170). FLAGGED FOR THE USER TO
// READ: the labels below and which part each point lights. The captions are the lesson file's own points
// (lessons/c1.json c1-s03), word for word; nothing here is teaching text.

/** The parts the mini-screen draws. */
export type WalkthroughPart = 'lessons' | 'title-bar' | 'tree' | 'back' | 'replay' | 'rule' | 'hint' | 'next' | 'confidence' | 'check' | 'title'

/** For each screen with a walkthrough: point n lights these parts. One entry per point, in order. */
export const walkthroughs: Record<string, readonly (readonly WalkthroughPart[])[]> = {
  'c1-s03': [
    ['back', 'next', 'replay'], // Next and Back are always in the same place. Replay shows the current step again.
    ['rule'], // Show the rule opens the written rule …
    ['hint'], // Hint tells you what a question checks …
    ['confidence'], // With each answer, tap Sure or Not sure …
    ['check'], // Practice tasks allow as many tries as you like. Check questions allow one re-attempt.
    ['title'], // After each check you get a title …
    ['lessons'], // Any lesson you have completed can be opened again from the lesson list.
  ],
}

export const walkthroughCopy = {
  imageName: 'A lesson screen with its controls',
  start: 'Press Play or Step to see what each part of a lesson screen does.',
  here: '▶ here',
  showList: 'Show all as a list',
  /** Words drawn on the mini-screen's parts (a picture, not real controls). */
  parts: {
    lessons: 'Lessons',
    'title-bar': 'Lesson title',
    tree: '',
    back: 'Back',
    replay: 'Replay',
    rule: 'Show the rule',
    hint: 'Hint',
    next: 'Next',
    confidence: 'Sure · Not sure',
    check: 'Check answer',
    title: 'AVL Ace',
  } satisfies Record<WalkthroughPart, string>,
} as const
