// The content validator (live-content; ID 12.1 "A build-time validator checks every file", ID 12.2).
// Pure and total: it never throws, and every rule adds Problems. The engine cross-checks are in
// crossCheck.ts and run only when the structure is sound.
import { BALANCE_FORMULAS } from '../engine/conventions'
import { crossCheck } from './crossCheck'
import { keyKind, type RawKey } from './keys'
import { BLOOM_LEVELS, LESSON_OUTCOMES, OUTCOMES, type OutcomeId } from './outcomes'
import type { Content, Lesson, Problem, Question, Screen } from './types'

export const SCREEN_TYPES = [
  'intro', 'objectives', 'info', 'conventions', 'settings', 'question-set', 'route', 'task', 'predict', 'recall', 'animation',
  'rule', 'worked-example', 'diagram', 'pseudocode', 'practice', 'check', 'summary', 'report', 'free-text', 'certificate',
] as const

/** The content screen types this change draws; the rest wait for the questions change. */
export const CONTENT_SCREEN_TYPES = ['objectives', 'rule', 'diagram', 'worked-example', 'animation', 'pseudocode', 'summary'] as const

const COMMON = ['id', 'type', 'gagneEvent', 'merrillPhase', 'representation', 'title', 'text']

/** Every field each screen type may carry (the fields of the shipped content); anything else is an error. */
const FIELDS: Record<(typeof SCREEN_TYPES)[number], readonly string[]> = {
  animation: ['caption', 'compareWith', 'guided', 'inorderCheck', 'operation', 'pauseAt', 'pseudocode', 'result', 'roleSteps', 'show', 'steps', 'tree'],
  certificate: ['certificateFields'],
  check: ['checkId', 'optional'],
  conventions: ['caption', 'points', 'show', 'tree'],
  diagram: ['caption', 'compareWith', 'show', 'tree'],
  'free-text': ['stored'],
  info: ['points'],
  intro: [],
  objectives: ['objectives', 'points'],
  practice: ['pseudocode', 'show', 'stepCounter', 'task'],
  predict: ['answer', 'answerFrom', 'operation', 'options', 'reveal', 'show', 'tree'],
  pseudocode: ['pseudocode'],
  'question-set': ['questionSet'],
  recall: ['task'],
  report: ['report'],
  route: ['route'],
  rule: ['caption', 'chart', 'points', 'show', 'showRule', 'tree'],
  settings: ['points', 'settings'],
  summary: ['format', 'points', 'transfer'],
  task: ['task'],
  'worked-example': ['hint', 'order', 'show', 'steps', 'tree'],
}

const REPRESENTATIONS = ['text', 'static-diagram', 'written-rule', 'worked-example', 'animated-tree', 'interactive-task', 'pseudocode']
const QUESTION_TYPES = ['mcq', 'case-id', 'enter-values', 'click-node', 'trace', 'perform-rotation', 'build-tree']
const SHOW_ITEMS = ['height', 'balanceFactor', 'balanceFactor:root']
const OPERATIONS = ['search', 'insert', 'insert-sequence', 'rotations', 'delete']

