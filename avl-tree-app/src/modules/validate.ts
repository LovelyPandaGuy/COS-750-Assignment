// The content validator (design decision 3). Pure: a test runs it over every registered module.
import { analyseTree } from '../engine/analyse'
import { BALANCE_RANGE, EMPTY_HEIGHT, LEAF_HEIGHT } from '../engine/conventions'
import { conventionsWording, type ConventionsWording } from '../content/modules/conventionsWording'
import { NEEDS, SCENARIOS, STRUCTURES } from '../content/modules/structures'
import { answersOf, NEED_IDS, STRUCTURE_IDS, type Scenario, type StructureRecord } from './compare'
import { rootInRange, type FigureFacts, type StepFacts } from './facts'
import { renderStep } from './render'
import { STEP_ACTIVITIES, activityOf, type ClaimKind, type GagneEvent, type ModuleContent, type Step } from './schema'

export type ProblemKind = 'order' | 'activity' | 'source' | 'claim' | 'number' | 'wording' | 'scenario'

export interface Problem {
  kind: ProblemKind
  step?: string
  message: string
  value?: number | string
}

const RANK: Record<GagneEvent, number> = {
  hook: 0,
  goals: 1,
  recall: 2,
  content: 3,
  example: 3,
  practice: 3,
  check: 4,
  summary: 5,
}
const ONCE: readonly GagneEvent[] = ['hook', 'goals', 'check', 'summary']

function orderProblems(steps: Step[]): Problem[] {
  const problems: Problem[] = []
  const count = (e: GagneEvent) => steps.filter((s) => s.event === e).length
  for (const e of ONCE) {
    const n = count(e)
    if (n !== 1) problems.push({ kind: 'order', message: `${e} appears ${n} times; it must appear exactly once` })
  }
  if (count('recall') === 0) problems.push({ kind: 'order', message: 'recall is missing; at least one is needed' })
  for (let i = 0; i + 1 < steps.length; i++) {
    const [a, b] = [steps[i], steps[i + 1]]
    if (RANK[a.event] > RANK[b.event]) {
      problems.push({ kind: 'order', step: a.id, message: `${a.id} (${a.event}) comes before ${b.id} (${b.event})` })
    }
  }
  return problems
}

function activityProblems(steps: Step[]): Problem[] {
  const problems: Problem[] = []
  const index = (s: Step) => STEP_ACTIVITIES.indexOf(activityOf(s))
  for (let i = 0; i + 1 < steps.length; i++) {
    const [a, b] = [steps[i], steps[i + 1]]
    if (index(a) > index(b)) {
      problems.push({ kind: 'activity', step: a.id, message: `${a.id} (${activityOf(a)}) comes before ${b.id} (${activityOf(b)})` })
    }
  }
  for (const activity of STEP_ACTIVITIES) {
    if (!steps.some((s) => activityOf(s) === activity)) problems.push({ kind: 'activity', message: `${activity} has no steps` })
  }
  return problems
}

const CLAIM: Record<ClaimKind, (f: FigureFacts) => boolean> = {
  avl: (f) => f.isAvl,
  'not-avl': (f) => !f.isAvl,
  perfect: (f) => f.isPerfect,
  'not-perfect': (f) => !f.isPerfect,
  'root-in-range': rootInRange,
  'one-violation': (f) => f.violations.length === 1,
  bst: (f) => analyseTree(f.tree).orderViolations.length === 0,
}

const sameOrder = (a: FigureFacts, b: FigureFacts) => a.inOrder.length === b.inOrder.length && a.inOrder.every((k, i) => k === b.inOrder[i])

/** Rotations in a figure's source that the engine could not perform. */
function sourceProblems(step: Step, facts: StepFacts): Problem[] {
  return Object.values(facts.figures).flatMap((f) =>
    f.sourceProblems.map((m): Problem => ({ kind: 'source', step: step.id, value: f.id, message: `figure ${f.id}: ${m}` })),
  )
}

