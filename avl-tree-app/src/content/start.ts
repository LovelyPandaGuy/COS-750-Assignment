// Start screen wording (wireframe 1b). FLAGGED FOR THE USER TO READ: the ID content has no
// Start screen text, so all of this is new wording beyond the ID.
// - heading, the second and third bullets, resumeHeading, resetLink and the dialog text follow
//   wireframe 1b closely.
// - intro, the first bullet and startButton are rewritten: the wireframe's "20–30 minute
//   warm-up" and "6 short units" conflict with D3 (about one hour in nine chunks) and D1 (C1 to C9).
// - startedFresh, notSaved and resetDone are new (NFR-06 asks for "a message"; no design exists).
// - savedPill follows wireframe 1e; notSavedPill is new.
export const startCopy = {
  heading: 'Get ready for your AVL trees lecture',
  intro:
    'About an hour, in nine short lessons you can stop and pick up again. You will see why search trees need balancing and how AVL trees keep themselves balanced, so the lecture makes sense first time.',
  bullets: [
    'Nine short lessons, one idea at a time',
    'Practice is private, retryable and never graded',
    'You finish with a list of questions to bring to the lecture',
  ],
  startButton: 'Start with a short warm-up check',

  resumeHeading: 'Welcome back.',
  /** `{module}` is replaced with the module ID and title, for example "C4 Search". */
  resumeLine: 'You stopped at {module}.',
  resumeButton: 'Resume',

  resetLink: 'Reset my progress',
  dialogTitle: 'Delete saved progress on this device?',
  dialogBody: "Your answers and lecture questions will be removed. This can't be undone.",
  cancelButton: 'Cancel',
  confirmButton: 'Reset',

  startedFresh: "We couldn't read your saved progress, so you're starting fresh.",
  notSaved: "This browser isn't saving your progress, so it will be gone when you close this tab.",
  resetDone: 'Your progress has been reset. You can start again whenever you like.',

  savedPill: 'Saved on this device',
  notSavedPill: 'Not being saved',
} as const