/** ID 3.2: the Gagné events each Merrill phase holds. */
export const PHASE_EVENTS: Record<string, readonly number[]> = {
  problem: [1, 2],
  activation: [3],
  demonstration: [4, 5],
  application: [6, 7],
  integration: [8, 9],
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0
const isStrList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string')

export interface RawFiles {
  manifest: unknown
  /** Every JSON file found under src/live_content/, by its path relative to that folder. */
  files: Record<string, unknown>
}

export interface Validated {
  problems: Problem[]
  content?: Content
}

class Collector {
  problems: Problem[] = []
  add(file: string, message: string, id?: string, field?: string) {
    const p: Problem = { file, message }
    if (id !== undefined) p.id = id
    if (field !== undefined) p.field = field
    this.problems.push(p)
  }
}

/** The keys of an explicit `structure` tree: [key, left?, right?], children as lists or null. */
export function structureKeys(node: unknown): RawKey[] | null {
  if (node === null || node === undefined) return []
  if (!Array.isArray(node) || node.length < 1 || node.length > 3) return null
  const [key, left, right] = node as unknown[]
  if (typeof key !== 'number' && typeof key !== 'string') return null
  const l = structureKeys(left)
  const r = structureKeys(right)
  return l === null || r === null ? null : [key, ...l, ...r]
}

function checkTree(c: Collector, file: string, id: string, field: string, tree: unknown) {
  let keys: RawKey[] | null = null
  if (isObj(tree) && Array.isArray(tree.insert)) keys = tree.insert as RawKey[]
  else if (isObj(tree) && tree.structure !== undefined) keys = structureKeys(tree.structure)
  if (keys === null) return c.add(file, 'A tree must be an insertion sequence ("insert") or, when no insertion builds it, a "structure".', id, field)
  if (isObj(tree) && tree.rebalance !== undefined && typeof tree.rebalance !== 'boolean') c.add(file, '"rebalance" must be true or false.', id, `${field}.rebalance`)
  const kind = keyKind(keys)
  if (kind === 'mixed') c.add(file, 'A tree must not mix integer and letter keys.', id, field)
  if (kind === 'invalid') c.add(file, 'Tree keys must be integers or single capital letters.', id, field)
  if (new Set(keys).size !== keys.length) c.add(file, 'A tree must not repeat a key.', id, field)
}

function checkScreen(c: Collector, file: string, lesson: string, s: unknown, ids: Map<string, string>): s is Screen {
  if (!isObj(s)) {
    c.add(file, 'A screen must be an object.', lesson, 'screens')
    return false
  }
  const id = isStr(s.id) ? s.id : `${lesson}-?`
  if (!isStr(s.id)) c.add(file, 'A screen needs an "id".', lesson, 'id')
  seen(c, ids, file, id)
  if (!(SCREEN_TYPES as readonly string[]).includes(s.type as string)) {
    c.add(file, `The screen type "${String(s.type)}" is unknown.`, id, 'type')
    return false
  }
  const type = s.type as (typeof SCREEN_TYPES)[number]
  for (const f of ['gagneEvent', 'merrillPhase', 'representation']) if (s[f] === undefined) c.add(file, `The screen needs "${f}".`, id, f)
  const allowed = new Set([...COMMON, ...FIELDS[type]])
  for (const f of Object.keys(s)) if (!allowed.has(f)) c.add(file, `The field "${f}" is not known for a ${type} screen.`, id, f)
  if (s.representation !== undefined && !REPRESENTATIONS.includes(s.representation as string)) c.add(file, `The representation "${String(s.representation)}" is unknown.`, id, 'representation')
  const events = Array.isArray(s.gagneEvent) ? s.gagneEvent : [s.gagneEvent]
  const phase = s.merrillPhase as string
  if (PHASE_EVENTS[phase] === undefined) c.add(file, `The Merrill phase "${phase}" is unknown.`, id, 'merrillPhase')
  else if (!events.every((e) => typeof e === 'number' && PHASE_EVENTS[phase].includes(e)))
    c.add(file, `Gagné event ${events.join(', ')} does not belong to the Merrill phase "${phase}" (ID 3.2).`, id, 'gagneEvent')
  if (s.show !== undefined && !(isStrList(s.show) && s.show.every((x) => SHOW_ITEMS.includes(x)))) c.add(file, 'Unknown value in "show".', id, 'show')
  if (s.tree !== undefined) checkTree(c, file, id, 'tree', s.tree)
  if (isObj(s.compareWith) && s.compareWith.tree !== undefined) checkTree(c, file, id, 'compareWith.tree', s.compareWith.tree)
  if (type === 'animation') {
    if (!isObj(s.operation) || !OPERATIONS.includes(s.operation.name as string)) c.add(file, 'An animation needs a known "operation".', id, 'operation')
    if (!isStrList(s.steps)) c.add(file, 'An animation needs its "steps".', id, 'steps')
  }
  if ((type === 'worked-example' && !isStrList(s.steps)) || (type === 'pseudocode' && !isStrList(s.pseudocode)))
    c.add(file, `A ${type} screen needs its ${type === 'pseudocode' ? '"pseudocode" listings' : '"steps"'}.`, id)
  return true
}

function seen(c: Collector, ids: Map<string, string>, file: string, id: string) {
  const first = ids.get(id)
  if (first !== undefined) c.add(file, `The id "${id}" is used twice (also in ${first}).`, id, 'id')
  else ids.set(id, file)
}

function checkQuestionShape(c: Collector, file: string, q: unknown, ids: Map<string, string>): q is Question {
  if (!isObj(q)) {
    c.add(file, 'A question must be an object.')
    return false
  }
  const id = isStr(q.id) ? q.id : '?'
  seen(c, ids, file, id)
  for (const f of ['id', 'type', 'outcomeId', 'subSkill', 'level', 'stem', 'hint']) if (!isStr(q[f])) c.add(file, `The question needs "${f}".`, id, f)
  if (!isStrList(q.criteria) || q.criteria.length === 0) c.add(file, 'The question needs its "criteria".', id, 'criteria')
  if (isStr(q.type) && !QUESTION_TYPES.includes(q.type)) c.add(file, `The question type "${q.type}" is unknown.`, id, 'type')
  if (q.tree !== undefined) checkTree(c, file, id, 'tree', q.tree)
  return true
}

/** A question's related objectives; a return, re-check or review form inherits its original's. */
function relatedOutcomes(q: Question, byId: ReadonlyMap<string, Question>, depth = 0): string[] {
  if (Array.isArray(q.relatedOutcomes)) return q.relatedOutcomes as string[]
  const of = (q.returnOf ?? q.recheckOf ?? q.reviewOf) as string | undefined
  const original = of === undefined ? undefined : byId.get(of)
  return original === undefined || depth > 3 ? [] : relatedOutcomes(original, byId, depth + 1)
}

/** ID 5.1, 5.2, 12.2, 12.4: objective, criteria and Bloom level. */
function checkObjective(c: Collector, file: string, q: Question, byId: ReadonlyMap<string, Question> = new Map()) {
  const o = OUTCOMES[q.outcomeId as OutcomeId]
  if (o === undefined) return c.add(file, `The objective "${q.outcomeId}" is not one of LO1 to LO7 or PRE.`, q.id, 'outcomeId')
  // A combined question (ID 7.2 C9) may also cover the criteria of its related objectives.
  const allowed = new Set([q.outcomeId, ...relatedOutcomes(q, byId)])
  for (const cr of q.criteria ?? []) {
    const m = /^([A-Z0-9]+)\.(\d+)$/.exec(cr)
    const of = m === null ? undefined : OUTCOMES[m[1] as OutcomeId]
    if (m === null || of === undefined || !allowed.has(m[1]) || Number(m[2]) < 1 || Number(m[2]) > of.criteria)
      c.add(file, `The criterion "${cr}" is not a criterion of ${[...allowed].join(' or ')} (ID 5.2).`, q.id, 'criteria')
  }
  if (!(BLOOM_LEVELS as readonly string[]).includes(q.level)) c.add(file, `The Bloom level "${q.level}" is unknown.`, q.id, 'level')
  else if (o.levels !== null && !o.levels.includes(q.level)) c.add(file, `The level "${q.level}" does not match ${q.outcomeId} (${o.levels.join(' or ')}, ID 5.1).`, q.id, 'level')
}

export function validate(raw: RawFiles): Validated {
  const c = new Collector()
  const ids = new Map<string, string>()

  // Manifest: every listed file exists, every file is listed (ID 12.1).
  const listed = isObj(raw.manifest) && isStrList(raw.manifest.files) ? raw.manifest.files : []
  if (listed.length === 0) c.add('manifest.json', 'The manifest must list its files.', undefined, 'files')
  for (const f of listed) if (!(f in raw.files)) c.add(f, `${f} is listed in the manifest but missing.`)
  for (const f of Object.keys(raw.files)) if (f !== 'manifest.json' && !listed.includes(f)) c.add(f, `${f} is not in the manifest.`)
  if (c.problems.length > 0) return { problems: c.problems }

  const get = (f: string) => raw.files[f]
  const lessonFiles = listed.filter((f) => /^lessons\/c\d+\.json$/.test(f))
  const lessons: Lesson[] = []
  const fileOfLesson = new Map<string, string>()
  for (const f of lessonFiles) {
    const l = get(f)
    if (!isObj(l) || !isStr(l.id) || !isStr(l.title) || !Array.isArray(l.screens) || !isStrList(l.outcomeIds)) {
      c.add(f, 'A lesson needs "id", "title", "outcomeIds" and "screens".')
      continue
    }
    seen(c, ids, f, l.id)
    fileOfLesson.set(l.id, f)
    const screens = [...l.screens, ...(isObj(l.refresher) && Array.isArray(l.refresher.screens) ? l.refresher.screens : [])]
    for (const s of screens) {
      if (!checkScreen(c, f, l.id, s, ids)) continue
      for (const k of ['task', 'transfer'] as const) {
        const q = (s as Record<string, unknown>)[k]
        if (q !== undefined && checkQuestionShape(c, f, q, ids)) checkObjective(c, f, q)
      }
    }
    const expected = LESSON_OUTCOMES[l.id]
    if (expected !== undefined && [...l.outcomeIds].sort().join() !== [...expected].sort().join())
      c.add(f, `${l.id} teaches ${expected.join(', ') || 'the prerequisites'} (ID 7.1), not ${l.outcomeIds.join(', ') || 'none'}.`, l.id, 'outcomeIds')
    if (/^c[2-8]$/.test(l.id)) {
      const types = (l.screens as Record<string, unknown>[]).map((s) => s.type)
      if (!types.includes('objectives')) c.add(f, `${l.id} needs an objectives screen (ID 3.2).`, l.id, 'screens')
      if (types[types.length - 1] !== 'summary') c.add(f, `${l.id} must end with its summary screen.`, l.id, 'screens')
    }
    lessons.push(l as unknown as Lesson)
  }

  const conventions = get('conventions.json')
  if (!isObj(conventions) || BALANCE_FORMULAS[conventions.balanceFactor as string] === undefined)
    c.add('conventions.json', 'The balance factor must be "height(right) - height(left)" or "height(left) - height(right)".', undefined, 'balanceFactor')
  else {
    const update = (conventions.captions as Record<string, string> | undefined)?.update ?? ''
    const order = BALANCE_FORMULAS[conventions.balanceFactor as string]
    const hrFirst = update.indexOf('{hr}') < update.indexOf('{hl}')
    if ((order[0] === 'right') !== hrFirst) c.add('conventions.json', 'captions.update subtracts the heights in the other order from "balanceFactor".', undefined, 'captions.update')
  }

  const bank = (f: string) => {
    const d = get(f)
    const qs = isObj(d) && Array.isArray(d.questions) ? d.questions : []
    const out: Question[] = []
    for (const q of qs) if (checkQuestionShape(c, f, q, ids)) out.push(q)
    const byId = new Map(out.map((q) => [q.id, q]))
    for (const q of out) checkObjective(c, f, q, byId)
    return { d: (isObj(d) ? d : {}) as Record<string, unknown>, qs: out }
  }
  const checks = bank('questions/checks.json')
  const diagnostic = bank('questions/diagnostic.json')
  const readiness = bank('questions/readiness.json')
  const misconceptions = (isObj(get('misconceptions.json')) ? (get('misconceptions.json') as Record<string, unknown>).misconceptions : []) as Content['misconceptions']
  const scaffolds = (isObj(get('scaffolds.json')) ? (get('scaffolds.json') as Record<string, unknown>).scaffolds : []) as Content['scaffolds']
  for (const m of misconceptions ?? []) seen(c, ids, 'misconceptions.json', m.id)

  // References (ID 12.1, 12.2).
  const questionIds = new Set([...checks.qs, ...diagnostic.qs, ...readiness.qs].map((q) => q.id))
  const checkList = (Array.isArray(checks.d.checks) ? checks.d.checks : []) as Content['checks']['checks']
  const checkIds = new Set(checkList.map((k) => k.id))
  for (const k of checkList) {
    seen(c, ids, 'questions/checks.json', k.id)
    for (const q of [...k.questionIds, ...Object.values(k.reviewQuestionIds ?? {}).flat(), k.challengeId])
      if (!questionIds.has(q)) c.add('questions/checks.json', `The check ${k.id} names a question "${q}" that does not exist.`, k.id)
  }
  const misIds = new Set((misconceptions ?? []).map((m) => m.id))
  const skills = new Set((scaffolds ?? []).map((s) => s.subSkill))
  const concepts = isObj(conventions) && isObj(conventions.concepts) ? (conventions.concepts as Record<string, { screen: string }>) : {}
  const screenIds = new Set(lessons.flatMap((l) => [...l.screens, ...(l.refresher?.screens ?? [])].map((s) => s.id)))
  for (const [name, entry] of Object.entries(concepts)) if (!screenIds.has(entry.screen)) c.add('conventions.json', `The concept "${name}" links to a screen "${entry.screen}" that does not exist.`, name, 'screen')
  const allQuestions: [string, Question][] = [
    ...checks.qs.map((q) => ['questions/checks.json', q] as [string, Question]),
    ...diagnostic.qs.map((q) => ['questions/diagnostic.json', q] as [string, Question]),
    ...readiness.qs.map((q) => ['questions/readiness.json', q] as [string, Question]),
    ...lessons.flatMap((l) =>
      l.screens.flatMap((s) =>
        ['task', 'transfer'].map((k) => (s as Record<string, unknown>)[k]).filter((q): q is Question => isObj(q)).map((q) => [fileOfLesson.get(l.id)!, q] as [string, Question]),
      ),
    ),
  ]
  for (const [f, q] of allQuestions) {
    for (const o of q.options ?? []) {
      if (o.id !== q.correctOptionId && o.misconceptionId === undefined && q.type === 'mcq') c.add(f, `The wrong option "${o.id}" names no misconception (ID 9.5).`, q.id, 'options')
      if (o.misconceptionId !== undefined && !misIds.has(o.misconceptionId)) c.add(f, `The option "${o.id}" names a misconception "${o.misconceptionId}" that does not exist.`, q.id, 'options')
    }
    for (const w of q.wrongAnswers ?? []) if (w.misconceptionId !== undefined && !misIds.has(w.misconceptionId)) c.add(f, `A wrong answer names a misconception "${w.misconceptionId}" that does not exist.`, q.id, 'wrongAnswers')
    if (q.outcomeId !== 'PRE' && !skills.has(q.subSkill)) c.add(f, `The sub-skill "${q.subSkill}" has no scaffold.`, q.id, 'subSkill')
    if (!(q.concept in concepts)) c.add(f, `The concept "${q.concept}" is not in conventions.json.`, q.id, 'concept')
  }
  for (const l of lessons) {
    for (const s of l.screens) {
      const ref = (s as { checkId?: string }).checkId
      if (ref !== undefined && !checkIds.has(ref)) c.add(fileOfLesson.get(l.id)!, `The check "${ref}" does not exist.`, s.id, 'checkId')
    }
    if (l.checkId !== undefined && !checkIds.has(l.checkId)) c.add(fileOfLesson.get(l.id)!, `The check "${l.checkId}" does not exist.`, l.id, 'checkId')
  }

  if (c.problems.length > 0) return { problems: c.problems }
  const content: Content = {
    lessons,
    checks: { checks: checkList, questions: checks.qs },
    diagnostic: { ...(diagnostic.d as object), questions: diagnostic.qs } as Content['diagnostic'],
    readiness: { ...(readiness.d as object), questions: readiness.qs } as Content['readiness'],
    misconceptions,
    scaffolds,
    rewards: (get('rewards.json') ?? {}) as Record<string, unknown>,
    conventions: conventions as Record<string, unknown>,
  }
  const engine = crossCheck(content, (id) => fileOfLesson.get(id) ?? `lessons/${id}.json`)
  return engine.length > 0 ? { problems: engine } : { problems: [], content }
}
