// Marking for each answer type (add-question-model-and-bank, design decision 4). Pure.
import type { Tree } from '../engine/tree'
import { parseWhole } from '../modules/practice'
import { sameShape, shapeKey } from './shape'
import type { Instance, Mark, Response } from './types'

const inOrder = (t: Tree): number[] => (t === null ? [] : [...inOrder(t.left), t.key, ...inOrder(t.right)])

/** Index of the first insert or rotation step of the trace the student's tree does not reach. */
function divergence(inst: Instance, student: Tree): number | undefined {
  const steps = (inst.trace ?? []).filter((s) => s.kind === 'insert' || s.kind === 'rotation')
  if (steps.length === 0) return undefined
  // Stopped early: the tree equals a snapshot, so the next step is where it parts.
  for (let i = steps.length - 1; i >= 0; i--) {
    if (sameShape(steps[i].after, student)) return steps[i + 1]?.index
  }
  const keys = inOrder(student).join(',')
  if (keys !== inOrder(steps[steps.length - 1].after).join(',')) return steps[0].index
  return (steps.find((s) => s.kind === 'rotation') ?? steps[0]).index
}

export function mark(inst: Instance, response: Response): Mark {
  if ('choice' in response) {
    const option = inst.options?.find((o) => o.id === response.choice)
    if (option === undefined) return { status: 'unreadable', explanation: '' }
    const m: Mark = { status: option.correct ? 'correct' : 'not-yet', explanation: option.explanation }
    if (option.misconceptionId !== undefined) m.misconceptionId = option.misconceptionId
    return m
  }

  if ('number' in response) {
    const n = parseWhole(response.number)
    if (n === null) return { status: 'unreadable', explanation: '' }
    if (n === inst.answer) return { status: 'correct', explanation: inst.correctExplanation }
    const known = inst.known?.find((k) => k.value === n)
    return known !== undefined
      ? { status: 'not-yet', misconceptionId: known.misconception, explanation: known.explanation }
      : { status: 'not-yet', explanation: inst.otherExplanation ?? '' }
  }

  const student = response.tree
  if (sameShape(student, inst.answer as Tree)) return { status: 'correct', explanation: inst.correctExplanation }
  const known = inst.known?.find((k) => shapeKey(k.value as Tree) === shapeKey(student))
  const m: Mark = known !== undefined
    ? { status: 'not-yet', misconceptionId: known.misconception, explanation: known.explanation }
    : { status: 'not-yet', explanation: inst.otherExplanation ?? '' }
  const at = divergence(inst, student)
  if (at !== undefined) {
    m.divergedAt = at
    m.divergedKind = inst.trace![at].kind
  }
  return m
}
