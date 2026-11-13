// The bank validator (add-question-model-and-bank, design decision 8; FR-ASM-02, FR-ASM-03, D19).
// Pure and never throws: every problem is reported.
import { SCAFFOLDS, type ScaffoldContent } from '../content/questions/scaffolds'
import { MISCONCEPTIONS, type MisconceptionEntry } from '../content/questions/misconceptions'
import { OUTCOMES, type OutcomeEntry } from '../content/questions/outcomes'
import { SUB_SKILLS, type SubSkillEntry } from '../content/questions/subSkills'
import { BALANCE_RANGE, EMPTY_HEIGHT, LEAF_HEIGHT } from '../engine/conventions'
import { numbersIn, statesConvention, VALIDATION_WORDING, type Problem } from '../modules/validate'
import { MODULE_IDS, type ModuleId } from '../state/learnerState'
import { BLOOM_LEVELS, LO_IDS, type LoId } from './ids'
import { instantiate } from './instantiate'
import { KINDS } from './kinds'
import type { BankItem, Instance, Kind, KindName } from './types'

export interface BankRecords {
  outcomes: Record<LoId, OutcomeEntry>
  subSkills: Record<string, SubSkillEntry>
  misconceptions: Record<string, MisconceptionEntry>
}

export interface ValidateOptions {
  seeds?: readonly number[]
  kinds?: Record<KindName, Kind>
  records?: BankRecords
  scaffolds?: ScaffoldContent
}

const DEFAULT_SEEDS = Array.from({ length: 100 }, (_, i) => i)
const DEFAULT_RECORDS: BankRecords = { outcomes: OUTCOMES, subSkills: SUB_SKILLS, misconceptions: MISCONCEPTIONS }
/** D27: feedback never judges. */
const JUDGING = /\b(?:wrong|fail\w*|incorrect)\b/i
/** FR-ASM-01: modules with a check, and how many items each has. */
const CHECK_MODULES: readonly ModuleId[] = ['C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']
const ITEMS_PER_CHECK = { min: 2, max: 3 }
/** D4: the only module whose check is optional. */
const OPTIONAL_MODULE: ModuleId = 'C7'

const isOneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === 'string' && (list as readonly string[]).includes(v)

function tagProblems(item: BankItem, records: BankRecords, kinds: Record<KindName, Kind>): Problem[] {
  const out: Problem[] = []
  const tag = (name: string, detail: string) => out.push({ kind: 'tag', step: item.id, value: name, message: `${item.id}: ${name} ${detail}` })
  if (!isOneOf(MODULE_IDS, item.module)) tag('module', `"${String(item.module)}" is not a module`)
  if (!isOneOf(LO_IDS, item.outcome)) tag('outcome', `"${String(item.outcome)}" is not LO1 to LO9`)
  const skill = records.subSkills[item.subSkill]
  if (!item.subSkill || skill === undefined) tag('subSkill', `"${item.subSkill}" is missing or unknown`)
  else if (skill.outcome !== item.outcome) tag('subSkill', `"${item.subSkill}" belongs to ${skill.outcome}, not ${item.outcome}`)
  if (!isOneOf(BLOOM_LEVELS, item.level)) tag('level', `"${String(item.level)}" is not a Bloom level`)
  else if (isOneOf(LO_IDS, item.outcome) && !records.outcomes[item.outcome].levels.includes(item.level)) {
    tag('level', `"${item.level}" is not a level the ID gives ${item.outcome}`)
  }
  if (kinds[item.kind] === undefined) tag('kind', `"${String(item.kind)}" is not a kind`)
  return out
}

function whyProblems(item: BankItem, kind: Kind, records: BankRecords): Problem[] {
  const out: Problem[] = []
  const add = (value: string, message: string) => out.push({ kind: 'misconception', step: item.id, value, message: `${item.id}: ${message}` })
  if (item.why.correct === undefined) add('correct', 'no explanation for the correct answer')
  if (kind.type !== 'choice' && item.why.other === undefined) add('other', 'no explanation for other answers')
  for (const m of kind.misconceptions) {
    if (records.misconceptions[m] === undefined) add(m, `${m} is not in the catalogue`)
    if (item.why[m] === undefined) add(m, `no explanation for ${m}, which its kind can produce`)
  }
  return out
}

