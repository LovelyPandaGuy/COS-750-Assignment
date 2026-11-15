// The state matrix manifest (ui-quality-sweep: ui-foundation "State matrix", "Quality bar 1"; design
// decision 1; D150). One entry is one page in one state. The matrix spec renders every entry at the three
// widths in light and dark; the mode tests reuse the same list. Adding a screen or state is one entry.
// Plain data: imported by Playwright (tests/visual/matrix.spec.ts) and by Vitest (the coverage test).
// Playwright cannot load src modules that import JSON (the package is an ES module and Node needs an import
// attribute), so labels are strings here and the coverage test checks each against its content file, and
// every picked option is checked against the engine's marking there. JSON is read with require.
import { createRequire } from 'node:module'
import type { Settings } from '../../../src/state/storage'
import type { SeedName } from './seed'

/** The wireframe frames with a screen spec in .claude/docs/design/screens/. */
export const FRAMES = ['1a', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1j', '1k', '1l', '1m', '1n', '1o', '1p'] as const
export type Frame = (typeof FRAMES)[number]

export const CAPABILITIES = ['ui-question', 'ui-feedback', 'ui-progress', 'ui-readiness', 'tree-view', 'tree-controls', 'tree-editor'] as const
export type Capability = (typeof CAPABILITIES)[number]

/** Scripted steps after the page loads (run by actions.ts). Labels come from content, never typed here. */
export type Action =
  /** Go to the screen at this index with Next (the lesson outline is retired, revamp-navigation). */
  | { screen: number }
  /** Choose this option of this question; the coverage test checks the engine marks it as `expect`. */
  | { pick: string; question: string; expect: 'right' | 'not-yet' }
  | { confidence: 'sure' | 'unsure' }
  /** Press the button with this accessible name (exact). */
  | { button: string }
  /** Open the Lessons sidebar's button if it is shown (below 768 px); nothing beside the page (D155). */
  | { sidebar: 'open' }
  /** Click the first element matching this CSS selector. */
  | { click: string }
  /** Sandbox: set rebalancing, then insert these keys one by one. */
  | { sandbox: { rebalance: boolean; keys: number[] } }

export interface Entry {
  id: string
  /** The route inside the app (HashRouter), or `gallery:<data attribute>` for a gallery section. */
  route: string
  seed: SeedName
  settings?: Partial<Settings>
  steps?: Action[]
  frame?: Frame
  /** The lesson screen type this entry shows, for the screen-type coverage. */
  screenType?: string
  /** Component states this entry shows, by capability; the wording matches the capability's spec list. */
  states?: Partial<Record<Capability, string[]>>
}

type RawScreen = { id: string; type: string; title: string }
type RawLesson = { id: string; screens: RawScreen[]; refresher?: { screens: RawScreen[] } }
const require = createRequire(import.meta.url)
export const LESSONS: RawLesson[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'].map((id) => require(`../../../src/live_content/lessons/${id}.json`) as RawLesson)
const [c1, c2] = LESSONS

const GATED = new Set(['check', 'question-set'])
const moduleOf = (lessonId: string) => `/module/${lessonId.toUpperCase()}`

/**
 * The first screen of each screen type, in lesson order (C1 to C9, then the refresher). A gated type is shown
 * unanswered (seed started); every other type with everything answered, so Next can reach it.
 */
function screenTypeEntries(): Entry[] {
  const seen = new Map<string, Entry>()
  for (const l of LESSONS) {
    l.screens.forEach((s, i) => {
      if (seen.has(s.type)) return
      seen.set(s.type, {
        id: `screen-${s.type}`,
        route: moduleOf(l.id),
        seed: GATED.has(s.type) ? 'started' : 'everything',
        steps: i === 0 ? [] : [{ screen: i }],
        screenType: s.type,
      })
    })
  }
  for (const l of LESSONS) {
    l.refresher?.screens.forEach((s, i) => {
      if (seen.has(s.type)) return
      seen.set(s.type, { id: `screen-${s.type}`, route: `${moduleOf(l.id)}/refresher`, seed: 'started', steps: i === 0 ? [] : [{ screen: i }], screenType: s.type })
    })
  }
  return [...seen.values()]
}

const idx = (lesson: RawLesson, type: string) => lesson.screens.findIndex((s) => s.type === type)
const C2_CHECK = idx(c2, 'check')
const C1_SET = idx(c1, 'question-set')
const C1_ROUTE = idx(c1, 'route')
const firstAnimation = (() => {
  for (const l of LESSONS) {
    const i = idx(l, 'animation')
    if (i !== -1) return { route: moduleOf(l.id), index: i }
  }
  throw new Error('no animation screen')
})()
/**
 * Names the steps and checks use. Each is checked against its content file by the coverage test
 * (tests/ui/quality/matrix-coverage.test.ts), so a wording change fails there, loudly.
 */
export const LABELS = {
  RETRY: 'Try again', // conventions.json feedback.nextStepRetry
  HINT: 'Hint', // lessonCopy.controls.hint
  NEXT_STEP: 'Next step', // lessonCopy.animation.next
  DESCRIBE: 'Describe tree', // treeViewCopy.describeButton
  CHECK: 'Check answer', // lessonCopy.questions.checkAnswer
  RESET: 'Reset my progress', // startCopy.resetLink
  INSERT: 'Insert', // sandboxCopy.insert
  NEXT: 'Next', // lessonCopy.controls.next
  LESSONS: 'Lessons', // shellCopy.sidebar.menuButton
  TITLE_SUFFIX: 'AVL Primer', // screenCopy.titleSuffix
} as const
const { RETRY, HINT, NEXT_STEP, DESCRIBE, CHECK, RESET } = LABELS
/** C2's first check question: options the engine marks right and not yet (checked in the coverage test). */
const RIGHT: Action = { pick: 'c', question: 'chk2-01', expect: 'right' }
const NOT_YET: Action = { pick: 'a', question: 'chk2-01', expect: 'not-yet' }

const answerNotYet: Action[] = [NOT_YET, { confidence: 'sure' }, { button: CHECK }]

export const ENTRIES: Entry[] = [
  // ---- Routes (src/routes.ts patterns) ----
  { id: 'start-first-visit', route: '/', seed: 'firstVisit', frame: '1b', states: { 'ui-progress': ['first visit'] } },
  { id: 'start-returning', route: '/', seed: 'returning', frame: '1b', states: { 'ui-progress': ['returning with saved progress'] } },
  { id: 'start-storage-unavailable', route: '/', seed: 'storageUnavailable', states: { 'ui-progress': ['storage unavailable (session-only)'] } },
  { id: 'start-reset-open', route: '/', seed: 'returning', steps: [{ button: RESET }], frame: '1b', states: { 'ui-progress': ['the reset confirmation open'] } },
  // The path page is removed (remove-path-page, D159): /path redirects to the current lesson.
  { id: 'legacy-path', route: '/path', seed: 'returning' },
  { id: 'module-c3-start', route: '/module/C3', seed: 'started' },
  { id: 'module-c3-sidebar-open', route: '/module/C3', seed: 'started', steps: [{ screen: 3 }, { sidebar: 'open' }] },
  { id: 'refresher', route: '/module/C1/refresher', seed: 'diagnosticMixed' },
  { id: 'warm-up-result', route: '/module/C1/check/result', seed: 'diagnosticMixed' },
  { id: 'sandbox', route: '/sandbox', seed: 'started', states: { 'tree-view': ['empty tree'] } },
  { id: 'sandbox-balanced', route: '/sandbox', seed: 'started', steps: [{ sandbox: { rebalance: true, keys: [2, 1, 3] } }], states: { 'tree-view': ['balanced tree'] } },
  {
    id: 'sandbox-chain',
    route: '/sandbox',
    seed: 'started',
    steps: [{ sandbox: { rebalance: false, keys: [1, 2, 3, 4, 5, 6, 7] } }],
    frame: '1n',
    states: { 'tree-view': ['a tree with a node out of balance'] },
  },
  { id: 'sandbox-wide', route: '/sandbox', seed: 'started', steps: [{ sandbox: { rebalance: false, keys: [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15] } }], states: { 'tree-view': ['a tree wider than the phone'] } },
  { id: 'sandbox-described', route: '/sandbox', seed: 'started', steps: [{ sandbox: { rebalance: true, keys: [2, 1, 3] } }, { button: DESCRIBE }], states: { 'tree-view': ['the description open'] } },
  { id: 'readiness-ready', route: '/readiness', seed: 'everything', frame: '1o', states: { 'ui-readiness': ['overall Ready'] } },
  { id: 'readiness-revise', route: '/readiness', seed: 'readyRevise', frame: '1o', states: { 'ui-readiness': ['overall Revise'] } },

  // ---- Lesson screen types (the first screen of each) ----
  ...screenTypeEntries(),

  // ---- Lesson states ----
  { id: 'c1-diagnostic', route: '/module/C1', seed: 'started', steps: [{ screen: C1_SET }], frame: '1c' },
  { id: 'c1-result-needs-review', route: '/module/C1', seed: 'diagnosticMixed', steps: [{ screen: C1_ROUTE }], frame: '1d' },
  { id: 'c1-result-all-secure', route: '/module/C1', seed: 'diagnosticSecure', steps: [{ screen: C1_ROUTE }], frame: '1d' },
  { id: 'animation-first-step', route: firstAnimation.route, seed: 'everything', steps: [{ screen: firstAnimation.index }], states: { 'tree-controls': ['at the first step', 'disabled controls'] } },
  {
    id: 'animation-mid-replay',
    route: firstAnimation.route,
    seed: 'everything',
    steps: [{ screen: firstAnimation.index }, { button: NEXT_STEP }, { button: NEXT_STEP }],
    frame: '1f',
    states: { 'tree-controls': ['mid-replay'], 'tree-view': ['each node role (new, rotating, n)'] },
  },
  {
    id: 'check-unanswered',
    route: '/module/C2',
    seed: 'started',
    steps: [{ screen: C2_CHECK }],
    states: { 'ui-question': ['unanswered', 'disabled Check answer'] },
  },
  { id: 'check-selected', route: '/module/C2', seed: 'started', steps: [{ screen: C2_CHECK }, RIGHT], states: { 'ui-question': ['an option selected'] } },
  {
    id: 'check-confidence',
    route: '/module/C2',
    seed: 'started',
    steps: [{ screen: C2_CHECK }, RIGHT, { confidence: 'sure' }],
    states: { 'ui-question': ['confidence chosen'] },
  },
  {
    id: 'check-right',
    route: '/module/C2',
    seed: 'started',
    steps: [{ screen: C2_CHECK }, RIGHT, { confidence: 'sure' }, { button: CHECK }],
    frame: '1i',
    states: { 'ui-question': ['after "That\'s right"'] },
  },
  {
    id: 'check-not-yet-hint',
    route: '/module/C2',
    seed: 'started',
    steps: [{ screen: C2_CHECK }, ...answerNotYet, { button: HINT }],
    frame: '1j',
    states: { 'ui-question': ['after "Not quite"'] },
  },
  {
    id: 'check-cap',
    route: '/module/C2',
    seed: 'started',
    steps: [{ screen: C2_CHECK }, ...answerNotYet, { button: RETRY }, ...answerNotYet],
    frame: '1l',
    states: { 'ui-question': ['at the attempt cap with the answer shown'] },
  },

  // ---- Gallery component states (src/gallery; one entry shows many cells) ----
  {
    id: 'gallery-learn',
    route: 'gallery:data-learn-gallery',
    seed: 'started',
    states: {
      'ui-feedback': ['each FeedbackPanel variant', 'FullAnswer', 'LectureQuestionDraft empty and saved', 'ScaffoldPanel at each rung', 'the Hint button with hints left and with none'],
    },
  },
  // Frame 1e (Unit hub) lives only in the gallery now that the path page is removed (remove-path-page, D159).
  { id: 'gallery-progress', route: 'gallery:data-progress-gallery', seed: 'started', frame: '1e', states: { 'ui-progress': ['each lesson state (done, current, open, locked)'] } },
  { id: 'gallery-progress-menu-open', route: 'gallery:data-progress-gallery', seed: 'started', steps: [{ click: '[data-gallery-menu] .lesson-menu-button' }], states: { 'ui-progress': ['the lesson menu open'] } },
  { id: 'gallery-readiness', route: 'gallery:data-readiness-gallery', seed: 'started', states: { 'ui-readiness': ['no flags', 'no questions'] } },
  { id: 'gallery-narration', route: 'gallery:data-narration-gallery', seed: 'started' },
]

/**
 * States no entry reaches yet, with the reason. Each is an audit input (task 2.1): a state a script cannot
 * reach, or a frame state whose component is not built, is a finding, not a gap to hide.
 */
export const OPEN_STATES: Partial<Record<Capability, Record<string, string>>> = {
  'ui-question': { 'after "Almost there"': 'Needs a multi-part answer marked partial; no script picks one yet, and the gallery has no partial FeedbackPanel.' },
  'ui-feedback': {},
  'ui-readiness': {
    'one question being edited': 'Needs a scripted edit in the lecture questions list; not scripted yet.',
    'the copy fallback shown': 'Shown only when the Clipboard API fails; Playwright cannot make it fail without app code.',
    'the print view': 'Checked by the print mode test (task 1.4), not by a screenshot entry.',
  },
  'tree-controls': {
    'at the last step': 'Needs Next step pressed to the end; the step count varies by screen. Not scripted yet.',
    playing: 'The lesson animations have no autoplay; there is no playing state to show.',
    paused: 'The lesson animations have no autoplay; there is no paused state to show.',
  },
  'tree-editor': {
    empty: 'TreeEditor renders only for build-tree answers inside checks; the first is behind other checks. Not scripted yet.',
    'a node selected': 'Needs tree-editor scripting (pointer or keyboard). Not scripted yet.',
    'an empty slot targeted': 'Needs tree-editor scripting. Not scripted yet.',
    'a rotation offered': 'Needs tree-editor scripting. Not scripted yet.',
    'after an undo': 'Needs tree-editor scripting. Not scripted yet.',
    'keyboard mode with the instructions shown': 'Needs tree-editor scripting. Not scripted yet.',
  },
}

/** Frame states (from each screen spec's "States") with no entry, and why. */
export const OPEN_FRAME_STATES: Partial<Record<Frame, string>> = {
  '1a': 'The screen flow diagram, not a screen.',
  '1c': 'The sub-skill stepper and Skip are DiagnosticStepper (a stub); the live C1 question set has neither.',
  '1d': 'RouteRecommendation is a stub; the live C1 route screen is shown instead.',
  '1e': 'Not built as a page (D159); its components are in the progress gallery. PathModeToggle is a stub.',
  '1f': 'Speed, the three representations and read-aloud in the replay are not built (RepresentationSwitcher is a stub).',
  '1g': 'PredictPrompt and PredictionReveal are stubs; the live predict screen is covered as screen-predict.',
  '1h': 'Perform-the-rotation is a check answer type behind other checks; not scripted yet.',
  '1k': 'The three-rung ladder and guided step-through (ScaffoldLadder, GuidedStepThrough) are stubs; checks allow two attempts (D107).',
  '1m': 'The trace-an-insert editor (TreeEditor in a build-tree check) is not scripted yet; see tree-editor.',
  '1p': 'Assumptions and open questions, not a screen.',
}
