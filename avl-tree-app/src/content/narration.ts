// Narration wording (add-narration, D145 to D148). FLAGGED FOR THE USER TO READ: UI labels and one
// note written for this change; no teaching text. What is read aloud is the screen's own text.
export const narrationCopy = {
  /** The accessible name of the control group. */
  group: 'Read this screen aloud',
  readAloud: 'Read aloud',
  pause: 'Pause',
  resume: 'Resume',
  stop: 'Stop',
  /** Shown under the switch when the device has no on-device voice (NFR-05: online voices are never used). */
  unavailable: 'This device has no built-in voice that works offline, so reading aloud is not available here.',
} as const