/** Every text an instance shows. */
function textsOf(inst: Instance): string[] {
  return [
    inst.stem,
    inst.correctExplanation,
    inst.otherExplanation ?? '',
    ...(inst.options ?? []).flatMap((o) => [o.text, o.explanation]),
    ...(inst.known ?? []).map((k) => k.explanation),
  ].filter((t) => t !== '')
}

function instanceProblems(item: BankItem, inst: Instance, check: Instance, records: BankRecords): Problem[] {
  const out: Problem[] = []
  const add = (kind: Problem['kind'], message: string, value?: string | number) => {
    const p: Problem = { kind, step: item.id, message: `${item.id} seed ${inst.seed}: ${message}` }
    if (value !== undefined) p.value = value
    out.push(p)
  }

  if (inst.type === 'choice') {
    const opts = inst.options ?? []
    if (opts.length < 2) add('option', 'fewer than two options')
    if (new Set(opts.map((o) => o.text)).size !== opts.length) add('option', 'two options share a text')
    if (opts.filter((o) => o.correct).length !== 1) add('option', 'not exactly one correct option')
    for (const o of opts) {
      if (typeof o.value === 'string' && item.optionText === undefined) add('option', `option ${o.id} needs optionText`)
      if (o.explanation.trim() === '') add('option', `option ${o.id} has no explanation`)
      if (!o.correct && (o.misconceptionId === undefined || records.misconceptions[o.misconceptionId] === undefined)) {
        add('option', `option ${o.id} has no catalogue misconception`)
      }
    }
  } else {
    for (const k of inst.known ?? []) if (k.explanation.trim() === '') add('misconception', `no explanation for ${k.misconception}`)
  }

  const allowed = new Set<number>([LEAF_HEIGHT, EMPTY_HEIGHT, ...BALANCE_RANGE, ...inst.numbers])
  for (const o of inst.options ?? []) if (typeof o.value === 'number') allowed.add(o.value)
  for (const text of textsOf(check)) {
    if (statesConvention(text)) add('wording', `"${text}" states sign, lean or case wording (D19)`, text)
    if (JUDGING.test(text)) add('wording', `"${text}" uses judging words (D27)`, text)
    for (const n of numbersIn(text)) if (!allowed.has(n)) add('number', `${n} in "${text}" is not a fact of the instance`, n)
  }
  return out
}

/** Item-level checks: tags, explanations, and every instance over the seeds. */
export function validateItems(items: readonly BankItem[], options: ValidateOptions = {}): Problem[] {
  const seeds = options.seeds ?? DEFAULT_SEEDS
  const kinds = options.kinds ?? KINDS
  const records = options.records ?? DEFAULT_RECORDS
  const problems: Problem[] = []
  const seen = new Set<string>()
  const push = (p: Problem) => {
    // One report per distinct problem, not one per seed.
    const key = `${p.kind}|${p.step}|${String(p.value ?? p.message)}`
    if (!seen.has(key)) {
      seen.add(key)
      problems.push(p)
    }
  }

  const ids = new Set<string>()
  for (const item of items) {
    if (ids.has(item.id)) push({ kind: 'bank', step: item.id, message: `duplicate item ID ${item.id}` })
    ids.add(item.id)
    tagProblems(item, records, kinds).forEach(push)
    const kind = kinds[item.kind]
    if (kind === undefined) continue
    whyProblems(item, kind, records).forEach(push)
    for (const seed of seeds) {
      try {
        const inst = instantiate(item, seed, 0, { kinds })
        const check = instantiate(item, seed, 0, { kinds, wording: VALIDATION_WORDING })
        instanceProblems(item, inst, check, records).forEach(push)
      } catch (e) {
        push({ kind: 'bank', step: item.id, value: seed, message: `${item.id} seed ${seed}: cannot be built (${(e as Error).message})` })
      }
    }
  }
  return problems
}