function claimProblems(step: Step, facts: StepFacts): Problem[] {
  return (step.claims ?? []).flatMap((c): Problem[] => {
    const f = facts.figures[c.figure]
    if (f === undefined) return [{ kind: 'claim', step: step.id, value: c.figure, message: `claim on unknown figure ${c.figure}` }]
    if (c.is === 'same-order') {
      const other = facts.figures[c.as]
      if (other === undefined) return [{ kind: 'claim', step: step.id, value: c.as, message: `claim on unknown figure ${c.as}` }]
      return sameOrder(f, other)
        ? []
        : [{ kind: 'claim', step: step.id, value: c.is, message: `figure ${c.figure} does not have the same in-order keys as figure ${c.as}` }]
    }
    return CLAIM[c.is](f) ? [] : [{ kind: 'claim', step: step.id, value: c.is, message: `figure ${c.figure} is not ${c.is.toUpperCase()}` }]
  })
}

/** Every number in the step's facts: figure values, keys, per-node values and bounds. */
function factNumbers(facts: StepFacts, into: Set<number>): Set<number> {
  const add = (...ns: (number | null | undefined)[]) => ns.forEach((n) => typeof n === 'number' && into.add(n))
  for (const f of Object.values(facts.figures)) {
    add(f.height, f.nodeCount, f.rootKey, f.rootBalance, f.searchKey, f.searchSteps, f.avlRootKey, ...f.keys, ...f.violations)
    for (const r of f.rebalances) add(r.key, r.node, r.rotations)
    add(f.rebalances.length)
    for (const [key, n] of Object.entries(f.nodes)) add(Number(key), n.height, n.balanceFactor, n.leftHeight, n.rightHeight)
  }
  for (const b of facts.bounds) add(b.n, b.best, b.worst)
  for (const a of Object.values(facts.arrays)) add(a.searchKey, a.probeCount, a.sorted.length, ...a.sorted)
  return into
}

const IDS = /\b(?:NFR-\d+|FR-[A-Z]+-\d+|LO\d+|C\d+|D\d+)\b/g
const NUMBER = /[−-]?\d[\d,]*(?:\.\d+)?/g

/** The conventions wording may say what content may not; remove it before scanning. */
function stripWording(text: string): string {
  const w = conventionsWording()
  const known = [w.formula, w.rangeText, w.heightRule, ...[-3, -2, -1, 0, 1, 2, 3].map(w.leanPhrase), CASE_MARK]
  return known.reduce((t, s) => t.split(s).join(' '), text)
}

/**
 * Case names reach text only through the wording (D19). The validator renders with a marker in
 * place of each case name and strips it, so a name typed into content is still caught.
 */
const CASE_MARK = '\u27e8case\u27e9'
const VALIDATION_WORDING: ConventionsWording = { ...conventionsWording(), caseName: () => CASE_MARK }

export function numbersIn(text: string): number[] {
  const cleaned = stripWording(text).replace(IDS, ' ').replace(/log2/g, ' ')
  return (cleaned.match(NUMBER) ?? []).map((m) => Number(m.replace(/,+$/, '').replace(/,/g, '').replace('−', '-')))
}

function numberProblems(step: Step, texts: string[], facts: StepFacts): Problem[] {
  const allowed = factNumbers(facts, new Set<number>([LEAF_HEIGHT, EMPTY_HEIGHT, ...BALANCE_RANGE]))
  for (const a of step.allow ?? []) allowed.add(a.value)
  const problems: Problem[] = []
  for (const text of texts) {
    for (const n of numbersIn(text)) {
      if (!allowed.has(n)) {
        problems.push({ kind: 'number', step: step.id, value: n, message: `${n} in "${text}" is not a fact, key or allowance` })
      }
    }
  }
  return problems
}

/** D19: sign, lean and case wording belongs to the conventions wording only. */
const BANNED: readonly RegExp[] = [
  /\bleft\s+minus\s+right\b/i,
  /\bright\s+minus\s+left\b/i,
  /height\s*\(\s*(?:the\s+)?(?:left|right)[^)]*\)\s*[−-]/i,
  /\bleans?\s+(?:to\s+the\s+)?(?:left|right)\b/i,
  /\b(?:left|right)-heavy\b/i,
  /\b(?:LL|RR|LR|RL)\b/,
  /\b(?:left-left|right-right|left-right|right-left)\b/i,
  /\b(?:positive|negative)\b[^.]{0,60}\b(?:left|right)\b/i,
]

