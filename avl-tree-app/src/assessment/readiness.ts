// The C9 readiness session (add-readiness-c9, design decision 4; FR-ASM-06, FR-ASM-07, D9, D14, D20).
// Every readiness item once in bank order, then each missed item again as the question model's next
// attempt, up to READINESS_RETURNS times. No scaffold ladder in C9 (proposal item 5). Pure, no React:
// the session holds only IDs and numbers, and each instance is rebuilt from the item, seed and attempt.
import { READINESS } from '../content/questions/readiness'
import { variantSeed } from '../engine/generate'
import { READINESS_RETURNS } from '../modules/config'
import type { Attempt, Confidence } from '../state/learnerState'
import { attemptRecord } from './attempt'
import { instantiate } from './instantiate'
import { mark } from './mark'
import type { BankItem, Instance, Mark, Response } from './types'

/** Seed slot the two combined items share, so the search item searches the tree the build item builds. */
const COMBINED_SLOT = 0x0c9

export interface QueueEntry {
  itemId: string
  attempt: number
}

export interface ReadinessSession {
  seed: number
  /** What is still to come; the head is the current item. */
  queue: QueueEntry[]
  /** Misses waiting for their return, in the order they were missed. */
  missed: QueueEntry[]
  phase: 'first' | 'returns' | 'done'
}

export type ReadinessAction = { type: 'answer'; response: Response; at: string; confidence?: Confidence } | { type: 'skip' }

export interface ReadinessStepResult {
  session: ReadinessSession
  /** Present when an answer was marked, including an unreadable one. */
  mark?: Mark
  /** The learner-storage record of a readable answer. */
  attempt?: Attempt
}

/** The seed an item is drawn from in a session. The combined items share one. */
export function itemSeed(seed: number, item: BankItem, index: number): number {
  return variantSeed(seed, item.combined === true ? COMBINED_SLOT : index)
}

export function startReadiness(seed: number, items: readonly BankItem[] = READINESS): ReadinessSession {
  return { seed, queue: items.map((i) => ({ itemId: i.id, attempt: 0 })), missed: [], phase: items.length === 0 ? 'done' : 'first' }
}

/** The current item's instance, or null when the session is done. */
export function readinessInstance(session: ReadinessSession, items: readonly BankItem[] = READINESS): Instance | null {
  const head = session.queue[0]
  if (head === undefined) return null
  const index = items.findIndex((i) => i.id === head.itemId)
  const item = items[index]
  return instantiate(item, itemSeed(session.seed, item, index), head.attempt)
}

/** Drop the head; when the queue empties, start the waiting returns or finish. */
function advance(session: ReadinessSession, missed: QueueEntry[]): ReadinessSession {
  const queue = session.queue.slice(1)
  if (queue.length > 0) return { ...session, queue, missed }
  if (missed.length > 0) return { ...session, queue: missed, missed: [], phase: 'returns' }
  return { ...session, queue: [], missed: [], phase: 'done' }
}

export function readinessStep(session: ReadinessSession, action: ReadinessAction, items: readonly BankItem[] = READINESS): ReadinessStepResult {
  const head = session.queue[0]
  if (head === undefined) return { session }
  const item = items.find((i) => i.id === head.itemId)!

  if (action.type === 'skip') {
    // D4, D20: only the optional item may be skipped; it records nothing and never returns.
    return item.optional === true ? { session: advance(session, session.missed) } : { session }
  }

  const inst = readinessInstance(session, items)!
  const m = mark(inst, action.response)
  if (m.status === 'unreadable') return { session, mark: m }

  const meta = { hintsUsed: 0, at: action.at, ...(action.confidence !== undefined ? { confidence: action.confidence } : {}) }
  const attempt = attemptRecord(inst, action.response, m, meta) ?? undefined
  const returns = m.status === 'not-yet' && head.attempt < READINESS_RETURNS
  const missed = returns ? [...session.missed, { itemId: head.itemId, attempt: head.attempt + 1 }] : session.missed
  return { session: advance(session, missed), mark: m, attempt }
}
