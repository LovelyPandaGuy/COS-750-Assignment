// Wording for the hub, module screens and skeleton screens (add-routing-and-screen-skeleton).
// FLAGGED FOR THE USER TO READ: none of this comes from the ID content. Headings and labels
// follow wireframes 1c to 1o; the "coming" line, link labels and title suffix are new.
// No mark, grade, pass, fail, test or score words (FR-DIA-05).
import type { PathStatus } from '../progress'
import type { Activity } from '../routes'
import type { ModuleId } from '../state/learnerState'

export const screenCopy = {
  titleSuffix: 'AVL Primer',

  hub: {
    heading: 'Your path',
    mapLabel: 'Progress map',
    status: {
      done: { symbol: '✓', word: 'Done' },
      current: { symbol: '▶', word: 'You are here' },
      next: { symbol: '○', word: 'Up next' },
      later: { symbol: '○', word: 'Later' },
    } satisfies Record<PathStatus, { symbol: string; word: string }>,
    optional: 'Optional',
    summaryLink: 'Readiness summary',
    continue: (module: string) => `Continue: ${module}`,
    sandboxHeading: 'Sandbox',
    sandboxText: 'Try inserting your own keys.',
    sandboxLink: 'Open sandbox',
  },

  activity: {
    listLabel: 'Activities',
    /** "Explore · 1 of 3" */
    place: (label: string, n: number, total: number) => `${label} · ${n} of ${total}`,
    /** "Explore (1 of 3)" for the breadcrumb. */
    crumbPlace: (label: string, n: number, total: number) => `${label} (${n} of ${total})`,
    labels: {
      explore: 'Explore',
      example: 'Worked example',
      check: 'Check',
      refresher: 'BST refresher',
    } satisfies Record<Activity, string>,
    /** C1's check is the warm-up (D6, wireframe 1c). */
    warmUpCheck: 'Warm-up check',
  },

  crumbs: {
    hub: 'Your path',
    sandbox: 'Sandbox',
    readiness: 'Your readiness',
    warmUpResult: 'Result',
  },

  headings: {
    warmUpResult: "Here's where you're starting from",
    sandbox: 'Sandbox',
    readiness: 'Ready for the lecture?',
  },

  links: {
    backToPath: 'Back to path',
    backToPathSandbox: '← Back to path',
    toRefresher: 'Go to the BST refresher',
    toWarmUp: 'Back to the warm-up check',
  },

  actions: { sandbox: 'Sandbox', lectureQuestions: 'Lecture questions' },

  coming: 'This screen is coming in a later step.',
} as const

/** "› C5 Rotations › Explore (1 of 3)" (wireframe breadcrumbs). */
export function breadcrumb(...parts: string[]): string {
  return parts.map((p) => `› ${p}`).join(' ')
}

/** The label of an activity in a module; C1's check is the warm-up (wireframe 1c). */
export function activityLabel(module: ModuleId, activity: Activity): string {
  return module === 'C1' && activity === 'check' ? screenCopy.activity.warmUpCheck : screenCopy.activity.labels[activity]
}
