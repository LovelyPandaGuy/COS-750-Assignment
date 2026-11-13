/**
 * Learner state model (SE §6.3) and its validation on load (NFR-06).
 * Plain TypeScript: no React and no browser storage here.
 */

export const SCHEMA_VERSION = 1

/** Module IDs from decision D1. */
export const MODULE_IDS = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'] as const
export type ModuleId = (typeof MODULE_IDS)[number]

export const LEARNER_PATHS = ['guided', 'diagnostic-skipped'] as const
export type LearnerPath = (typeof LEARNER_PATHS)[number]

export const SUB_SKILL_STATUSES = ['secure', 'developing', 'not-yet'] as const
export type SubSkillStatus = (typeof SUB_SKILL_STATUSES)[number]

export const CONFIDENCE_LEVELS = ['sure', 'unsure'] as const
export type Confidence = (typeof CONFIDENCE_LEVELS)[number]

export const NICKNAME_MAX_LENGTH = 24

export interface Attempt {
  questionId: string
  at: string
  answer: unknown
  correct: boolean
  confidence?: Confidence
  misconceptionId?: string
  hintsUsed: number
}

/** A question the student wants to ask in the lecture, drafted at the retry cap (FR-SCA-03, D9). */
export interface LectureQuestion {
  questionId: string
  module: ModuleId
  /** ISO time it was drafted. */
  at: string
  text: string
  misconceptionId?: string
}

export interface LearnerState {
  schemaVersion: number
  profileId: string
  nickname?: string
  path: LearnerPath
  currentModule: ModuleId
  completedModules: ModuleId[]
  attempts: Attempt[]
  subSkillStatus: Record<string, SubSkillStatus>
  lectureQuestions: LectureQuestion[]
}

/** A fresh state for a new anonymous profile (FR-ONB-02). */
export function freshLearnerState(profileId: string): LearnerState {
  return {
    schemaVersion: SCHEMA_VERSION,
    profileId,
    path: 'guided',
    currentModule: 'C1',
    completedModules: [],
    attempts: [],
    subSkillStatus: {},
    lectureQuestions: [],
  }
}

/** Trim, cap at 24 characters, and treat blank as no nickname. */
export function normaliseNickname(nickname: string | undefined): string | undefined {
  if (nickname === undefined) return undefined
  const trimmed = nickname.trim().slice(0, NICKNAME_MAX_LENGTH)
  return trimmed === '' ? undefined : trimmed
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.length > 0

const isOneOf = <T extends string>(values: readonly T[], v: unknown): v is T =>
  typeof v === 'string' && (values as readonly string[]).includes(v)

function parseAttempt(raw: unknown): Attempt | null {
  if (!isObject(raw)) return null
  const { questionId, at, answer, correct, confidence, misconceptionId, hintsUsed } = raw
  if (!isNonEmptyString(questionId)) return null
  if (typeof at !== 'string' || Number.isNaN(Date.parse(at))) return null
  // `answer` is `unknown` (SE §6.3). An undefined answer is dropped by JSON,
  // so a missing key is read back as undefined rather than as corruption.
  if (typeof correct !== 'boolean') return null
  if (typeof hintsUsed !== 'number' || !Number.isInteger(hintsUsed) || hintsUsed < 0) return null
  const attempt: Attempt = { questionId, at, answer, correct, hintsUsed }
  if (confidence !== undefined) {
    if (!isOneOf(CONFIDENCE_LEVELS, confidence)) return null
    attempt.confidence = confidence
  }
  if (misconceptionId !== undefined) {
    if (!isNonEmptyString(misconceptionId)) return null
    attempt.misconceptionId = misconceptionId
  }
  return attempt
}

function parseLectureQuestion(raw: unknown): LectureQuestion | null {
  if (!isObject(raw)) return null
  const { questionId, module, at, text, misconceptionId } = raw
  if (!isNonEmptyString(questionId)) return null
  if (!isOneOf(MODULE_IDS, module)) return null
  if (typeof at !== 'string' || Number.isNaN(Date.parse(at))) return null
  if (!isNonEmptyString(text)) return null
  const question: LectureQuestion = { questionId, module, at, text }
  if (misconceptionId !== undefined) {
    if (!isNonEmptyString(misconceptionId)) return null
    question.misconceptionId = misconceptionId
  }
  return question
}

/**
 * Validate an unknown value as learner state. Returns a new object holding
 * only the model's fields (extra fields are dropped), or null if anything is
 * missing, of the wrong type or value, or from another schema version.
 */
export function parseLearnerState(raw: unknown): LearnerState | null {
  if (!isObject(raw)) return null
  if (raw.schemaVersion !== SCHEMA_VERSION) return null
  if (!isNonEmptyString(raw.profileId)) return null
  if (raw.nickname !== undefined && typeof raw.nickname !== 'string') return null
  if (!isOneOf(LEARNER_PATHS, raw.path)) return null
  if (!isOneOf(MODULE_IDS, raw.currentModule)) return null

  if (!Array.isArray(raw.completedModules)) return null
  const completedModules: ModuleId[] = []
  for (const m of raw.completedModules) {
    if (!isOneOf(MODULE_IDS, m)) return null
    completedModules.push(m)
  }

  if (!Array.isArray(raw.attempts)) return null
  const attempts: Attempt[] = []
  for (const a of raw.attempts) {
    const attempt = parseAttempt(a)
    if (attempt === null) return null
    attempts.push(attempt)
  }

  if (!isObject(raw.subSkillStatus)) return null
  const statusEntries: [string, SubSkillStatus][] = []
  for (const [skill, status] of Object.entries(raw.subSkillStatus)) {
    if (!isOneOf(SUB_SKILL_STATUSES, status)) return null
    statusEntries.push([skill, status])
  }
  // fromEntries defines own properties, so a key such as "__proto__" is kept
  // instead of hitting the prototype setter.
  const subSkillStatus: Record<string, SubSkillStatus> = Object.fromEntries(statusEntries)

  // Added after schema version 1 shipped: a state stored without it reads as an empty list (D18).
  const lectureQuestions: LectureQuestion[] = []
  if (raw.lectureQuestions !== undefined) {
    if (!Array.isArray(raw.lectureQuestions)) return null
    for (const q of raw.lectureQuestions) {
      const question = parseLectureQuestion(q)
      if (question === null) return null
      lectureQuestions.push(question)
    }
  }

  const state: LearnerState = {
    schemaVersion: SCHEMA_VERSION,
    profileId: raw.profileId,
    path: raw.path,
    currentModule: raw.currentModule,
    completedModules,
    attempts,
    subSkillStatus,
    lectureQuestions,
  }
  const nickname = normaliseNickname(raw.nickname as string | undefined)
  if (nickname !== undefined) state.nickname = nickname
  return state
}
