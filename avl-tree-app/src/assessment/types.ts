// The question model (add-question-model-and-bank, design decision 2). Items are templates: a kind
// builds the problem and every answer from the engine; the item adds only wording.
import type { ConventionsWording } from '../content/modules/conventionsWording'
import type { Key, Tree } from '../engine/tree'
import type { TraceKind, TraceStep } from '../engine/trace'
import type { Scenario } from '../modules/compare'
import type { ModuleId } from '../state/learnerState'
import type { AnswerType, BloomLevel, LoId, MisconceptionId } from './ids'

export type { AnswerType, BloomLevel, LoId, MisconceptionId } from './ids'

export type KindName =
  | 'bst-height'
  | 'sorted-search'
  | 'node-height'
  | 'balance-factor'
  | 'is-avl'
  | 'search-visits'
  | 'rotation-result'
  | 'rotations-needed'
  | 'lowest-unbalanced'
  | 'rebalance-case'
  | 'insert-final-tree'
  | 'delete-rebalances'
  | 'delete-root'
  | 'scenario-choice'

export interface KindParams {
  /** search-visits: a key that is in the tree, or one that is not. */
  found?: boolean
  /** scenario-choice: the scenario IDs to draw from. */
  scenarios?: readonly string[]
}

/** A value a choice option stands for: a key or count, or a token such as 'yes', a case or a structure. */
export type OptionValue = string | number

/** What a problem is about. Every number the item's text may show is listed in `Built.numbers`. */
export interface KindFacts {
  /** The tree shown with the question (null when the question shows none). */
  tree: Tree
  /** Keys in insert order, when the question lists them. */
  keys: Key[]
  /** The key searched for, inserted, deleted, rotated at or marked. */
  target?: Key
  /** Rotation direction (rotation-result). */
  dir?: 'left' | 'right'
  /** Named engine values the wording may use: heights, balance factors, counts. */
  values: Record<string, number>
  scenario?: Scenario
}

export interface WrongValue {
  value: OptionValue | Tree
  misconception: MisconceptionId
}

export interface Built {
  facts: KindFacts
  /** Every number the item's text may show. */
  numbers: number[]
  /** Identity of the problem, so a retry can be made to differ. */
  signature: string
  answer: OptionValue | Tree
  /** Choice: the distractors. Number and tree: the values to recognise. */
  wrong: WrongValue[]
  /** Tree kinds: the engine's insert trace, for naming where a student's tree diverges. */
  trace?: TraceStep[]
}

export interface Kind {
  type: AnswerType
  /** Every misconception this kind can produce; an item needs a `why` for each. */
  misconceptions: readonly MisconceptionId[]
  build(seed: number, params?: KindParams): Built
}

export type Wording<R = string> = (facts: KindFacts, w: ConventionsWording, value?: OptionValue) => R

export interface BankItem {
  id: string
  module: ModuleId
  kind: KindName
  params?: KindParams
  outcome: LoId
  subSkill: string
  level: BloomLevel
  /** Never blocks progress (C7, D4). */
  optional?: boolean
  stem: Wording
  /** Text of a choice option whose value is not a number (yes or no, a case, a structure). */
  optionText?: Wording
  /** 'correct', 'other' (number items) and one entry per misconception the kind can produce. */
  why: Partial<Record<string, Wording>>
}

export interface Option {
  /** `opt-` plus the value, so marking does not depend on the shuffle. */
  id: string
  value: OptionValue
  text: string
  correct: boolean
  misconceptionId?: MisconceptionId
  explanation: string
}

/** A recognised wrong number or tree, with its explanation. */
export interface KnownWrong {
  value: number | Tree
  misconception: MisconceptionId
  explanation: string
}

export interface Instance {
  itemId: string
  seed: number
  attempt: number
  /** The seed the problem was built from. */
  variant: number
  type: AnswerType
  stem: string
  facts: KindFacts
  signature: string
  answer: OptionValue | Tree
  options?: Option[]
  known?: KnownWrong[]
  correctExplanation: string
  /** Number items: for any other wrong number. */
  otherExplanation?: string
  trace?: TraceStep[]
  numbers: number[]
}

export type Response = { choice: string } | { number: string } | { tree: Tree }

export interface Mark {
  status: 'correct' | 'not-yet' | 'unreadable'
  misconceptionId?: MisconceptionId
  explanation: string
  /** Tree items: index into the instance's trace of the first step the student's tree does not reach. */
  divergedAt?: number
  divergedKind?: TraceKind
}