/** Every misconception and used sub-skill has a hint and a lecture question, and their text keeps the wording rules (FR-SCA-02, D19). */
function scaffoldProblems(items: readonly BankItem[], options: ValidateOptions): Problem[] {
  const content = options.scaffolds ?? SCAFFOLDS
  const records = options.records ?? DEFAULT_RECORDS
  const out: Problem[] = []
  const add = (value: string, message: string) => out.push({ kind: 'scaffold', value, message })
  for (const m of Object.keys(records.misconceptions)) {
    if (content.hints[m] === undefined) add(m, `${m} has no hint`)
    if (content.lecture[m] === undefined) add(m, `${m} has no lecture-question template`)
  }
  for (const skill of new Set(items.map((i) => i.subSkill))) {
    if (content.subSkillHints[skill] === undefined) add(skill, `sub-skill ${skill} has no fallback hint`)
    if (content.subSkillLecture[skill] === undefined) add(skill, `sub-skill ${skill} has no fallback lecture-question template`)
  }
  const kinds = options.kinds ?? KINDS
  const seen = new Set<string>()
  for (const item of items) {
    const kind = kinds[item.kind]
    if (kind === undefined) continue
    for (const seed of options.seeds ?? DEFAULT_SEEDS) {
      let inst: Instance
      try {
        inst = instantiate(item, seed, 0, { kinds, wording: VALIDATION_WORDING })
      } catch {
        continue
      }
      const allowed = new Set<number>([LEAF_HEIGHT, EMPTY_HEIGHT, ...BALANCE_RANGE, ...inst.numbers])
      for (const mis of [...kind.misconceptions, undefined]) {
        const texts = [
          (mis !== undefined ? content.hints[mis] : undefined) ?? content.subSkillHints[item.subSkill],
          (mis !== undefined ? content.lecture[mis] : undefined) ?? content.subSkillLecture[item.subSkill],
        ]
          .filter((fn) => fn !== undefined)
          .map((fn) => fn(inst.facts, VALIDATION_WORDING))
        for (const text of texts) {
          const bad = statesConvention(text) ? 'states sign, lean or case wording (D19)' : JUDGING.test(text) ? 'uses judging words (D27)' : numbersIn(text).some((n) => !allowed.has(n)) ? 'has a number that is not a fact of the instance' : null
          const key = `${item.id}|${text}`
          if (bad !== null && !seen.has(key)) {
            seen.add(key)
            out.push({ kind: 'scaffold', step: item.id, value: text, message: `${item.id}: "${text}" ${bad}` })
          }
        }
      }
    }
  }
  return out
}

/** The whole bank: item checks, then per-module counts, optional flags and catalogue coverage. */
export function validateBank(items: readonly BankItem[], options: ValidateOptions = {}): Problem[] {
  const problems = [...validateItems(items, options), ...scaffoldProblems(items, options)]
  const records = options.records ?? DEFAULT_RECORDS
  for (const m of MODULE_IDS) {
    const n = items.filter((i) => i.module === m).length
    const [min, max] = CHECK_MODULES.includes(m) ? [ITEMS_PER_CHECK.min, ITEMS_PER_CHECK.max] : [0, 0]
    if (n < min || n > max) problems.push({ kind: 'bank', value: m, message: `${m} has ${n} items; it needs ${min} to ${max}` })
  }
  for (const i of items) {
    if ((i.optional === true) !== (i.module === OPTIONAL_MODULE)) {
      problems.push({ kind: 'bank', step: i.id, message: `${i.id}: only ${OPTIONAL_MODULE} items are optional` })
    }
  }
  const produced = new Set<string>()
  for (const item of items) {
    if ((options.kinds ?? KINDS)[item.kind] === undefined) continue
    for (const seed of options.seeds ?? DEFAULT_SEEDS) {
      try {
        const inst = instantiate(item, seed, 0, { kinds: options.kinds })
        for (const o of inst.options ?? []) if (o.misconceptionId) produced.add(o.misconceptionId)
        for (const k of inst.known ?? []) produced.add(k.misconception)
      } catch {
        // already reported by validateItems
      }
    }
  }
  for (const m of Object.keys(records.misconceptions)) {
    if (!produced.has(m)) problems.push({ kind: 'misconception', value: m, message: `${m} is never produced by any item` })
  }
  return problems
}