function wordingProblems(step: Step, texts: string[]): Problem[] {
  const problems: Problem[] = []
  for (const text of texts) {
    const cleaned = stripWording(text)
    const hit = BANNED.find((re) => re.test(cleaned))
    if (hit) problems.push({ kind: 'wording', step: step.id, value: text, message: `"${text}" states sign, lean or case wording (D19)` })
  }
  return problems
}

/** Words that would give a scenario's answer away (design decision 4). */
function namePatterns(record: StructureRecord): RegExp[] {
  const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return [
    ...STRUCTURE_IDS.map((id) => new RegExp(escape(record[id].name), 'i')),
    /\b(?:BST|AVL)\b/i,
    /\barrays?\b/i,
    /\bhash/i,
    /red-black/i,
  ]
}

/**
 * A scenario is valid when exactly one structure meets every need, every need is known, and its
 * text names no structure (and no Red-Black tree). Its text also passes the number and D19 scans.
 */
export function validateScenarios(scenarios: readonly Scenario[], record: StructureRecord = STRUCTURES, step?: string): Problem[] {
  const problems: Problem[] = []
  const names = namePatterns(record)
  const known = new Set<string>(NEED_IDS)
  for (const sc of scenarios) {
    const at = (message: string): Problem => ({ kind: 'scenario', ...(step !== undefined && { step }), value: sc.id, message })
    const unknown = sc.needs.filter((n) => !known.has(n) || NEEDS[n] === undefined)
    if (unknown.length > 0) {
      problems.push(at(`scenario ${sc.id} lists unknown needs: ${unknown.join(', ')}`))
      continue
    }
    const answers = answersOf(sc, record)
    if (answers.length !== 1) {
      const which = answers.length === 0 ? 'no structure' : answers.map((a) => record[a].name).join(' and ')
      problems.push(at(`scenario ${sc.id} needs to have one answer; ${which} meets every need`))
    }
    if (names.some((re) => re.test(sc.text))) problems.push(at(`scenario ${sc.id} names a structure in its text`))
  }
  return problems
}

/** Scenarios a step uses: the worked one and the practice list. Unknown ids are problems. */
function stepScenarioProblems(step: Step): Problem[] {
  const ids = [...(step.scenario === undefined ? [] : [step.scenario]), ...(step.scenarios ?? [])]
  const problems: Problem[] = []
  const found: Scenario[] = []
  for (const id of ids) {
    const sc = SCENARIOS[id]
    if (sc === undefined) problems.push({ kind: 'scenario', step: step.id, value: id, message: `unknown scenario ${id}` })
    else found.push(sc)
  }
  if (step.practice === 'scenario' && ids.length === 0) {
    problems.push({ kind: 'scenario', step: step.id, message: 'scenario practice lists no scenarios' })
  }
  const texts = found.map((sc) => sc.text)
  const none: StepFacts = { figures: {}, bounds: [], arrays: {}, scenarios: {} }
  return [...problems, ...validateScenarios(found, STRUCTURES, step.id), ...numberProblems(step, texts, none), ...wordingProblems(step, texts)]
}

export function validateModule(content: ModuleContent): Problem[] {
  const problems = [...orderProblems(content.steps), ...activityProblems(content.steps)]
  for (const step of content.steps) {
    const r = renderStep(step, 0, undefined, VALIDATION_WORDING)
    const texts = [r.heading, ...r.paragraphs, ...(r.rule === null ? [] : [r.rule]), ...r.labels]
    problems.push(
      ...sourceProblems(step, r.facts),
      ...claimProblems(step, r.facts),
      ...numberProblems(step, texts, r.facts),
      ...wordingProblems(step, texts),
      ...stepScenarioProblems(step),
    )
  }
  return problems
}
