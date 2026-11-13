// Module content as data (add-modules-c2-c3, design decision 1). A module is an ordered list of
// steps typed by Gagné event (D10); the activity of a step follows from its event.
import type { Key } from '../engine/tree'
import type { Activity } from '../routes'
import type { ModuleId } from '../state/learnerState'
import type { ConventionsWording } from '../content/modules/conventionsWording'
import type { PredictionKind } from '../practice/predict'
import type { StepFacts } from './facts'

export const GAGNE_EVENTS = ['hook', 'goals', 'recall', 'content', 'example', 'practice', 'check', 'summary'] as const
export type GagneEvent = (typeof GAGNE_EVENTS)[number]

/** The three activities a module step can live in (routes.ts has C1's refresher too). */
export type StepActivity = Extract<Activity, 'explore' | 'example' | 'check'>

/** Which activity each event belongs to (proposal, item 2). One table. */
export const EVENT_ACTIVITY: Record<GagneEvent, StepActivity> = {
  hook: 'explore',
  goals: 'explore',
  recall: 'explore',
  content: 'explore',
  example: 'example',
  practice: 'example',
  check: 'check',
  summary: 'check',
}

export const STEP_ACTIVITIES: readonly StepActivity[] = ['explore', 'example', 'check']

/** Events that offer "I know this, skip" (D20). */
export const SKIPPABLE_EVENTS: readonly GagneEvent[] = ['content', 'example']

/** D22: one primary representation per step. Animation is a replay; pseudocode is listings (add-module-c4-search). */
export type Representation = 'diagram' | 'text' | 'pseudocode' | 'animation'

export type GeneratorName = 'fill-in' | 'root-looks-fine' | 'single-rotation' | 'double-rotation' | 'insert-rebalance'

/** One single rotation at the node with key `at` (add-modules-c5-c6). */
export interface RotationSpec {
  dir: 'left' | 'right'
  at: Key
}

export type TreeSource =
  | { kind: 'bst'; keys: readonly Key[] }
  | { kind: 'avl'; keys: readonly Key[] }
  /** Keys into a plain BST, then each rotation in order, performed by the engine. */
  | { kind: 'rotated'; keys: readonly Key[]; rotations: readonly RotationSpec[] }
  | { kind: 'practice'; generator: GeneratorName }
  /** Keys into a plain BST or an AVL tree, then each key in `remove` deleted by the engine (add-module-c7-delete). */
  | { kind: 'deleted'; build: 'bst' | 'avl'; keys: readonly Key[]; remove: readonly Key[]; rebalance: boolean }
  /** An AVL tree of `keys`, then `key` inserted plainly (`rebalance: false`) or with the AVL insert (add-module-c6-insertion-and-rebalancing). */
  | { kind: 'inserted'; keys: readonly Key[]; key: Key; rebalance: boolean }

export interface FigureSpec {
  id: string
  source: TreeSource
  /** A key to search for; its step count becomes a fact. */
  searchKey?: Key
  /** Accessible name of the drawing. */
  label: string
}

export type ClaimKind = 'avl' | 'not-avl' | 'perfect' | 'not-perfect' | 'root-in-range' | 'one-violation' | 'bst' | 'multi-rebalance'

export type Claim =
  | { figure: string; is: ClaimKind }
  /** The figure has the same in-order key sequence as figure `as` of the same step. */
  | { figure: string; is: 'same-order'; as: string }

export interface Allowance {
  value: number
  reason: string
}

export type PracticeKind = 'fill-in-bf' | 'spot-the-problem' | 'rotate' | 'scenario' | 'trace-search' | 'after-delete' | 'name-case'

/** Pseudocode listings a step can show side by side (names in src/content/pseudocode.ts). */
export type ListingName = 'insert' | 'searchLoop' | 'searchRecursive'

/** A sorted array drawn as a row of cells and searched with binary search (add-module-c8-choosing). */
export interface ArraySpec {
  id: string
  /** Any order; the facts sort them. */
  keys: readonly Key[]
  searchKey: Key
  /** Accessible name of the drawing. */
  label: string
}

export interface Step {
  id: string
  event: GagneEvent
  heading: string
  primary: Representation
  figures?: readonly FigureSpec[]
  /** Tree sizes whose best and worst search step counts become facts. */
  bounds?: readonly number[]
  /** Paragraphs, built only from facts and wording. */
  text: (facts: StepFacts, wording: ConventionsWording) => string[]
  /** Supporting rule text, shown on demand (D22, D23). */
  rule?: (wording: ConventionsWording, facts: StepFacts) => string
  claims?: readonly Claim[]
  allow?: readonly Allowance[]
  practice?: PracticeKind
  /** Sorted arrays to draw; their probe counts become facts. */
  arrays?: readonly ArraySpec[]
  /** Show the comparison table built from the structure record. */
  table?: 'structures'
  /** A scenario worked through on this step; its answer and reasons become facts. */
  scenario?: string
  /** Scenario practice draws one of these by seed. */
  scenarios?: readonly string[]
  /**
   * Play an operation on one of this step's figures as a replay in place of the figure (D33): a
   * search for its `searchKey`, or, with `insert`, an AVL insert of that key. `predict` asks for a
   * prediction first and `doItYourself` offers the Watch or Do it yourself switch; both need `insert`
   * (add-insert-replay).
   */
  replay?: { figure: string; insert?: Key; predict?: PredictionKind; doItYourself?: boolean }
  /** Listings shown side by side, no line lit. */
  listings?: readonly ListingName[]
  /** "Be the algorithm": search for a key that is in the seeded tree, or one that is not. */
  searchPractice?: 'found' | 'missing'
  /** A bank item shown as this step's question (set by the player on its question steps, never by content). */
  checkItem?: string
}

export interface ModuleContent {
  id: ModuleId
  steps: Step[]
}

export function activityOf(step: Step): StepActivity {
  return EVENT_ACTIVITY[step.event]
}

/** The steps of one activity, in module order. */
export function stepsFor(content: ModuleContent, activity: StepActivity): Step[] {
  return content.steps.filter((s) => activityOf(s) === activity)
}
